// ============================================================================
//  AI PROVIDER RESOLUTION
// ============================================================================
//  The app can talk to EITHER OpenAI directly OR OpenRouter (which proxies many
//  models behind one API) OR any custom OpenAI-compatible endpoint. The provider
//  is detected from the key prefix, so whichever key is in the OPENAI_API_KEY env
//  var just works:
//
//      sk-or-...     -> OpenRouter   (https://openrouter.ai/api/v1)
//      sk-proj-...   -> OpenAI
//      sk-...        -> OpenAI
//
//  CUSTOM ENDPOINTS: set AI_BASE_URL to any OpenAI-compatible base URL to bypass
//  the detection above entirely (Groq, Together, Google, a self-hosted gateway...):
//
//      AI_BASE_URL=https://api.groq.com/openai/v1
//      AI_API_KEY=gsk_...            (optional: falls back to OPENAI_API_KEY)
//
//  IMPORTANT: AI_BASE_URL must be reachable FROM THE SERVER. A localhost address
//  (http://localhost:3001) only exists on the machine running that gateway — a
//  deployed site cannot reach it. See README notes in the handoff doc.
//
//  Why this file exists: keys were being sent to api.openai.com even when they
//  came from OpenRouter, and OpenAI answered
//  "Incorrect API key provided: sk-or-v1***". The request must go to the
//  provider that issued the key.
//
//  OpenRouter also needs provider-prefixed model names ("openai/gpt-4o-mini"),
//  so model ids are rewritten automatically by resolveModel().
//
//  Server-only: reads process.env, so never import this into client code.
// ============================================================================

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

/**
 * Figures out which provider the configured key belongs to.
 * @returns {{apiKey: string, isOpenRouter: boolean, url: string, name: string} | null}
 *          null when no key is configured.
 */
export function getAiProvider() {
  // Custom OpenAI-compatible endpoint wins when configured.
  const baseUrl = (process.env.AI_BASE_URL || "").trim().replace(/\/+$/, "");
  if (baseUrl) {
    const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) return null;
    return {
      apiKey,
      isOpenRouter: baseUrl.includes("openrouter.ai"),
      isCustom: true,
      url: `${baseUrl}/chat/completions`,
      name: `custom endpoint (${new URL(baseUrl).host})`,
    };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const isOpenRouter = apiKey.startsWith("sk-or-");

  return {
    apiKey,
    isOpenRouter,
    isCustom: false,
    url: isOpenRouter ? OPENROUTER_URL : OPENAI_URL,
    name: isOpenRouter ? "OpenRouter" : "OpenAI",
  };
}

/**
 * OpenRouter wants namespaced model ids ("openai/gpt-4o"), OpenAI wants the bare
 * name ("gpt-4o"). Already-namespaced ids are left alone.
 *
 * AI_MODEL_OVERRIDE (optional env var) forces one specific model for BOTH chat and
 * scans, ignoring the per-plan model. Useful when you are out of credit on the paid
 * models: set it to a free OpenRouter model and the site keeps working at zero cost,
 * e.g.  AI_MODEL_OVERRIDE=thinkingmachines/inkling:free
 * Leave it unset for normal behavior (per-plan models).
 *
 * @param {string} model e.g. "gpt-4o-mini"
 * @param {{isOpenRouter: boolean}} provider
 * @returns {string}
 */
export function resolveModel(model, provider) {
  const override = process.env.AI_MODEL_OVERRIDE;
  if (override) return override;

  if (!model) return model;
  if (!provider?.isOpenRouter) return model;
  if (model.includes("/")) return model;
  return `openai/${model}`;
}

/**
 * True when AI_BASE_URL points at a localhost / private address. Such URLs work
 * only on the machine running the gateway; a deployed server cannot reach them.
 * Used to explain the failure clearly instead of a bare "fetch failed".
 */
export function isUnreachableBaseUrl(provider) {
  if (!provider?.isCustom) return false;
  try {
    const host = new URL(provider.url).hostname;
    return (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "0.0.0.0" ||
      host === "::1" ||
      host.endsWith(".local") ||
      /^(10|127)\./.test(host) ||
      /^192\.168\./.test(host) ||
      /^172\.(1[6-9]|2[0-9]|3[01])\./.test(host)
    );
  } catch {
    return false;
  }
}

/**
 * Headers for the given provider. OpenRouter uses the extra two for app
 * attribution (optional, but it keeps the dashboard readable).
 */
export function aiHeaders(provider) {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${provider.apiKey}`,
  };

  if (provider.isOpenRouter) {
    headers["HTTP-Referer"] = process.env.VITE_APP_URL || "https://petassists.com";
    headers["X-Title"] = "PetAssistant";
  }

  return headers;
}


// ============================================================================
//  ROBUST CHAT COMPLETION — with automatic fallbacks
// ============================================================================
//  Free models are picky and flaky, and each one fails differently:
//
//    • some reject the "system" role            (Gemma family, older models)
//    • some reject array-shaped content         (want a plain string)
//    • some reject response_format/json_object  (no structured output)
//    • some are throttled upstream              (429, "rate limited")
//    • some get removed from the catalog        (404 "no endpoints found")
//
//  Instead of failing the whole request, we retry with a smaller payload, then
//  with the next model in the fallback chain. The visitor only sees a failure
//  if EVERY option fails.
//
//  Fallback chain is configurable:  AI_FALLBACK_MODELS=qwen/qwen3.8-27b:free,...
//  If EVERY model in the chain fails, the catalog is fetched and other free
//  models are discovered automatically (self-healing when models are removed).
//
//  BEST SETTING for a zero-cost site (OpenRouter): AI_MODEL_OVERRIDE=openrouter/free
//  OpenRouter's own "Free Models Router" picks a healthy free model per request,
//  filtering by capability (images still work). It avoids the "429 Provider
//  returned error" flakiness of pinning one single free model.
// ============================================================================

const PAYLOAD_PROBLEM =
  /system|role|invalid_prompt|invalid request|malformed|content|response_format|json_object|json_schema|structured|unsupported|not supported|does not support/i;

const RETRYABLE =
  /rate limit|rate_limit|429|too many|overloaded|capacity|temporarily|upstream|quota|no credits|insufficient/i;

const MODEL_PROBLEM = /no endpoints|not a valid model|not found|404|unavailable|deprecated|removed/i;

/**
 * Models tried in order when the primary one fails.
 *
 * Lista verificată direct în catalogul OpenRouter (26.09.2026). Înainte conținea
 * modele ȘTERSE (`nex-agi/nex-n2.5-pro:free` → 404 "No endpoints found"), iar
 * chat-ul și scan-ul cădeau complet pe site-ul live.
 *
 * Configurabilă din Render: AI_FALLBACK_MODELS=model1,model2,...
 */
export function fallbackModels() {
  const raw = process.env.AI_FALLBACK_MODELS;
  const list = (
    raw
      ? raw.split(",")
      : [
          "openrouter/free", // routerul dinamic al OpenRouter (alege singur un model sănătos)
          "nvidia/nemotron-3-super-120b-a12b:free",
          "qwen/qwen3.8-27b:free",
          "thinkingmachines/inkling:free",
          "nvidia/nemotron-3-ultra-550b-a55b:free",
          "google/gemma-4-26b-a4b-it:free",
        ]
  )
    .map((m) => m.trim())
    .filter(Boolean);
  return list;
}

// ============================================================================
//  AUTO-DESCOPERIRE DE MODELE (self-healing)
//
//  Modelele gratuite de pe OpenRouter apar și dispar fără anunț: dacă un model
//  din listă e șters, site-ul rămâne fără AI (exact ce s-a întâmplat azi).
//  Ca să nu se mai repete, dacă tot lanțul fix eșuează, citim catalogul public
//  al OpenRouter și încercăm automat alte modele gratuite — cu vedere (imagine)
//  dacă requestul conține o poză, altfel orice model gratuit de text.
//
//  Catalogul se ține minte o oră (un singur fetch, apoi din cache).
// ============================================================================
const CATALOG_URL = "https://openrouter.ai/api/v1/models";
const CATALOG_TTL_MS = 60 * 60 * 1000;
const BAD_MODEL = /safety|moderation|guard|classifier|embed|rerank|whisper|tts/i;

let _catalog = { at: 0, text: [], vision: [] };

async function loadCatalog() {
  if (_catalog.at && Date.now() - _catalog.at < CATALOG_TTL_MS) return _catalog;
  try {
    const res = await fetch(CATALOG_URL);
    const json = await res.json();
    const free = (json?.data || []).filter(
      (m) => typeof m?.id === "string" && m.id.endsWith(":free") && !BAD_MODEL.test(m.id)
    );
    const hasImage = (m) =>
      Array.isArray(m?.architecture?.input_modalities) &&
      m.architecture.input_modalities.includes("image");
    _catalog = {
      at: Date.now(),
      vision: free.filter(hasImage).map((m) => m.id),
      text: free.filter((m) => !hasImage(m)).map((m) => m.id),
    };
  } catch (e) {
    _catalog = { ..._catalog, at: Date.now() };
  }
  return _catalog;
}

/**
 * Alte modele gratuite din catalogul live, care nu au fost încercate deja.
 * @param {{needVision?: boolean, exclude?: Set<string>, limit?: number}} opts
 */
export async function discoverFreeModels({ needVision = false, exclude = new Set(), limit = 4 } = {}) {
  const cat = await loadCatalog();
  const pool = needVision ? cat.vision : [...cat.text, ...cat.vision];
  return pool.filter((id) => !exclude.has(id)).slice(0, limit);
}

/** True dacă mesajele conțin o imagine (scan / analiză poză). */
export function messagesHaveImage(messages) {
  return messages.some(
    (m) => Array.isArray(m.content) && m.content.some((part) => part?.type === "image_url")
  );
}

/**
 * Smallest payload that still means the same thing:
 *   • system instructions folded into the first user message
 *   • array content flattened to a string (only when there is no image)
 */
function sanitizeMessages(messages) {
  const out = [];
  let systemText = "";

  for (const m of messages) {
    if (m.role === "system") {
      const t = typeof m.content === "string" ? m.content : "";
      systemText = systemText ? `${systemText}\n\n${t}` : t;
      continue;
    }
    let content = m.content;
    if (Array.isArray(content)) {
      const hasImage = content.some((p) => p?.type === "image_url");
      if (!hasImage) content = content.map((p) => p?.text || "").join("\n").trim();
    }
    out.push({ role: m.role, content });
  }

  // No user message yet? Put the instructions in one.
  if (out.length === 0) {
    out.push({ role: "user", content: systemText || "Hello" });
    return out;
  }
  if (systemText && out.length > 0) {
    const first = out[0];
    if (Array.isArray(first.content)) {
      // Keep the image parts! Just prepend the instructions as a text part.
      out[0] = { ...first, content: [{ type: "text", text: systemText }, ...first.content] };
    } else {
      const prefix = typeof first.content === "string" ? first.content : "";
      out[0] = { ...first, content: `${systemText}\n\n${prefix}`.trim() };
    }
  }
  return out;
}

/**
 * Calls the provider with automatic payload/model fallbacks.
 *
 * @returns {Promise<{ok: boolean, data: any, model: string, attempts: Array}>}
 */
export async function callAi(provider, { model, messages, maxTokens, jsonMode = false }) {
  const attempts = [];

  // A response with no text is a failure too: some free models burn the whole
  // token budget on invisible "reasoning" and return empty content. Retrying is
  // better than showing the visitor an empty bubble.
  const usable = (d) => {
    if (!d || d.error) return false;
    const text = d?.choices?.[0]?.message?.content;
    return typeof text === "string" && text.trim().length > 0;
  };

  const send = async (useModel, useMessages, useJson) => {
    const body = { model: useModel, messages: useMessages, max_tokens: maxTokens };
    if (useJson) body.response_format = { type: "json_object" };

    let status = 0;
    let data = null;
    try {
      const res = await fetch(provider.url, {
        method: "POST",
        headers: aiHeaders(provider),
        body: JSON.stringify(body),
      });
      status = res.status;
      const text = await res.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = { error: { message: `Non-JSON response (HTTP ${status}): ${text.slice(0, 120)}` } };
      }
    } catch (err) {
      data = { error: { message: `Network error: ${err?.cause?.code || err?.message || err}` } };
    }

    const ok = usable(data);
    attempts.push({
      model: useModel,
      status,
      ok,
      error: data?.error?.message || (data?.error ? null : ok ? null : "empty response"),
    });
    return data;
  };

  // ── 1. as-is ────────────────────────────────────────────────
  let data = await send(model, messages, jsonMode);
  let usedModel = model;
  if (usable(data)) return { ok: true, data, model: data?.model || model, attempts };

  // ── 2. same model, simplest possible payload ─────────────────
  if (data?.error && PAYLOAD_PROBLEM.test(data.error.message || "")) {
    const simple = sanitizeMessages(messages);
    const retry = await send(model, simple, false);
    if (usable(retry)) return { ok: true, data: retry, model: retry?.model || model, attempts };
    data = retry;
    var sanitized = simple;
  }

  // ── 3. next models in the chain ──────────────────────────────
  const tried = new Set([model]);
  const simpleMsgs = () =>
    (typeof sanitized !== "undefined" && sanitized) || sanitizeMessages(messages);

  for (const next of fallbackModels()) {
    if (tried.has(next)) continue;
    tried.add(next);
    const retry = await send(next, simpleMsgs(), false);
    if (usable(retry)) return { ok: true, data: retry, model: retry?.model || next, attempts };
    data = retry;
    usedModel = next;
  }

  // ── 4. auto-descoperire: alte modele gratuite din catalogul live ──
  // Rulează doar dacă TOT ce era mai sus a eșuat (deci nu încetinește cazul normal).
  let discovered = [];
  try {
    discovered = await discoverFreeModels({
      needVision: messagesHaveImage(messages),
      exclude: tried,
    });
  } catch (e) {
    discovered = [];
  }

  for (const next of discovered) {
    if (tried.has(next)) continue;
    tried.add(next);
    const retry = await send(next, simpleMsgs(), false);
    if (usable(retry)) {
      console.log(`[ai] model de rezervă descoperit automat: ${next}`);
      return { ok: true, data: retry, model: retry?.model || next, attempts };
    }
    data = retry;
    usedModel = next;
  }

  return { ok: false, data, model: usedModel, attempts };
}

/**
 * True when the failure is OUR problem (bad key, no credit, provider down) and NOT
 * something the visitor can fix. Those must never be shown verbatim to end users —
 * a paying customer should not read "add credits at platform.openai.com".
 */
export function isConfigError(data) {
  const raw = data?.error?.message || data?.message || "";
  const code = data?.error?.code || data?.error?.type || "";
  return (
    /incorrect api key|invalid api key|no auth|unauthorized|user not found|insufficient|no credits|quota|rate limit|billing|401|402|429/i.test(raw) ||
    ["invalid_api_key", 401, 402, 429].includes(code)
  );
}

/**
 * Message shown to the visitor when the AI is unavailable. Deliberately generic:
 * no provider names, no billing links, no key fragments. The real reason goes to
 * the server log via describeAiError().
 */
export const AI_UNAVAILABLE_MESSAGE =
  "The AI service is temporarily unavailable. Please try again in a few minutes.";

/**
 * Turns an API error payload into a message that says what to actually do.
 * An auth failure is almost always a key/provider mismatch, which is confusing
 * to debug from a generic "Incorrect API key" string.
 *
 * Intended for SERVER LOGS / admin output — see AI_UNAVAILABLE_MESSAGE for what
 * the visitor should see.
 */
export function describeAiError(data, provider) {
  const raw = data?.error?.message || data?.message || "Unknown AI error";
  const code = data?.error?.code || data?.error?.type || "";

  const noCredit = /no credits|insufficient|quota|billing|402/i.test(raw) || code === 402;
  if (noCredit) {
    const topUp = provider?.isOpenRouter
      ? "openrouter.ai/settings/credits"
      : "platform.openai.com/settings/organization/billing";
    const free = provider?.isOpenRouter
      ? " Or set AI_MODEL_OVERRIDE to a free OpenRouter model (e.g. thinkingmachines/inkling:free) to keep running at zero cost."
      : " Or switch OPENAI_API_KEY to an OpenRouter key and pay per use there.";
    return `AI account has no credit left (${provider?.name}). Top up at ${topUp}.${free}`;
  }

  const isAuthProblem =
    /incorrect api key|invalid api key|no auth|unauthorized|user not found|401/i.test(raw) ||
    code === "invalid_api_key" ||
    code === 401;

  if (isAuthProblem) {
    const other = provider?.isOpenRouter ? "OpenAI" : "OpenRouter";
    const where =
      provider?.isOpenRouter
        ? "OpenRouter (openrouter.ai/keys — make sure the key has credit)"
        : "OpenAI (platform.openai.com/api-keys)";
    return (
      `${raw} — the key in OPENAI_API_KEY was sent to ${provider?.name}. ` +
      `Check it in Render → Environment. If you have no OpenAI key, you can use an ` +
      `OpenRouter key (starts with sk-or-) instead: ${where}.`
    );
  }

  return raw;
}

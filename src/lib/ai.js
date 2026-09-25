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

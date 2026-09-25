// ============================================================
//  AI DIAGNOSTIC — GET /api/ai-check?token=petassists-diag-7f3a
//
//  Scopul: când chat-ul/scan-ul dau eroare pe site, aici vezi în clar
//  DE CE, fără să cauți prin loguri.
//
//  Ce verifică:
//    1. există cheia în environment? (și în ce variabilă)
//    2. ce provider detectează codul (OpenRouter / OpenAI / custom)
//    3. ce model folosește efectiv (inclusiv AI_MODEL_OVERRIDE)
//    4. face o cerere REALĂ minimă și arată răspunsul brut
//    5. spune verdictul în cuvinte
//
//  Ce NU expune: cheia completă (doar primele 8 caractere), nimic altceva.
//
//  ⚠️  De ce e `page.jsx` și nu `route.js`: src/app/routes.ts înregistrează
//  DOAR fișiere `page.jsx`. Un `route.js` nu este servit niciodată.
// ============================================================

import {
  getAiProvider,
  resolveModel,
  aiHeaders,
  describeAiError,
  isConfigError,
  isUnreachableBaseUrl,
  AI_UNAVAILABLE_MESSAGE,
} from "../../../lib/ai.js";

const DIAG_TOKEN = "petassists-diag-7f3a";

export async function loader({ request }) {
  const url = new URL(request.url);
  const json = (body, status = 200) =>
    new Response(JSON.stringify(body, null, 2), {
      status,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });

  if (url.searchParams.get("token") !== DIAG_TOKEN) {
    return json(
      {
        error: "Diagnostic token missing or wrong.",
        hint: "Open this URL with ?token=... exactly as your instructions tell you.",
      },
      403
    );
  }

  const out = {
    checkedAt: new Date().toISOString(),
    step1_environment: {},
    step2_provider: {},
    step3_live_request: {},
    verdict: "",
  };

  // ── 1. environment ──────────────────────────────────────────
  const rawKey = process.env.OPENAI_API_KEY || "";
  const altKey = process.env.AI_API_KEY || "";
  out.step1_environment = {
    OPENAI_API_KEY: rawKey
      ? `set (${rawKey.slice(0, 8)}…, ${rawKey.length} chars)`
      : "MISSING",
    AI_API_KEY: altKey ? `set (${altKey.slice(0, 8)}…, ${altKey.length} chars)` : "not set",
    AI_MODEL_OVERRIDE: process.env.AI_MODEL_OVERRIDE || "not set",
    AI_BASE_URL: process.env.AI_BASE_URL || "not set",
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY
      ? `set (${process.env.STRIPE_SECRET_KEY.slice(0, 8)}…)`
      : "MISSING",
    DATABASE_URL: process.env.DATABASE_URL ? "set" : "MISSING",
  };

  // ── 2. provider ─────────────────────────────────────────────
  const provider = getAiProvider();
  if (!provider) {
    out.step2_provider = { detected: null };
    out.verdict =
      "🔴 NICI O CHEIE. Adaugă OPENAI_API_KEY în Render → Environment (valoare sk-or-v1-... " +
      "de la openrouter.ai/keys). Fără ea nimic nu funcționează, nici modelele gratuite.";
    return json(out, 503);
  }

  const modelUsed = resolveModel("gpt-4o-mini", provider); // același model ca pe planul Free
  out.step2_provider = {
    detected: provider.name,
    url: provider.url,
    isOpenRouter: !!provider.isOpenRouter,
    isCustom: !!provider.isCustom,
    model_chat_free_plan: modelUsed,
    reachable_from_server: !isUnreachableBaseUrl(provider),
  };

  // ── 3. cerere reală minimă ──────────────────────────────────
  const started = Date.now();
  try {
    const res = await fetch(provider.url, {
      method: "POST",
      headers: aiHeaders(provider),
      body: JSON.stringify({
        model: modelUsed,
        messages: [{ role: "user", content: "Reply with the single word: OK" }],
        max_tokens: 5,
      }),
    });
    const ms = Date.now() - started;
    const data = await res.json().catch(() => null);

    if (data?.error) {
      out.step3_live_request = {
        httpStatus: res.status,
        errorRaw: data.error.message || JSON.stringify(data.error),
        isConfigProblem: isConfigError(data),
        what_visitors_would_see: isConfigError(data) ? AI_UNAVAILABLE_MESSAGE : data.error.message,
        what_owner_would_see_in_logs: describeAiError(data, provider),
      };
      out.verdict = `🔴 API-ul a răspuns cu eroare (HTTP ${res.status}). Vezi errorRaw mai sus.`;
      return json(out, 200);
    }

    out.step3_live_request = {
      httpStatus: res.status,
      ms,
      reply: (data?.choices?.[0]?.message?.content || "").trim().slice(0, 80),
      tokens: data?.usage?.total_tokens ?? null,
    };
    out.verdict = "✅ AI-UL FUNCȚIONEAZĂ. Dacă pe site tot apare eroare, reîncarcă pagina cu Ctrl+F5.";
    return json(out, 200);
  } catch (err) {
    out.step3_live_request = {
      threw: String(err?.cause?.code || err?.message || err),
      reachable: !isUnreachableBaseUrl(provider),
    };
    out.verdict = isUnreachableBaseUrl(provider)
      ? "🔴 AI_BASE_URL trimite către o adresă locală/privă (localhost, 192.168...). Serverul nu o poate atinge. Șterge AI_BASE_URL din Render."
      : "🔴 Serverul nu a putut face cererea (rețea/DNS/timeout). Verifică URL-ul providerului.";
    return json(out, 200);
  }
}

// FĂRĂ export default intenționat: o rută fără componentă este "resource route"
// în React Router, deci Response-ul din loader ajunge la client exact așa cum e
// (JSON), în loc să fie împachetat în documentul HTML al aplicației.

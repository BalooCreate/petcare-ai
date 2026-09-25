// ============================================================================
//  AI PROVIDER RESOLUTION
// ============================================================================
//  The app can talk to EITHER OpenAI directly OR OpenRouter (which proxies many
//  models behind one API). The provider is detected from the key prefix, so
//  whichever key is in the OPENAI_API_KEY env var just works:
//
//      sk-or-...     -> OpenRouter   (https://openrouter.ai/api/v1)
//      sk-proj-...   -> OpenAI
//      sk-...        -> OpenAI
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
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const isOpenRouter = apiKey.startsWith("sk-or-");

  return {
    apiKey,
    isOpenRouter,
    url: isOpenRouter ? OPENROUTER_URL : OPENAI_URL,
    name: isOpenRouter ? "OpenRouter" : "OpenAI",
  };
}

/**
 * OpenRouter wants namespaced model ids ("openai/gpt-4o"), OpenAI wants the bare
 * name ("gpt-4o"). Already-namespaced ids are left alone.
 *
 * @param {string} model e.g. "gpt-4o-mini"
 * @param {{isOpenRouter: boolean}} provider
 * @returns {string}
 */
export function resolveModel(model, provider) {
  if (!model) return model;
  if (!provider?.isOpenRouter) return model;
  if (model.includes("/")) return model;
  return `openai/${model}`;
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
 * Turns an API error payload into a message that says what to actually do.
 * An auth failure is almost always a key/provider mismatch, which is confusing
 * to debug from a generic "Incorrect API key" string.
 */
export function describeAiError(data, provider) {
  const raw = data?.error?.message || data?.message || "Unknown AI error";
  const code = data?.error?.code || data?.error?.type || "";

  const isAuthProblem =
    /incorrect api key|invalid api key|no auth|unauthorized|user not found|insufficient|401|402/i.test(raw) ||
    code === "invalid_api_key" ||
    code === 401 ||
    code === 402;

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

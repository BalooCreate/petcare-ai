// ============================================================
//  TikTok Publisher — API (rute publice pentru pagina /tiktok)
//
//  GET  /api/tiktok?action=start        -> trimite operatorul la TikTok (OAuth)
//  GET  /api/tiktok?code=...&state=...  -> TikTok revine aici dupa autorizare
//  GET  /api/tiktok?action=creator      -> cont conectat + optiuni de privacy
//  GET  /api/tiktok?action=status&id=X  -> starea publicarii
//  GET  /api/tiktok?action=logout       -> deconecteaza contul
//  POST /api/tiktok?action=publish      -> urca + publica un video
//
//  ✅ Cheile TikTok stau DOAR pe server (Render -> Environment):
//     TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET, TIKTOK_REDIRECT_URI
//  ✅ Nu expunem niciodata secretul catre browser.
// ============================================================

import { redirect } from "react-router";

const CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY || "";
const CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET || "";
const REDIRECT_URI =
  process.env.TIKTOK_REDIRECT_URI || "https://petassists.com/api/tiktok";
const SCOPES = "user.info.basic,video.publish";

// Videoclipurile noastre (fisiere deja publicate pe site, continut propriu)
const VIDEOS = {
  about: {
    label: "About PetGuard — AI pet assistant",
    url: "https://petassists.com/about-petassistant.mp4",
    title: "PetGuard — AI pet assistant for dogs and cats",
  },
  howto: {
    label: "How to use PetGuard",
    url: "https://petassists.com/how-to-use-petassistant.mp4",
    title: "How to use PetGuard — quick walkthrough",
  },
};

const json = (body, status = 200, extraHeaders = {}) =>
  new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...extraHeaders,
    },
  });

function getCookie(request, name) {
  const raw = request.headers.get("Cookie") || "";
  const m = raw.match(new RegExp("(?:^|;\\s*)" + name + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : "";
}

function cookie(name, value, maxAge) {
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

function clearCookie(name) {
  return `${name}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

// Reimprospateaza token-ul daca a expirat (access = 24h, refresh = 365 zile)
async function refreshAccessToken(refreshToken) {
  const body = new URLSearchParams({
    client_key: CLIENT_KEY,
    client_secret: CLIENT_SECRET,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
  const r = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  return r.json();
}

// Apel catre API-ul TikTok cu reincercare automata dupa refresh
async function tiktokFetch(request, url, init = {}) {
  let token = getCookie(request, "tt_at");
  const refreshToken = getCookie(request, "tt_rt");
  const newCookies = [];

  const call = async (t) =>
    fetch(url, {
      ...init,
      headers: {
        Authorization: `Bearer ${t}`,
        "Content-Type": "application/json; charset=UTF-8",
        ...(init.headers || {}),
      },
    });

  let r = await call(token);
  let data = await r.json().catch(() => ({}));

  const code = data?.error?.code || "";
  if (code === "access_token_invalid" || code === "access_token_expired") {
    if (!refreshToken) return { data, newCookies, invalid: true };
    const fresh = await refreshAccessToken(refreshToken);
    if (!fresh.access_token) return { data, newCookies, invalid: true };
    token = fresh.access_token;
    newCookies.push(cookie("tt_at", token, fresh.expires_in || 86400));
    if (fresh.refresh_token)
      newCookies.push(
        cookie("tt_rt", fresh.refresh_token, fresh.refresh_expires_in || 31536000)
      );
    r = await call(token);
    data = await r.json().catch(() => ({}));
  }
  return { data, newCookies, invalid: false };
}

// ------------------------------------------------------------
//  GET
// ------------------------------------------------------------
export async function loader({ request }) {
  const url = new URL(request.url);
  const action = url.searchParams.get("action") || "";
  const code = url.searchParams.get("code");
  const err = url.searchParams.get("error");

  if (!CLIENT_KEY || !CLIENT_SECRET) {
    return json(
      {
        error: "not_configured",
        hint: "Set TIKTOK_CLIENT_KEY and TIKTOK_CLIENT_SECRET in Render → Environment.",
      },
      500
    );
  }

  // TikTok a refuzat autorizarea
  if (err) {
    return redirect("/tiktok?failed=" + encodeURIComponent(err));
  }

  // 1) Pornire OAuth — trimitem la TikTok
  if (action === "start") {
    const state = crypto.randomUUID().replace(/-/g, "");
    const auth = new URL("https://www.tiktok.com/v2/auth/authorize/");
    auth.searchParams.set("client_key", CLIENT_KEY);
    auth.searchParams.set("scope", SCOPES);
    auth.searchParams.set("response_type", "code");
    auth.searchParams.set("redirect_uri", REDIRECT_URI);
    auth.searchParams.set("state", state);
    const res = redirect(auth.toString());
    res.headers.append("Set-Cookie", cookie("tt_state", state, 600));
    return res;
  }

  // 2) Revenirea de la TikTok (OAuth callback)
  if (code) {
    const state = url.searchParams.get("state") || "";
    const saved = getCookie(request, "tt_state");
    if (saved && state !== saved) {
      return json({ error: "state_mismatch" }, 400);
    }
    const body = new URLSearchParams({
      client_key: CLIENT_KEY,
      client_secret: CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: REDIRECT_URI,
    });
    const r = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const data = await r.json().catch(() => ({}));
    if (!data.access_token) {
      return json({ error: "token_exchange_failed", tiktok: data }, 400);
    }
    const res = redirect("/tiktok?connected=1");
    res.headers.append("Set-Cookie", cookie("tt_at", data.access_token, data.expires_in || 86400));
    res.headers.append("Set-Cookie", cookie("tt_rt", data.refresh_token || "", data.refresh_expires_in || 31536000));
    res.headers.append("Set-Cookie", cookie("tt_oid", data.open_id || "", 31536000));
    res.headers.append("Set-Cookie", clearCookie("tt_state"));
    return res;
  }

  // 3) Deconectare
  if (action === "logout") {
    const res = redirect("/tiktok");
    res.headers.append("Set-Cookie", clearCookie("tt_at"));
    res.headers.append("Set-Cookie", clearCookie("tt_rt"));
    res.headers.append("Set-Cookie", clearCookie("tt_oid"));
    return res;
  }

  const hasToken = !!getCookie(request, "tt_at");

  // 4) Contul conectat + optiunile de privacy (creator_info)
  if (action === "creator") {
    if (!hasToken) return json({ connected: false });

    const creator = await tiktokFetch(
      request,
      "https://open.tiktokapis.com/v2/post/publish/creator_info/query/",
      { method: "POST", body: "{}" }
    );
    const user = await tiktokFetch(
      request,
      "https://open.tiktokapis.com/v2/user/info/?fields=open_id,avatar_url,display_name",
      { method: "GET" }
    );

    const payload = {
      connected: true,
      open_id: getCookie(request, "tt_oid"),
      creator: creator.data?.data || null,
      user: user.data?.data?.user || null,
      creator_error: creator.data?.error || null,
      user_error: user.data?.error || null,
      token_expired: creator.invalid || user.invalid,
      videos: Object.entries(VIDEOS).map(([k, v]) => ({ key: k, label: v.label })),
    };
    const headers = new Headers({
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    });
    [...creator.newCookies, ...user.newCookies].forEach((c) =>
      headers.append("Set-Cookie", c)
    );
    return new Response(JSON.stringify(payload, null, 2), { status: 200, headers });
  }

  // 5) Starea publicarii
  if (action === "status") {
    if (!hasToken) return json({ error: "not_connected" }, 401);
    const publishId = url.searchParams.get("id") || "";
    if (!publishId) return json({ error: "missing_id" }, 400);
    const r = await tiktokFetch(
      request,
      "https://open.tiktokapis.com/v2/post/publish/status/fetch/",
      { method: "POST", body: JSON.stringify({ publish_id: publishId }) }
    );
    return json({ ok: true, status: r.data?.data?.status || null, fail_reason: r.data?.data?.fail_reason || null, tiktok: r.data });
  }

  return json({ error: "unknown_action", hint: "use ?action=start|creator|status|logout" }, 400);
}

// ------------------------------------------------------------
//  POST — publicare video (init + upload + intoarce publish_id)
// ------------------------------------------------------------
export async function action({ request }) {
  const url = new URL(request.url);
  const action = url.searchParams.get("action") || "";

  if (!CLIENT_KEY || !CLIENT_SECRET) {
    return json({ error: "not_configured" }, 500);
  }
  if (action !== "publish") {
    return json({ error: "unknown_action" }, 400);
  }
  if (!getCookie(request, "tt_at")) {
    return json({ error: "not_connected" }, 401);
  }

  let body = {};
  try {
    body = await request.json();
  } catch (e) {
    return json({ error: "bad_json" }, 400);
  }

  const videoKey = String(body.video || "about");
  const video = VIDEOS[videoKey];
  if (!video) return json({ error: "unknown_video" }, 400);

  const privacy = String(body.privacy || "").toUpperCase();
  if (!privacy) return json({ error: "missing_privacy" }, 400);

  const title = String(body.title || video.title).slice(0, 2200);

  // 1. Descarcam video-ul nostru de pe site (continut propriu)
  const vres = await fetch(video.url);
  if (!vres.ok) {
    return json({ error: "video_fetch_failed", status: vres.status, url: video.url }, 400);
  }
  const bytes = new Uint8Array(await vres.arrayBuffer());
  const size = bytes.length;

  // 2. Initializam publicarea (FILE_UPLOAD, un singur chunk — fisierele sunt mici)
  const init = await tiktokFetch(
    request,
    "https://open.tiktokapis.com/v2/post/publish/video/init/",
    {
      method: "POST",
      body: JSON.stringify({
        post_info: {
          title,
          privacy_level: privacy,
          disable_comment: false,
          disable_duet: false,
          disable_stitch: false,
        },
        source_info: {
          source: "FILE_UPLOAD",
          video_size: size,
          chunk_size: size,
          total_chunk_count: 1,
        },
      }),
    }
  );

  const publishId = init.data?.data?.publish_id;
  const uploadUrl = init.data?.data?.upload_url;
  if (!publishId || !uploadUrl) {
    return json({ error: "init_failed", tiktok: init.data }, 400);
  }

  // 3. Urcam octetii video
  const putRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "video/mp4",
      "Content-Length": String(size),
      "Content-Range": `bytes 0-${size - 1}/${size}`,
    },
    body: bytes,
  });

  if (!putRes.ok) {
    return json(
      { error: "upload_failed", status: putRes.status, publish_id: publishId },
      400
    );
  }

  return json({ ok: true, publish_id: publishId, video_size: size, privacy });
}

import { json, redirect } from "react-router";

// ------------------------------------------------------------
//  PETGUARD PUBLISHER — API pentru publicare pe TikTok
//  (Content Posting API: Direct Post + fallback la Inbox/draft)
//
//  GET   ?action=start           -> porneste OAuth (Login Kit)
//  GET   ?code=...               -> schimb codul pe token
//  GET   ?action=creator         -> contul conectat + optiunile lui
//  GET   ?action=status&id=...   -> starea publicarii
//  GET   ?action=code            -> codul pentru automatizarea pe PC
//  GET   ?action=logout          -> deconectare
//  POST  ?action=publish         -> publica (fisier urcat din browser SAU
//                                   {video: "about"|"howto"} pentru clipurile noastre)
// ------------------------------------------------------------

const CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY || "";
const CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET || "";
const REDIRECT_URI =
  process.env.TIKTOK_REDIRECT_URI || "https://petassists.com/api/tiktok";
const SCOPES =
  process.env.TIKTOK_SCOPES || "user.info.basic,video.publish,video.upload";

const MAX_BYTES = 100 * 1024 * 1024; // 100 MB per fisier
const CHUNK = 60 * 1024 * 1024; // bucata max trimisa catre TikTok

const VIDEOS = {
  about: {
    label: "About PetGuard — AI pet assistant",
    url:
      process.env.TIKTOK_VIDEO_ABOUT ||
      "https://transfer.archivete.am/kDDlU/petguard-about-voice.mp4",
    title: "PetGuard — AI pet assistant for dogs and cats",
  },
  howto: {
    label: "How to use PetGuard",
    url:
      process.env.TIKTOK_VIDEO_HOWTO ||
      "https://transfer.archivete.am/iZycV/petguard-howto-voice.mp4",
    title: "How to use PetGuard — quick walkthrough",
  },
};

function jsonRes(body, status = 200, extraHeaders = []) {
  const headers = new Headers({
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  extraHeaders.forEach((h) => headers.append("Set-Cookie", h));
  return new Response(JSON.stringify(body, null, 2), { status, headers });
}

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

// Reimprospateaza token-ul (access = 24h, refresh = 365 zile)
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
    return jsonRes(
      {
        error: "not_configured",
        hint: "Set TIKTOK_CLIENT_KEY and TIKTOK_CLIENT_SECRET in Render → Environment.",
      },
      500
    );
  }

  if (err) {
    return redirect("/publisher?failed=" + encodeURIComponent(err));
  }

  // 1) Pornire OAuth
  if (action === "start") {
    const state = crypto.randomUUID();
    const authUrl =
      "https://www.tiktok.com/v2/auth/authorize/?" +
      new URLSearchParams({
        client_key: CLIENT_KEY,
        response_type: "code",
        scope: SCOPES,
        redirect_uri: REDIRECT_URI,
        state,
      }).toString();
    const res = redirect(authUrl);
    res.headers.append("Set-Cookie", cookie("tt_state", state, 600));
    return res;
  }

  // 2) TikTok a trimis codul -> il schimbam pe token
  if (code) {
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
      return jsonRes({ error: "token_exchange_failed", tiktok: data }, 400);
    }
    const res = redirect("/publisher?connected=1");
    res.headers.append(
      "Set-Cookie",
      cookie("tt_at", data.access_token, data.expires_in || 86400)
    );
    res.headers.append(
      "Set-Cookie",
      cookie("tt_rt", data.refresh_token || "", data.refresh_expires_in || 31536000)
    );
    res.headers.append("Set-Cookie", cookie("tt_oid", data.open_id || "", 31536000));
    return res;
  }

  if (action === "logout") {
    const res = redirect("/publisher");
    res.headers.append("Set-Cookie", clearCookie("tt_at"));
    res.headers.append("Set-Cookie", clearCookie("tt_rt"));
    res.headers.append("Set-Cookie", clearCookie("tt_oid"));
    return res;
  }

  // 3) Codul pentru automatizare (motorul de pe PC)
  if (action === "code") {
    const rt = getCookie(request, "tt_rt");
    if (!rt) {
      return jsonRes(
        { error: "not_connected", hint: "Connect to TikTok first, then try again." },
        401
      );
    }
    return jsonRes({
      ok: true,
      refresh_token: rt,
      open_id: getCookie(request, "tt_oid"),
      hint: "Paste this code into the installer window on your PC. Do not share it.",
    });
  }

  const hasToken = !!getCookie(request, "tt_at");

  // 4) Contul conectat + optiunile lui (nickname/avatar/privacy/interactiuni)
  if (action === "creator") {
    if (!hasToken) return jsonRes({ connected: false });

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
    return jsonRes(payload, 200, [...creator.newCookies, ...user.newCookies]);
  }

  // 5) Starea publicarii
  if (action === "status") {
    if (!hasToken) return jsonRes({ error: "not_connected" }, 401);
    const publishId = url.searchParams.get("id") || "";
    if (!publishId) return jsonRes({ error: "missing_id" }, 400);
    const r = await tiktokFetch(
      request,
      "https://open.tiktokapis.com/v2/post/publish/status/fetch/",
      { method: "POST", body: JSON.stringify({ publish_id: publishId }) }
    );
    return jsonRes(
      {
        ok: true,
        status: r.data?.data?.status || null,
        fail_reason: r.data?.data?.fail_reason || null,
        tiktok: r.data,
      },
      200,
      r.newCookies
    );
  }

  return jsonRes(
    { error: "unknown_action", hint: "use ?action=start|creator|status|code|logout" },
    400
  );
}

// ------------------------------------------------------------
//  POST — publicare
// ------------------------------------------------------------
export async function action({ request }) {
  const url = new URL(request.url);
  const action = url.searchParams.get("action") || "";

  if (!CLIENT_KEY || !CLIENT_SECRET) return jsonRes({ error: "not_configured" }, 500);
  if (action !== "publish") return jsonRes({ error: "unknown_action" }, 400);
  if (!getCookie(request, "tt_at")) return jsonRes({ error: "not_connected" }, 401);

  const contentType = request.headers.get("content-type") || "";
  let bytes = null;
  let filename = "";
  let title = "";
  let privacy = "";
  let allowComment = false;
  let allowDuet = false;
  let allowStitch = false;
  let brandOrganic = false;
  let brandContent = false;
  let isAigc = false;
  let consent = false;

  try {
    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("video");
      title = String(form.get("title") || "");
      privacy = String(form.get("privacy") || "").toUpperCase();
      const yes = (k) => String(form.get(k) || "") === "true";
      allowComment = yes("allow_comment");
      allowDuet = yes("allow_duet");
      allowStitch = yes("allow_stitch");
      brandOrganic = yes("brand_organic");
      brandContent = yes("brand_content");
      isAigc = yes("is_aigc");
      consent = yes("consent");
      if (!file || typeof file === "string" || !file.size) {
        return jsonRes({ error: "missing_file" }, 400);
      }
      if (file.size > MAX_BYTES) {
        return jsonRes(
          {
            error: "file_too_big",
            size: file.size,
            max: MAX_BYTES,
            hint: "Please upload a shorter video (max 100 MB).",
          },
          400
        );
      }
      filename = file.name || "video.mp4";
      bytes = new Uint8Array(await file.arrayBuffer());
    } else {
      const body = await request.json().catch(() => ({}));
      const videoKey = String(body.video || "");
      const video = VIDEOS[videoKey];
      if (!video) return jsonRes({ error: "unknown_video" }, 400);
      title = String(body.title || video.title);
      privacy = String(body.privacy || "").toUpperCase();
      allowComment = !!body.allow_comment;
      allowDuet = !!body.allow_duet;
      allowStitch = !!body.allow_stitch;
      brandOrganic = !!body.brand_organic;
      brandContent = !!body.brand_content;
      isAigc = !!body.is_aigc;
      consent = !!body.consent;
      filename = videoKey + ".mp4";
      const vres = await fetch(video.url);
      if (!vres.ok) {
        return jsonRes({ error: "video_fetch_failed", status: vres.status }, 400);
      }
      const buf = new Uint8Array(await vres.arrayBuffer());
      const head = new TextDecoder("latin1").decode(buf.slice(0, 16));
      if (!head.includes("ftyp")) {
        return jsonRes({ error: "video_not_mp4", url: video.url }, 400);
      }
      bytes = buf;
    }
  } catch (e) {
    return jsonRes({ error: "bad_request", message: String(e) }, 400);
  }

  // ---- reguli TikTok (cerute la audit) ----
  const PROBLEMS = [];
  if (!privacy) PROBLEMS.push("Choose who can see this post.");
  if (!consent) PROBLEMS.push("Please accept the TikTok posting terms.");
  if (brandContent && privacy === "SELF_ONLY")
    PROBLEMS.push("Branded content visibility cannot be set to private.");
  if (PROBLEMS.length) return jsonRes({ error: "validation", problems: PROBLEMS }, 400);

  const size = bytes.length;
  if (size < 100 * 1024) return jsonRes({ error: "video_too_small", size }, 400);
  const head16 = new TextDecoder("latin1").decode(bytes.slice(0, 16));
  if (!head16.includes("ftyp")) {
    return jsonRes({ error: "video_not_mp4", filename, size }, 400);
  }

  const chunkSize = Math.min(size, CHUNK);
  const chunkCount = Math.ceil(size / chunkSize);

  const sourceInfo = {
    source: "FILE_UPLOAD",
    video_size: size,
    chunk_size: chunkSize,
    total_chunk_count: chunkCount,
  };

  const postInfo = {
    title: String(title || "").slice(0, 2200),
    privacy_level: privacy,
    disable_comment: !allowComment,
    disable_duet: !allowDuet,
    disable_stitch: !allowStitch,
    brand_organic_toggle: !!brandOrganic,
    brand_content_toggle: !!brandContent,
    is_aigc: !!isAigc,
  };

  // 1. Direct Post
  const direct = await tiktokFetch(
    request,
    "https://open.tiktokapis.com/v2/post/publish/video/init/",
    {
      method: "POST",
      body: JSON.stringify({ post_info: postInfo, source_info: sourceInfo }),
    }
  );

  let mode = "direct";
  let initData = direct.data;

  // 2. Daca Direct Post e refuzat (audit inca nefinalizat) -> Inbox (draft)
  let directError = null;
  if (!initData?.data?.publish_id) {
    directError = direct.data?.error || null;
    const inbox = await tiktokFetch(
      request,
      "https://open.tiktokapis.com/v2/post/publish/inbox/video/init/",
      { method: "POST", body: JSON.stringify({ source_info: sourceInfo }) }
    );
    if (inbox.data?.data?.publish_id) {
      mode = "inbox";
      initData = inbox.data;
    } else {
      return jsonRes(
        {
          error: "init_failed",
          tried: ["direct", "inbox"],
          direct_error: direct.data?.error || null,
          inbox_error: inbox.data?.error || null,
        },
        400
      );
    }
  }

  const publishId = initData?.data?.publish_id;
  const uploadUrl = initData?.data?.upload_url;
  if (!publishId || !uploadUrl) {
    return jsonRes({ error: "init_failed", mode, tiktok: initData }, 400);
  }

  // 3. Urcam octetii (pe bucati daca e mare)
  let offset = 0;
  let part = 0;
  while (offset < size) {
    const end = Math.min(offset + chunkSize, size);
    const slice = bytes.slice(offset, end);
    const putRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "video/mp4",
        "Content-Length": String(slice.length),
        "Content-Range": `bytes ${offset}-${end - 1}/${size}`,
      },
      body: slice,
    });
    if (!putRes.ok) {
      return jsonRes(
        { error: "upload_failed", status: putRes.status, part: part + 1, publish_id: publishId },
        400
      );
    }
    offset = end;
    part++;
  }

  return jsonRes({
    ok: true,
    mode,
    publish_id: publishId,
    video_size: size,
    privacy,
    filename,
    chunk_count: chunkCount,
    direct_error: directError,
  });
}

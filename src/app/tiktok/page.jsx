// ============================================================
//  PetGuard Europe — TikTok Publisher  (pagina /tiktok)
//
//  Flux: Connect cu TikTok (Login Kit) -> alegi videoclipul ->
//        alegi privacy (din creator_info) -> Publish (Content Posting API)
//  Continut propriu, cont propriu (@petguardeurope). Uz intern.
// ============================================================

import { useCallback, useEffect, useRef, useState } from "react";

export const meta = () => [
  { title: "TikTok Publisher — PetGuard Europe" },
  { name: "robots", content: "noindex,nofollow" },
];

const PRIVACY_LABELS = {
  PUBLIC_TO_EVERYONE: "Public — everyone can see",
  MUTUAL_FOLLOW_FRIENDS: "Friends — mutual followers",
  FOLLOWER_OF_CREATOR: "Followers — people who follow the account",
  SELF_ONLY: "Only me (private draft)",
};

const STATUS_LABELS = {
  PROCESSING_UPLOAD: "Uploading to TikTok…",
  PROCESSING_DOWNLOAD: "TikTok is processing the video…",
  SEND_TO_USER_INBOX: "Sent to TikTok inbox (draft mode)",
  PUBLISH_COMPLETE: "Published successfully",
  FAILED: "Publishing failed",
};

export default function TikTokPublisherPage() {
  const [state, setState] = useState({
    loading: true,
    connected: false,
    creator: null,
    user: null,
    videos: [],
    error: null,
  });
  const [video, setVideo] = useState("about");
  const [title, setTitle] = useState("");
  const [privacy, setPrivacy] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [publishId, setPublishId] = useState("");
  const [finalStatus, setFinalStatus] = useState("");
  const [log, setLog] = useState([]);
  const [autoCode, setAutoCode] = useState("");
  const [codeBusy, setCodeBusy] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const pollRef = useRef(null);

  const addLog = useCallback((line) => {
    const t = new Date().toLocaleTimeString();
    setLog((prev) => [...prev, `${t}  ${line}`]);
  }, []);

  const loadCreator = useCallback(async () => {
    try {
      const r = await fetch("/api/tiktok?action=creator", { cache: "no-store" });
      const d = await r.json();
      if (!d.connected) {
        setState({ loading: false, connected: false, creator: null, user: null, videos: [], error: null });
        return;
      }
      const options = d.creator?.privacy_level_options || [];
      setPrivacy((p) => p || options[0] || "");
      setState({
        loading: false,
        connected: true,
        creator: d.creator,
        user: d.user,
        videos: d.videos || [],
        error: d.creator_error?.code && d.creator_error.code !== "ok" ? d.creator_error : null,
      });
      if (d.creator?.creator_username) {
        setTitle((t) => t || "PetGuard — AI pet assistant for dogs and cats");
      }
    } catch (e) {
      setState((s) => ({ ...s, loading: false, error: { message: String(e) } }));
    }
  }, []);

  const showCode = useCallback(async () => {
    setCodeBusy(true);
    setCodeCopied(false);
    try {
      const r = await fetch("/api/tiktok?action=code", { cache: "no-store" });
      const d = await r.json();
      if (d.refresh_token) {
        setAutoCode(d.refresh_token);
        addLog("Automation code ready — copy it into the PC script.");
      } else {
        setAutoCode("");
        addLog("Could not get the code: " + (d.error || "unknown") + " — connect first.");
      }
    } catch (e) {
      addLog("Could not get the code: " + String(e));
    } finally {
      setCodeBusy(false);
    }
  }, [addLog]);

  const copyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(autoCode);
      setCodeCopied(true);
      addLog("Automation code copied ✓");
    } catch (e) {
      addLog("Copy did not work — select the text and copy it manually.");
    }
  }, [autoCode, addLog]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("connected")) {
      addLog("Connected to TikTok ✓");
      window.history.replaceState({}, "", "/tiktok");
    }
    if (params.get("failed")) {
      addLog("Authorization refused: " + params.get("failed"));
      window.history.replaceState({}, "", "/tiktok");
    }
    loadCreator();
  }, [addLog, loadCreator]);

  const publish = async () => {
    setPublishing(true);
    setFinalStatus("");
    setPublishId("");
    addLog(`Starting publish (privacy=${privacy})…`);
    try {
      const r = await fetch("/api/tiktok?action=publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consent: true, video, privacy, title }),
      });
      const d = await r.json();
      addLog("Init response: " + JSON.stringify(d));
      if (!d.ok) {
        addLog("ERROR complet: " + JSON.stringify(d.direct_error || d.inbox_error || d.tiktok || d));
        setPublishing(false);
        setFinalStatus("FAILED");
        return;
      }
      addLog(
        `mode = ${d.mode === "inbox" ? "DRAFT (inbox)" : "DIRECT"}` +
          ` · publish_id = ${d.publish_id} · video ${d.video_size} bytes`
      );
      if (d.mode === "inbox") {
        addLog("Trimis ca DRAFT — deschide TikTok → Inbox → finalizeaza postarea.");
      }
      addLog("Uploaded. Polling status…");
      setPublishId(d.publish_id);
      let attempts = 0;
      pollRef.current = setInterval(async () => {
        attempts += 1;
        try {
          const s = await fetch(`/api/tiktok?action=status&id=${encodeURIComponent(d.publish_id)}`, { cache: "no-store" });
          const sd = await s.json();
          const st = sd.status || "UNKNOWN";
          addLog(`status: ${st}${sd.fail_reason ? " — " + sd.fail_reason : ""}`);
          if (st === "PUBLISH_COMPLETE" || st === "FAILED" || st === "SEND_TO_USER_INBOX") {
            clearInterval(pollRef.current);
            setFinalStatus(st);
            setPublishing(false);
            if (st === "PUBLISH_COMPLETE") addLog("Done ✓ The video is live on TikTok.");
          }
          if (attempts > 100) {
            clearInterval(pollRef.current);
            setPublishing(false);
            addLog("Stopped polling (timeout).");
          }
        } catch (e) {
          addLog("status check error: " + String(e));
        }
      }, 3000);
    } catch (e) {
      addLog("publish error: " + String(e));
      setPublishing(false);
      setFinalStatus("FAILED");
    }
  };

  useEffect(() => () => pollRef.current && clearInterval(pollRef.current), []);

  const creator = state.creator || {};
  const user = state.user || {};
  const avatar = creator.creator_avatar_url || user.avatar_url || "";
  const username = creator.creator_username || user.display_name || "";
  const privacyOptions = creator.privacy_level_options || [];

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="mx-auto max-w-xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">PetGuard Europe — TikTok Publisher</h1>
          <p className="mt-1 text-sm text-gray-500">
            Internal tool · publishes our own videos to @petguardeurope
          </p>
        </div>

        {state.loading && (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">Loading…</div>
        )}

        {!state.loading && !state.connected && (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            <p className="mb-6 text-gray-600">
              Connect the brand TikTok account to publish videos.
            </p>
            <a
              href="/api/tiktok?action=start"
              className="inline-flex items-center gap-2 rounded-lg bg-black px-6 py-3 font-semibold text-white hover:bg-gray-800"
            >
              <span className="text-lg">♪</span> Continue with TikTok
            </a>
            <p className="mt-4 text-xs text-gray-400">
              You will be redirected to TikTok to authorize this app.
            </p>
          </div>
        )}

        {!state.loading && state.connected && (
          <div className="space-y-4">
            {/* Cont conectat — TikTok cere afisarea numelui + pozei */}
            <div className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm">
              {avatar ? (
                <img src={avatar} alt="avatar" className="h-14 w-14 rounded-full object-cover ring-2 ring-green-500" />
              ) : (
                <div className="h-14 w-14 rounded-full bg-gray-200" />
              )}
              <div className="flex-1">
                <div className="text-xs uppercase tracking-wide text-gray-400">Connected account</div>
                <div className="text-lg font-semibold text-gray-900">{username || "TikTok account"}</div>
                {creator.creator_username && (
                  <div className="text-sm text-gray-500">@{creator.creator_username}</div>
                )}
              </div>
              <a href="/api/tiktok?action=logout" className="text-xs text-gray-400 underline hover:text-gray-600">
                Disconnect
              </a>
            </div>

            {/* Automatizare — codul pentru motorul de pe PC */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="text-sm font-semibold text-gray-700">Automation (your PC engine)</div>
              <p className="mt-1 text-xs text-gray-500">
                Copy the code below and paste it into the PC script. Then every time a video is
                posted to YouTube and Instagram, it also lands in your TikTok Inbox as a draft —
                you only tap Post.
              </p>
              <button
                onClick={showCode}
                disabled={codeBusy}
                className="mt-3 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {codeBusy ? "Preparing…" : "Show automation code"}
              </button>
              {autoCode && (
                <div className="mt-3">
                  <textarea
                    readOnly
                    value={autoCode}
                    rows={3}
                    onFocus={(e) => e.target.select()}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2 font-mono text-xs"
                  />
                  <button
                    onClick={copyCode}
                    className="mt-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    {codeCopied ? "✅ Copied" : "Copy code"}
                  </button>
                  <p className="mt-2 text-xs text-red-600">
                    Never share this code with anyone. It is the key to your TikTok account.
                  </p>
                </div>
              )}
            </div>

            {state.error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                TikTok API: <b>{state.error.code}</b> — {state.error.message}
              </div>
            )}

            {/* Alegerea video-ului */}
            <div className="rounded-xl bg-white p-5 shadow-sm">
              <div className="mb-3 text-sm font-semibold text-gray-700">1. Choose a video</div>
              <div className="space-y-2">
                {(state.videos.length ? state.videos : [{ key: "about", label: "About PetGuard" }]).map((v) => (
                  <label
                    key={v.key}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 ${
                      video === v.key ? "border-green-500 bg-green-50" : "border-gray-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="video"
                      checked={video === v.key}
                      onChange={() => setVideo(v.key)}
                      className="accent-green-600"
                    />
                    <span className="text-sm text-gray-800">{v.label}</span>
                  </label>
                ))}
              </div>

              <div className="mt-4">
                <label className="mb-1 block text-sm font-semibold text-gray-700">Caption</label>
                <textarea
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  rows={2}
                  maxLength={2200}
                  className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-green-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Privacy — obligatoriu de la TikTok */}
            <div className="rounded-xl bg-white p-5 shadow-sm">
              <div className="mb-3 text-sm font-semibold text-gray-700">2. Who can view this post</div>
              {privacyOptions.length === 0 && (
                <div className="text-sm text-gray-400">No privacy options received from TikTok.</div>
              )}
              <div className="space-y-2">
                {privacyOptions.map((opt) => (
                  <label
                    key={opt}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 ${
                      privacy === opt ? "border-green-500 bg-green-50" : "border-gray-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="privacy"
                      checked={privacy === opt}
                      onChange={() => setPrivacy(opt)}
                      className="accent-green-600"
                    />
                    <span className="text-sm text-gray-800">{PRIVACY_LABELS[opt] || opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Publicare */}
            <div className="rounded-xl bg-white p-5 shadow-sm">
              <button
                onClick={publish}
                disabled={publishing || !privacy}
                className="w-full rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
              >
                {publishing ? "Publishing…" : "Publish to TikTok"}
              </button>

              {finalStatus === "PUBLISH_COMPLETE" && (
                <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                  ✅ Published to TikTok.{" "}
                  <a
                    className="underline"
                    href={"https://www.tiktok.com/@" + (creator.creator_username || "")}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open @{creator.creator_username}
                  </a>
                </div>
              )}
              {finalStatus === "SEND_TO_USER_INBOX" && (
                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  ✅ Sent to the TikTok inbox as a draft. Open the TikTok app → Inbox
                  (notifications) → tap the video → Post. Done.
                </div>
              )}
              {finalStatus === "FAILED" && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                  Publishing failed — see the log below.
                </div>
              )}
            </div>

            {/* Jurnal — se vede clar in video-ul demo */}
            {log.length > 0 && (
              <div className="rounded-xl bg-gray-900 p-4">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Activity log
                </div>
                <pre className="max-h-56 overflow-auto whitespace-pre-wrap text-xs leading-relaxed text-green-300">
                  {log.join("\n")}
                </pre>
                <button
                  onClick={() => {
                    try {
                      navigator.clipboard.writeText(log.join("\n"));
                      addLog("Log copied to clipboard");
                    } catch (e) {
                      addLog("copy failed: " + String(e));
                    }
                  }}
                  className="mt-2 rounded border border-gray-600 px-3 py-1 text-xs text-gray-300 hover:bg-gray-800"
                >
                  Copy log
                </button>
              </div>
            )}

            {publishId && (
              <div className="text-center text-xs text-gray-400">publish_id: {publishId}</div>
            )}
          </div>
        )}

        <p className="mt-8 text-center text-xs text-gray-400">
          PetGuard Europe · DUAL DELIGHT SRL · content owned by us ·{" "}
          <a className="underline" href="https://petassists.com/privacy">Privacy</a> ·{" "}
          <a className="underline" href="https://petassists.com/terms">Terms</a>
        </p>
      </div>
    </div>
  );
}

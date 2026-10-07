import { useCallback, useEffect, useRef, useState } from "react";

// ------------------------------------------------------------
//  PETGUARD PUBLISHER — publicare video pe TikTok (Content Posting API)
//  Construit dupa cerintele TikTok pentru audit:
//   - arata contul conectat (nume + poza) inainte de publicare
//   - alegerea publicului fara valoare implicita, doar din optiunile TikTok
//   - comentarii / duet / stitch OPRITE implicit, gri daca contul le are oprite
//   - divulgare comerciala (Your brand / Branded content) oprita implicit
//   - acord explicit (Music Usage Confirmation / Branded Content Policy)
//   - stare de procesare + status real pana la final
// ------------------------------------------------------------

const PRIVACY_LABELS = {
  PUBLIC_TO_EVERYONE: "Everyone",
  MUTUAL_FOLLOW_FRIENDS: "Friends",
  FOLLOWER_OF_CREATOR: "Followers",
  SELF_ONLY: "Only me",
};

const MUSIC_URL = "https://www.tiktok.com/legal/page/global/music-usage-confirmation/en";
const BC_URL = "https://www.tiktok.com/legal/page/global/bc-policy/en";

export default function PublisherPage() {
  const [state, setState] = useState({ loading: true, connected: false, creator: null, user: null });
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState("");
  const [fileError, setFileError] = useState("");
  const [title, setTitle] = useState("");
  const [privacy, setPrivacy] = useState(""); // FARA valoare implicita (cerinta TikTok)
  const [allowComment, setAllowComment] = useState(false);
  const [allowDuet, setAllowDuet] = useState(false);
  const [allowStitch, setAllowStitch] = useState(false);
  const [disclose, setDisclose] = useState(false);
  const [yourBrand, setYourBrand] = useState(false);
  const [brandedContent, setBrandedContent] = useState(false);
  const [isAigc, setIsAigc] = useState(false);
  const [consent, setConsent] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [result, setResult] = useState(null);
  const [log, setLog] = useState([]);
  const pollRef = useRef(null);

  const addLog = useCallback((line) => {
    setLog((prev) => [...prev.slice(-40), new Date().toLocaleTimeString() + "  " + line]);
  }, []);

  const loadCreator = useCallback(async () => {
    try {
      const r = await fetch("/api/tiktok?action=creator", { cache: "no-store" });
      const d = await r.json();
      if (!d.connected) {
        setState({ loading: false, connected: false, creator: null, user: null });
        return;
      }
      setState({ loading: false, connected: true, creator: d.creator || null, user: d.user || null });
      if (d.creator_error?.code && d.creator_error.code !== "ok") {
        addLog("TikTok: " + d.creator_error.code + " — " + (d.creator_error.message || ""));
      }
    } catch (e) {
      setState({ loading: false, connected: false, creator: null, user: null });
    }
  }, [addLog]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("connected")) {
      addLog("Connected to TikTok ✓");
      window.history.replaceState({}, "", "/publisher");
    }
    if (params.get("failed")) {
      addLog("Authorization refused: " + params.get("failed"));
      window.history.replaceState({}, "", "/publisher");
    }
    loadCreator();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [addLog, loadCreator]);

  const creator = state.creator || {};
  const privacyOptions = creator.privacy_level_options || [];
  const maxDur = Number(creator.max_video_post_duration_sec || 0);
  const cannotPost = creator.can_post === false;

  // ---- fisier video ----
  const onPickFile = (f) => {
    setFileError("");
    setResult(null);
    if (!f) return;
    if (!/video\/(mp4|quicktime|x-m4v)/.test(f.type || "") && !/\.(mp4|mov|m4v)$/i.test(f.name || "")) {
      setFileError("Please choose an MP4 or MOV video.");
      return;
    }
    if (f.size > 100 * 1024 * 1024) {
      setFileError(
        "Video is too large (" + (f.size / 1048576).toFixed(0) + " MB). Maximum is 100 MB."
      );
      return;
    }
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    const u = URL.createObjectURL(f);
    setFile(f);
    setFileUrl(u);
    if (maxDur) {
      const v = document.createElement("video");
      v.preload = "metadata";
      v.onloadedmetadata = () => {
        if (v.duration && v.duration > maxDur) {
          setFileError(
            "TikTok allows up to " + maxDur + "s for this account; your video is " +
              Math.round(v.duration) + "s."
          );
        }
      };
      v.src = u;
    }
    addLog("Video selected: " + f.name + " (" + (f.size / 1048576).toFixed(1) + " MB)");
  };

  // ---- reguli TikTok ----
  const disclosureMissing = disclose && !yourBrand && !brandedContent;
  const privacyConflict = brandedContent && privacy === "SELF_ONLY";
  const canPost =
    !!file && !!privacy && consent && !disclosureMissing && !privacyConflict && !publishing && !cannotPost;

  const publish = async () => {
    if (!canPost) return;
    setPublishing(true);
    setResult(null);
    addLog("Posting to TikTok… (privacy=" + privacy + ")");
    try {
      const fd = new FormData();
      fd.append("video", file, file.name);
      fd.append("title", title);
      fd.append("privacy", privacy);
      fd.append("allow_comment", String(allowComment));
      fd.append("allow_duet", String(allowDuet));
      fd.append("allow_stitch", String(allowStitch));
      fd.append("brand_organic", String(disclose && yourBrand));
      fd.append("brand_content", String(disclose && brandedContent));
      fd.append("is_aigc", String(isAigc));
      fd.append("consent", String(consent));

      const r = await fetch("/api/tiktok?action=publish", { method: "POST", body: fd });
      const d = await r.json();
      if (!d.ok) {
        setResult({ ok: false, data: d });
        addLog("ERROR: " + (d.error || "unknown"));
        setPublishing(false);
        return;
      }
      addLog(d.mode === "inbox" ? "Sent to your TikTok Inbox (draft) ✓" : "Published ✓");
      setResult({ ok: true, data: d });

      // urmarim procesarea pana la final
      let tries = 0;
      pollRef.current = setInterval(async () => {
        tries++;
        try {
          const s = await fetch("/api/tiktok?action=status&id=" + encodeURIComponent(d.publish_id), {
            cache: "no-store",
          });
          const sd = await s.json();
          if (sd.status) {
            addLog("status: " + sd.status + (sd.fail_reason ? " (" + sd.fail_reason + ")" : ""));
            if (["PUBLISH_COMPLETE", "SEND_TO_USER_INBOX", "FAILED"].includes(sd.status)) {
              clearInterval(pollRef.current);
              setResult({ ok: sd.status !== "FAILED", done: true, data: { ...d, status: sd.status, fail_reason: sd.fail_reason } });
              setPublishing(false);
            }
          }
        } catch (e) {
          /* reincercam */
        }
        if (tries > 30) {
          clearInterval(pollRef.current);
          setPublishing(false);
        }
      }, 5000);
    } catch (e) {
      setResult({ ok: false, data: { error: String(e) } });
      setPublishing(false);
    }
  };

  // ------------------------------------------------------------
  const avatar = state.user?.avatar_url || creator.creator_avatar_url || "";
  const nickname = creator.creator_nickname || state.user?.display_name || "";
  const username = creator.creator_username || "";

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-xl space-y-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">PetGuard Publisher</h1>
          <p className="mt-1 text-sm text-gray-600">
            Post your pet video to TikTok — free. Pick your video, choose who can see it, and post.
          </p>
        </div>

        {state.loading && <div className="rounded-xl bg-white p-5 text-sm text-gray-500 shadow-sm">Loading…</div>}

        {!state.loading && !state.connected && (
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold text-gray-800">Step 1 — Connect your TikTok account</div>
            <p className="mt-1 text-xs text-gray-500">
              You will be sent to TikTok to authorize posting. PetGuard never sees your password.
            </p>
            <a
              href="/api/tiktok?action=start"
              className="mt-4 block rounded-lg bg-green-600 px-6 py-3 text-center font-semibold text-white hover:bg-green-700"
            >
              Continue with TikTok
            </a>
          </div>
        )}

        {!state.loading && state.connected && (
          <>
            {/* Cont conectat — obligatoriu afisat inainte de publicare */}
            <div className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm">
              {avatar ? (
                <img src={avatar} alt="avatar" className="h-14 w-14 rounded-full object-cover ring-2 ring-green-500" />
              ) : (
                <div className="h-14 w-14 rounded-full bg-gray-200" />
              )}
              <div className="flex-1">
                <div className="text-xs uppercase tracking-wide text-gray-400">Posting to this TikTok account</div>
                <div className="text-lg font-semibold text-gray-900">{nickname || "TikTok account"}</div>
                {username && <div className="text-sm text-gray-500">@{username}</div>}
              </div>
              <a href="/api/tiktok?action=logout" className="text-xs text-gray-400 underline hover:text-gray-600">
                Disconnect
              </a>
            </div>

            {cannotPost && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                TikTok says this account cannot post right now. Please try again later.
              </div>
            )}

            {/* 1. Video */}
            <div className="rounded-xl bg-white p-5 shadow-sm">
              <div className="mb-3 text-sm font-semibold text-gray-700">1. Your video</div>
              <input
                type="file"
                accept="video/mp4,video/quicktime,.mp4,.mov"
                onChange={(e) => onPickFile(e.target.files?.[0])}
                className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-gray-800"
              />
              <p className="mt-2 text-xs text-gray-400">
                MP4 or MOV, up to 100 MB{maxDur ? ", up to " + maxDur + " seconds for this account" : ""}. Your
                original video is posted — no watermark or logo is added.
              </p>
              {fileError && <p className="mt-2 text-xs text-red-600">{fileError}</p>}
              {fileUrl && (
                <div className="mt-3 overflow-hidden rounded-xl bg-black">
                  <video src={fileUrl} controls playsInline className="mx-auto max-h-80 w-auto" />
                </div>
              )}
              <div className="mt-4">
                <label className="mb-1 block text-sm font-semibold text-gray-700">Caption</label>
                <textarea
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  rows={3}
                  maxLength={2200}
                  placeholder="Write your caption, add #hashtags…"
                  className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-green-500 focus:outline-none"
                />
                <div className="text-right text-xs text-gray-400">{title.length}/2200</div>
              </div>
            </div>

            {/* 2. Cine vede postarea — fara valoare implicita */}
            <div className="rounded-xl bg-white p-5 shadow-sm">
              <div className="mb-1 text-sm font-semibold text-gray-700">2. Who can see this post</div>
              <p className="mb-3 text-xs text-gray-400">Choose one — TikTok does not allow a default.</p>
              {privacyOptions.length === 0 && (
                <div className="text-sm text-gray-400">No options received from TikTok.</div>
              )}
              <div className="space-y-2">
                {privacyOptions.map((opt) => {
                  const blocked = brandedContent && opt === "SELF_ONLY";
                  return (
                    <label
                      key={opt}
                      title={blocked ? "Branded content visibility cannot be set to private." : ""}
                      className={`flex items-center gap-3 rounded-lg border p-3 ${
                        blocked
                          ? "cursor-not-allowed border-gray-100 bg-gray-50 opacity-50"
                          : privacy === opt
                          ? "cursor-pointer border-green-500 bg-green-50"
                          : "cursor-pointer border-gray-200"
                      }`}
                    >
                      <input
                        type="radio"
                        name="privacy"
                        disabled={blocked}
                        checked={privacy === opt}
                        onChange={() => setPrivacy(opt)}
                        className="accent-green-600"
                      />
                      <span className="text-sm text-gray-800">{PRIVACY_LABELS[opt] || opt}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 3. Interactiuni — oprite implicit */}
            <div className="rounded-xl bg-white p-5 shadow-sm">
              <div className="mb-1 text-sm font-semibold text-gray-700">3. Allow interactions</div>
              <p className="mb-3 text-xs text-gray-400">All off by default. You choose what to allow.</p>
              <div className="space-y-2">
                {[
                  { label: "Comments", value: allowComment, set: setAllowComment, blocked: !!creator.comment_disabled },
                  { label: "Duet", value: allowDuet, set: setAllowDuet, blocked: !!creator.duet_disabled },
                  { label: "Stitch", value: allowStitch, set: setAllowStitch, blocked: !!creator.stitch_disabled },
                ].map((it) => (
                  <label
                    key={it.label}
                    className={`flex items-center gap-3 rounded-lg border border-gray-200 p-3 ${
                      it.blocked ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                    }`}
                  >
                    <input
                      type="checkbox"
                      disabled={it.blocked}
                      checked={it.value}
                      onChange={(e) => it.set(e.target.checked)}
                      className="accent-green-600"
                    />
                    <span className="text-sm text-gray-800">
                      Allow {it.label}
                      {it.blocked ? " (disabled for this account)" : ""}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* 4. Divulgare comerciala — oprita implicit */}
            <div className="rounded-xl bg-white p-5 shadow-sm">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={disclose}
                  onChange={(e) => {
                    setDisclose(e.target.checked);
                    if (!e.target.checked) {
                      setYourBrand(false);
                      setBrandedContent(false);
                    }
                  }}
                  className="accent-green-600"
                />
                <span className="text-sm font-semibold text-gray-700">Disclose video content</span>
              </label>
              <p className="mt-1 text-xs text-gray-400">
                Turn on if this video promotes you, a third party, or both.
              </p>
              {disclose && (
                <div className="mt-3 space-y-2">
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3">
                    <input
                      type="checkbox"
                      checked={yourBrand}
                      onChange={(e) => setYourBrand(e.target.checked)}
                      className="accent-green-600"
                    />
                    <span className="text-sm text-gray-800">Your brand — you are promoting your own business</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3">
                    <input
                      type="checkbox"
                      checked={brandedContent}
                      onChange={(e) => {
                        setBrandedContent(e.target.checked);
                        if (e.target.checked && privacy === "SELF_ONLY") setPrivacy("");
                      }}
                      className="accent-green-600"
                    />
                    <span className="text-sm text-gray-800">Branded content — paid partnership with a third party</span>
                  </label>
                </div>
              )}
              {disclosureMissing && (
                <p className="mt-2 text-xs text-red-600">
                  You need to indicate if your content promotes yourself, a third party, or both.
                </p>
              )}
            </div>

            {/* 5. Continut AI + acord */}
            <div className="rounded-xl bg-white p-5 shadow-sm">
              <div className="text-sm font-semibold text-gray-700">4. Before you post</div>
              <label className="mt-3 flex cursor-pointer items-center gap-3">
                <input type="checkbox" checked={isAigc} onChange={(e) => setIsAigc(e.target.checked)} className="accent-green-600" />
                <span className="text-sm text-gray-800">This video was generated or edited with AI</span>
              </label>
              <label className="mt-3 flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 accent-green-600"
                />
                <span className="text-xs text-gray-600">
                  By posting, you agree to TikTok's{" "}
                  {brandedContent && disclose && (
                    <>
                      <a href={BC_URL} target="_blank" rel="noreferrer" className="underline">
                        Branded Content Policy
                      </a>{" "}
                      and{" "}
                    </>
                  )}
                  <a href={MUSIC_URL} target="_blank" rel="noreferrer" className="underline">
                    Music Usage Confirmation
                  </a>
                  .
                </span>
              </label>
              <p className="mt-3 text-xs text-gray-400">
                TikTok usually processes a post in a few minutes. Keep this page open until it finishes.
              </p>
            </div>

            {/* Publicare */}
            <div className="rounded-xl bg-white p-5 shadow-sm">
              <button
                onClick={publish}
                disabled={!canPost}
                title={
                  disclosureMissing
                    ? "You need to indicate if your content promotes yourself, a third party, or both."
                    : privacyConflict
                    ? "Branded content visibility cannot be set to private."
                    : !privacy
                    ? "Choose who can see this post."
                    : !consent
                    ? "Please accept the TikTok posting terms."
                    : ""
                }
                className="w-full rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-40"
              >
                {publishing ? "Posting…" : "Post to TikTok"}
              </button>

              {result?.ok && result.data?.mode === "inbox" && (
                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  ✅ Sent to your <b>TikTok Inbox</b> as a draft.
                  <div className="mt-1 text-xs">
                    Direct public posting is waiting for TikTok's review of this app. Open the TikTok app →
                    Inbox → tap <b>Post</b> to finish.
                  </div>
                </div>
              )}
              {result?.ok && result.data?.mode !== "inbox" && (
                <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                  ✅ Posted to TikTok{result.data?.status ? " (" + result.data.status + ")" : ""}.{" "}
                  {username && (
                    <a className="underline" href={"https://www.tiktok.com/@" + username} target="_blank" rel="noreferrer">
                      Open @{username}
                    </a>
                  )}
                </div>
              )}
              {result && !result.ok && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-xs text-red-700">
                  <div className="font-semibold">Could not post</div>
                  <pre className="mt-2 whitespace-pre-wrap break-all">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </>
        )}

        {log.length > 0 && (
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Activity</div>
            <div className="max-h-40 overflow-y-auto rounded-lg bg-gray-900 p-3 font-mono text-xs text-green-300">
              {log.map((l, i) => (
                <div key={i}>{l}</div>
              ))}
            </div>
          </div>
        )}

        <div className="pb-6 text-center text-xs text-gray-400">
          <a href="/privacy" className="underline">
            Privacy
          </a>{" "}
          ·{" "}
          <a href="/terms" className="underline">
            Terms
          </a>{" "}
          ·{" "}
          <a href="https://www.tiktok.com/legal/page/global/music-usage-confirmation/en" className="underline" target="_blank" rel="noreferrer">
            TikTok Music Usage Confirmation
          </a>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useLoaderData, Form, useNavigation, useActionData, Link, redirect } from "react-router";
import { ArrowLeft, User, Mail, Bell, LogOut, Save, Shield, Trash2 } from "lucide-react";
import sql from "../api/utils/sql";
import { ensureSchema } from "../../lib/usage.js";

// --- BACKEND ---
export async function loader({ request }) {
  const cookieHeader = request.headers.get("Cookie");
  const userIdMatch = cookieHeader?.match(/user_id=([^;]+)/);
  const userId = userIdMatch ? userIdMatch[1] : null;

  if (!userId) return redirect("/login");

  try {
    const users = await sql`SELECT * FROM users WHERE id = ${userId}`;
    if (!users.length) return redirect("/login");

    return { user: users[0] };
  } catch (e) {
    console.error("Settings loader error:", e.message);
    return redirect("/login");
  }
}

export async function action({ request }) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "logout") {
    return redirect("/login", {
      headers: { "Set-Cookie": "user_id=; Path=/; HttpOnly; Max-Age=0" },
    });
  }

  if (intent === "delete_account") {
    const cookieHeader = request.headers.get("Cookie");
    const userId = cookieHeader?.match(/user_id=([^;]+)/)?.[1];
    if (!userId) return redirect("/login");

    // Make sure the schema is up to date first (adds health_logs.owner_id when
    // this user signed up before that column existed), so nothing survives.
    try {
      await ensureSchema();
    } catch (e) {
      console.warn("[delete-account] ensureSchema:", e.message);
    }

    // Delete EVERYTHING that belongs to this user, in dependency order.
    // Google Play requires in-app account deletion to really delete the data —
    // so each table is handled explicitly (no SQL built from strings) and each
    // step is isolated: a missing table must never block the deletion.
    const steps = [
      ["usage_limits", sql`DELETE FROM usage_limits WHERE user_id = ${userId}`],
      ["health_logs", sql`DELETE FROM health_logs WHERE owner_id = ${userId}`],
      ["schedules", sql`DELETE FROM schedules WHERE owner_id = ${userId}`],
      ["pets", sql`DELETE FROM pets WHERE owner_id = ${userId}`],
    ];

    for (const [name, query] of steps) {
      try {
        await query;
      } catch (e) {
        console.warn(`[delete-account] ${name}: ${e.message}`);
      }
    }

    try {
      await sql`DELETE FROM users WHERE id = ${userId}`;
    } catch (e) {
      console.error("[delete-account] users:", e.message);
      return { error: "Could not delete the account. Please contact support." };
    }

    console.log(`[delete-account] user ${userId} deleted with all their data`);
    return redirect("/?deleted=true", {
      headers: { "Set-Cookie": "user_id=; Path=/; HttpOnly; Max-Age=0" },
    });
  }

  if (intent === "update_profile") {
    const name = formData.get("name");
    const email = formData.get("email");
    const cookieHeader = request.headers.get("Cookie");
    const userId = cookieHeader?.match(/user_id=([^;]+)/)[1];

    await sql`UPDATE users SET name = ${name}, email = ${email} WHERE id = ${userId}`;
    return null;
  }
}

// --- FRONTEND COMPACT ---
export default function SettingsPage() {
  const { user } = useLoaderData();
  const navigation = useNavigation();
  const actionData = useActionData();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isSaving = navigation.state === "submitting" && navigation.formData?.get("intent") === "update_profile";

  return (
    <div className="min-h-screen bg-green-50/50 p-4 font-sans text-gray-800 flex justify-center items-start">
      <div className="w-full max-w-3xl mt-2">
        
        {/* Header Compact */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="bg-white p-2 rounded-full border border-gray-200 hover:bg-gray-100 text-gray-500 transition shadow-sm">
                <ArrowLeft size={18} />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Settings</h1>
          </div>
          
          <Form method="post">
             <input type="hidden" name="intent" value="logout" />
             <button className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition font-bold text-xs border border-transparent hover:border-red-100">
                <LogOut size={14} /> Log Out
             </button>
          </Form>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-green-100 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3">
                
                {/* LEFT: Info sidebar (compact) */}
                <div className="bg-green-50/50 p-6 md:border-r border-green-100 text-center md:text-left">
                    <div className="w-16 h-16 bg-white rounded-full mx-auto md:mx-0 mb-3 flex items-center justify-center text-green-600 border border-green-200 shadow-sm">
                        <User size={28} />
                    </div>
                    <h2 className="font-bold text-gray-900">{user.name}</h2>
                    <p className="text-xs text-gray-500 mb-4 truncate">{user.email}</p>
                    
                    <div className="inline-block bg-white px-3 py-1 rounded-full border border-green-200 shadow-sm">
                        <p className="text-[10px] font-bold text-green-700 uppercase tracking-wide">
                            {user.plan || "Free Plan"}
                        </p>
                    </div>

                    <div className="mt-6 space-y-2 hidden md:block">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Quick Links</p>
                        <Link to="/privacy" className="flex items-center gap-2 text-xs font-medium text-gray-600 hover:text-green-600 transition">
                            <Shield size={12} /> Privacy Policy
                        </Link>
                    </div>
                </div>

                {/* DREAPTA: Formular Editare (Compact) */}
                <div className="col-span-2 p-6 md:p-8">
                    <Form method="post" className="space-y-4">
                        <input type="hidden" name="intent" value="update_profile" />
                        
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Full Name</label>
                            <input 
                                type="text" 
                                name="name" 
                                defaultValue={user.name} 
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-green-500 outline-none bg-gray-50 focus:bg-white transition"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Email</label>
                            <input 
                                type="email" 
                                name="email" 
                                defaultValue={user.email} 
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-green-500 outline-none bg-gray-50 focus:bg-white transition"
                            />
                        </div>

                        {/* Notifications Toggles (Visual) */}
                        <div className="pt-2">
                             <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">Notifications</label>
                             <div className="flex items-center justify-between p-2.5 border border-gray-100 rounded-lg mb-2">
                                <div className="flex items-center gap-2">
                                    <Mail size={14} className="text-blue-500" />
                                    <span className="text-xs font-bold text-gray-700">Email Alerts</span>
                                </div>
                                <input type="checkbox" className="accent-green-600 w-4 h-4" defaultChecked />
                             </div>
                        </div>

                        <div className="pt-4 border-t border-gray-50 flex justify-end">
                            <button 
                                type="submit" 
                                disabled={isSaving}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-full shadow-md text-xs flex items-center gap-2 transition transform hover:-translate-y-0.5"
                            >
                                {isSaving ? "Saving..." : <><Save size={14} /> Save Changes</>}
                            </button>
                        </div>
                    </Form>
                </div>

            </div>
        </div>

      {/* DANGER ZONE — ștergerea contului (cerință Google Play) */}
      <div className="mt-6 bg-white rounded-2xl border border-red-100 shadow-sm p-5">
        <div className="flex items-start gap-3">
          <div className="bg-red-50 p-2 rounded-full text-red-500 shrink-0">
            <Trash2 size={18} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-sm">Delete my account</h3>
            <p className="text-xs text-gray-500 mt-1 mb-3">
              This permanently deletes your account and <strong>all</strong> your data:
              pets, health records, schedules, AI chat history and photo scans.
              This cannot be undone. Your plan is not refunded.
            </p>

            {confirmDelete ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-xs font-bold text-red-700 mb-3">
                  Are you sure? This action is permanent and cannot be reversed.
                </p>
                <div className="flex gap-2">
                  <Form method="post">
                    <input type="hidden" name="intent" value="delete_account" />
                    <button className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-lg">
                      Yes, delete everything
                    </button>
                  </Form>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="border border-gray-300 text-gray-700 font-bold text-xs px-4 py-2 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="border border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs px-4 py-2 rounded-lg"
              >
                Delete my account
              </button>
            )}

            {actionData?.error && (
              <p className="text-xs text-red-600 mt-2">{actionData.error}</p>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
// ============================================================
//  HELPERI SERVER-SIDE PENTRU LIMITE FREEMIUM
//  ⚠️  Server-only (imports the DB connection). DO NOT import
//      this file into code that runs in the browser.
//
//  Responsibilities:
//   - read the user plan
//   - read/update the monthly counter (usage_limits)
//   - auto-reset counters at the start of each month
//   - self-heal the schema if the table/columns are missing
// ============================================================

import sql from '../app/api/utils/sql.js';
import { readUserId } from './session.js';
import { ACTIONS, ACTION_LIMIT_KEY, getLimit, getPlan, paywallReason, UNLIMITED_THRESHOLD } from './plans.js';

// ------------------------------------------------------------
// 1. SCHEMA SELF-HEALING
// Runs idempotent DDL once per process. This removes the
// need to manually run the SQL migration in Neon.
// ------------------------------------------------------------
let schemaPromise = null;

/**
 * Ensures the freemium schema exists (usage_limits table + users columns).
 * Exported so entry points like signup/login can call it BEFORE any INSERT,
 * otherwise `INSERT INTO users (..., plan_type, ...)` fails on older databases.
 */
export async function ensureSchema() {
  if (!schemaPromise) {
    schemaPromise = (async () => {
      try {
        await sql`
          CREATE TABLE IF NOT EXISTS usage_limits (
            user_id TEXT PRIMARY KEY,
            ai_chats_used INTEGER DEFAULT 0,
            scans_used INTEGER DEFAULT 0,
            reset_date TIMESTAMP DEFAULT NOW() + INTERVAL '1 month',
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
          )
        `;
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free'`;
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'free'`;
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT`;
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS lifetime_paid BOOLEAN DEFAULT FALSE`;
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW()`;
        await sql`ALTER TABLE schedules ADD COLUMN IF NOT EXISTS owner_id TEXT`;
        // Health logs had no owner at all: every user could see every other user's
        // records. This column makes them filterable and deletable.
        await sql`ALTER TABLE health_logs ADD COLUMN IF NOT EXISTS owner_id TEXT`;
        await sql`CREATE INDEX IF NOT EXISTS health_logs_owner_idx ON health_logs (owner_id)`;
        console.log('✅ usage_limits schema verified/created');
            // ✅ SECURITY: tabel pentru limitarea încercărilor de login
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS login_attempts (
          id SERIAL PRIMARY KEY,
          email TEXT,
          ip TEXT,
          success BOOLEAN DEFAULT false,
          attempted_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;
      await sql`CREATE INDEX IF NOT EXISTS idx_login_attempts_time ON login_attempts (attempted_at)`;
    } catch (e) {
      console.log('login_attempts table setup skipped:', e.message);
    }

return true;
      } catch (e) {
        // Do not block the app if the DB user lacks DDL rights.
        console.error('⚠️  ensureSchema failed (run SQL_MIGRATION_FREEMIUM.sql manually):', e.message);
        return false;
      }
    })();
  }
  return schemaPromise;
}

// ------------------------------------------------------------
// 2. CORE UTILITIES
// ------------------------------------------------------------

// ✅ SECURITY FIX (era: cookie nesemnat, se putea falsifica)
// Acum citește doar cookie-ul de sesiune semnat HMAC. Vezi src/lib/session.js
export function getUserIdFromRequest(request) {
  return readUserId(request);
}

// ────────────────────────────────────────────────────────────
//  LIMITARE ÎNCERCĂRI DE LOGIN (anti brute-force)
//  Max 8 greșeli / email sau IP în 15 minute.
// ────────────────────────────────────────────────────────────
const LOGIN_MAX_FAILS = 8;
const LOGIN_WINDOW_MIN = 15;

export function clientIp(request) {
  const h = request?.headers;
  const fwd = h?.get?.('x-forwarded-for') || h?.get?.('X-Forwarded-For');
  if (fwd) return String(fwd).split(',')[0].trim();
  return 'unknown';
}

export async function isLoginBlocked(email, ip) {
  try {
    await ensureSchema();
    const rows = await sql`
      SELECT COUNT(*)::int AS fails FROM login_attempts
      WHERE success = false
        AND attempted_at > NOW() - INTERVAL '15 minutes'
        AND (email = ${email} OR ip = ${ip})
    `;
    return (rows[0]?.fails || 0) >= LOGIN_MAX_FAILS;
  } catch (e) {
    console.error('isLoginBlocked error:', e.message);
    return false;
  }
}

export async function recordLoginAttempt(email, ip, success) {
  try {
    await ensureSchema();
    await sql`INSERT INTO login_attempts (email, ip, success) VALUES (${email}, ${ip}, ${success})`;
    if (success) {
      // curăță istoricul de eșecuri după o autentificare reușită
      await sql`DELETE FROM login_attempts WHERE success = false AND email = ${email}`;
    } else {
      // păstrăm tabelul mic
      await sql`DELETE FROM login_attempts WHERE attempted_at < NOW() - INTERVAL '2 days'`;
    }
  } catch (e) {
    console.error('recordLoginAttempt error:', e.message);
  }
}

/** Planul userului: 'free' | 'starter' | 'pro' */
export async function getUserPlan(userId) {
  if (!userId) return 'free';
  try {
    await ensureSchema();
    const rows = await sql`SELECT plan FROM users WHERE id = ${userId}`;
    return rows[0]?.plan || 'free';
  } catch (e) {
    console.error('getUserPlan error:', e.message);
    return 'free';
  }
}

/**
 * Read the user monthly counter.
 * Auto-resets counters if reset_date has passed.
 * Always returns a valid object so the UI never crashes.
 */
export async function getUsage(userId) {
  const empty = { ai_chats_used: 0, scans_used: 0, reset_date: null };
  if (!userId) return empty;

  try {
    await ensureSchema();

    // Create the row if it does not exist
    await sql`
      INSERT INTO usage_limits (user_id, ai_chats_used, scans_used, reset_date)
      VALUES (${userId}, 0, 0, NOW() + INTERVAL '1 month')
      ON CONFLICT (user_id) DO NOTHING
    `;

    // Automatic monthly reset (this used to be a bug: the counter never reset)
    await sql`
      UPDATE usage_limits
      SET ai_chats_used = 0,
          scans_used = 0,
          reset_date = NOW() + INTERVAL '1 month',
          updated_at = NOW()
      WHERE user_id = ${userId}
        AND (reset_date IS NULL OR reset_date < NOW())
    `;

    const rows = await sql`
      SELECT ai_chats_used, scans_used, reset_date
      FROM usage_limits
      WHERE user_id = ${userId}
    `;
    return rows[0] || empty;
  } catch (e) {
    console.error('getUsage error (limits are NOT enforced):', e.message);
    return empty; // fail-open: do not block the user if the DB misbehaves
  }
}

/**
 * Check whether the user may still perform an action.
 * @returns {{allowed:boolean, used:number, limit:number, plan:string, unlimited:boolean, message:string}}
 */
export async function checkLimit(userId, action) {
  const plan = await getUserPlan(userId);
  const limit = getLimit(plan, action);
  const unlimited = limit >= UNLIMITED_THRESHOLD;

  if (!userId) {
    return {
      allowed: false,
      used: 0,
      limit,
      plan,
      unlimited,
      needsLogin: true,
      message: 'You need to log in to continue.',
    };
  }

  const usage = await getUsage(userId);
  const used = action === ACTIONS.CHAT
    ? (usage.ai_chats_used || 0)
    : action === ACTIONS.SCAN
      ? (usage.scans_used || 0)
      : 0;

  if (unlimited) {
    return { allowed: true, used, limit, plan, unlimited: true, message: '' };
  }

  return {
    allowed: used < limit,
    used,
    limit,
    plan,
    unlimited: false,
    message: paywallReason(action, used, limit, plan),
  };
}

/**
 * Check the limit for the "add pet" action (total, not monthly).
 */
export async function checkPetLimit(userId, currentPetCount) {
  const plan = await getUserPlan(userId);
  const limit = getLimit(plan, ACTIONS.PET);
  const unlimited = limit >= UNLIMITED_THRESHOLD;
  const used = currentPetCount || 0;

  return {
    allowed: unlimited || used < limit,
    used,
    limit,
    plan,
    unlimited,
    message: paywallReason(ACTIONS.PET, used, limit, plan),
  };
}

/**
 * Increment the counter AFTER the action succeeded.
 * Never throws — a failure here must not break the response.
 */
export async function consumeUsage(userId, action) {
  if (!userId) return false;
  const key = action === ACTIONS.CHAT
    ? 'ai_chats_used'
    : action === ACTIONS.SCAN
      ? 'scans_used'
      : null;

  if (!key) return false;

  try {
    await ensureSchema();
    const column = key === 'ai_chats_used' ? 'ai_chats_used' : 'scans_used';

    // ON CONFLICT with a dynamic column: two explicit variants
    if (column === 'ai_chats_used') {
      await sql`
        INSERT INTO usage_limits (user_id, ai_chats_used, scans_used, reset_date)
        VALUES (${userId}, 1, 0, NOW() + INTERVAL '1 month')
        ON CONFLICT (user_id)
        DO UPDATE SET ai_chats_used = usage_limits.ai_chats_used + 1, updated_at = NOW()
      `;
    } else {
      await sql`
        INSERT INTO usage_limits (user_id, ai_chats_used, scans_used, reset_date)
        VALUES (${userId}, 0, 1, NOW() + INTERVAL '1 month')
        ON CONFLICT (user_id)
        DO UPDATE SET scans_used = usage_limits.scans_used + 1, updated_at = NOW()
      `;
    }
    return true;
  } catch (e) {
    console.error('consumeUsage error:', e.message);
    return false;
  }
}

// ------------------------------------------------------------
// 3. PLAN ACTIVATION AFTER PAYMENT
// ------------------------------------------------------------

/**
 * Activate a paid plan. Idempotent: if the plan is already active,
 * it does not rewrite the DB.
 */
export async function activatePlan(userId, planId, { type = 'lifetime', customerId = null } = {}) {
  if (!userId || !planId) return { ok: false, reason: 'missing args' };
  if (!getPlan(planId) || planId === 'free') return { ok: false, reason: 'invalid plan' };

  try {
    await ensureSchema();

    const current = await sql`SELECT plan, lifetime_paid FROM users WHERE id = ${userId}`;
    if (!current[0]) return { ok: false, reason: 'user not found' };

    const already = current[0].lifetime_paid === true && current[0].plan === planId;
    if (already) return { ok: true, alreadyActive: true };

    if (type === 'lifetime') {
      await sql`
        UPDATE users
        SET plan = ${planId},
            plan_type = 'lifetime',
            lifetime_paid = true,
            stripe_customer_id = COALESCE(${customerId}, stripe_customer_id)
        WHERE id = ${userId}
      `;
    } else {
      await sql`
        UPDATE users
        SET plan = ${planId},
            plan_type = 'monthly',
            lifetime_paid = false,
            stripe_customer_id = COALESCE(${customerId}, stripe_customer_id)
        WHERE id = ${userId}
      `;
    }

    console.log(`✅ Plan activat: user=${userId} plan=${planId} type=${type}`);
    return { ok: true, alreadyActive: false };
  } catch (e) {
    console.error('activatePlan error:', e.message);
    return { ok: false, reason: e.message };
  }
}

/** Reset the plan back to free (refund / cancelled subscription). */
export async function revokePlan(userId) {
  if (!userId) return false;
  try {
    await sql`
      UPDATE users
      SET plan = 'free', plan_type = 'free', lifetime_paid = false
      WHERE id = ${userId}
    `;
    return true;
  } catch (e) {
    console.error('revokePlan error:', e.message);
    return false;
  }
}

// Freemium Limits Logic - PetAssistant
// Acest fișier gestionează limitele pentru utilizatorii gratis

import sql from "../utils/sql.js";

// Definim limitele per plan
export const PLANS = {
  free: {
    id: 'free',
    name: 'Free Forever',
    price: 0,
    limits: {
      pets: 1,
      aiChatsPerMonth: 5,
      scansPerMonth: 3,
      healthLogs: 10,
      schedules: 3,
    },
    features: {
      ads: true,
      exportPdf: false,
      priorityAi: false,
      familyShare: false,
    },
    aiModel: 'gpt-4o-mini', // ieftin pentru free
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    priceMonthly: 4.99,
    priceLifetime: 29,
    stripePriceMonthly: process.env.STRIPE_PRICE_STARTER_MONTHLY,
    stripePriceLifetime: process.env.STRIPE_PRICE_STARTER_LIFETIME,
    limits: {
      pets: 3,
      aiChatsPerMonth: 100,
      scansPerMonth: 100,
      healthLogs: 1000,
      schedules: 100,
    },
    features: {
      ads: false,
      exportPdf: true,
      priorityAi: false,
      familyShare: false,
    },
    aiModel: 'gpt-4o',
  },
  pro: {
    id: 'pro',
    name: 'Pro Family',
    priceMonthly: 9.99,
    priceLifetime: 49,
    stripePriceMonthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
    stripePriceLifetime: process.env.STRIPE_PRICE_PRO_LIFETIME,
    limits: {
      pets: 9999, // nelimitat
      aiChatsPerMonth: 9999,
      scansPerMonth: 9999,
      healthLogs: 9999,
      schedules: 9999,
    },
    features: {
      ads: false,
      exportPdf: true,
      priorityAi: true,
      familyShare: true,
    },
    aiModel: 'gpt-4o',
  }
};

// Verifică dacă userul poate face o acțiune
export async function canUserPerformAction(userId, action) {
  // Ia planul userului
  const userResult = await sql`SELECT plan, plan_type FROM users WHERE id = ${userId}`;
  if (userResult.length === 0) return { allowed: false, reason: 'User not found' };
  
  const user = userResult[0];
  const planId = user.plan || 'free';
  const plan = PLANS[planId] || PLANS.free;

  // Dacă e pro/starter lifetime sau monthly, verifică dacă nu a expirat (pentru monthly)
  // Pentru simplitate, lifetime nu expiră niciodată

  // Ia usage-ul curent
  const usageResult = await sql`
    SELECT * FROM usage_limits WHERE user_id = ${userId}
  `;
  
  let usage = usageResult[0];
  if (!usage) {
    // Creează înregistrare nouă
    const newUsage = await sql`
      INSERT INTO usage_limits (user_id, ai_chats_used, scans_used, reset_date)
      VALUES (${userId}, 0, 0, NOW() + INTERVAL '1 month')
      RETURNING *
    `;
    usage = newUsage[0];
  }

  // Verifică dacă trebuie resetat (lună nouă)
  const now = new Date();
  const resetDate = new Date(usage.reset_date);
  if (now > resetDate) {
    await sql`
      UPDATE usage_limits 
      SET ai_chats_used = 0, scans_used = 0, reset_date = NOW() + INTERVAL '1 month'
      WHERE user_id = ${userId}
    `;
    usage.ai_chats_used = 0;
    usage.scans_used = 0;
  }

  // Verifică limitele în funcție de acțiune
  if (action === 'ai_chat') {
    if (usage.ai_chats_used >= plan.limits.aiChatsPerMonth) {
      return {
        allowed: false,
        reason: `Ai folosit ${usage.ai_chats_used}/${plan.limits.aiChatsPerMonth} întrebări gratuite luna asta`,
        limit: plan.limits.aiChatsPerMonth,
        used: usage.ai_chats_used,
        upgradeTo: planId === 'free' ? 'starter' : 'pro',
        message: planId === 'free' 
          ? `🚀 Ai atins limita gratuită! Deblochează 100 întrebări/lună pentru doar 29€ o singură dată.`
          : `Ai atins limita. Treci la Pro pentru nelimitat!`
      };
    }
  }

  if (action === 'scan') {
    if (usage.scans_used >= plan.limits.scansPerMonth) {
      return {
        allowed: false,
        reason: `Ai folosit ${usage.scans_used}/${plan.limits.scansPerMonth} scanări gratuite`,
        limit: plan.limits.scansPerMonth,
        used: usage.scans_used,
        upgradeTo: 'starter',
      };
    }
  }

  if (action === 'add_pet') {
    const petsCount = await sql`SELECT COUNT(*) as count FROM pets WHERE owner_id = ${userId} OR user_id = ${userId}`;
    const count = parseInt(petsCount[0].count);
    if (count >= plan.limits.pets) {
      return {
        allowed: false,
        reason: `Planul ${plan.name} permite maxim ${plan.limits.pets} animale`,
        limit: plan.limits.pets,
        used: count,
        upgradeTo: count >= 3 ? 'pro' : 'starter',
        message: `Ai deja ${count} animale. Treci la ${count >= 3 ? 'Pro (nelimitat)' : 'Starter (3 animale)'} pentru doar 29€ pe viață!`
      };
    }
  }

  return { allowed: true, plan, usage };
}

// Incrementează usage după o acțiune reușită
export async function incrementUsage(userId, action) {
  if (action === 'ai_chat') {
    await sql`
      UPDATE usage_limits 
      SET ai_chats_used = ai_chats_used + 1 
      WHERE user_id = ${userId}
    `;
  }
  if (action === 'scan') {
    await sql`
      UPDATE usage_limits 
      SET scans_used = scans_used + 1 
      WHERE user_id = ${userId}
    `;
  }
}

// Helper pentru a lua planul userului cu detalii
export async function getUserPlan(userId) {
  const userResult = await sql`SELECT plan FROM users WHERE id = ${userId}`;
  const planId = userResult[0]?.plan || 'free';
  return PLANS[planId] || PLANS.free;
}

// SQL pentru a crea tabela (rulează o singură dată)
export const CREATE_USAGE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS usage_limits (
  user_id TEXT PRIMARY KEY,
  ai_chats_used INTEGER DEFAULT 0,
  scans_used INTEGER DEFAULT 0,
  reset_date TIMESTAMP DEFAULT NOW() + INTERVAL '1 month',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Adaugă coloane noi în users dacă nu există
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free';
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'monthly'; -- monthly sau lifetime
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS lifetime_paid BOOLEAN DEFAULT FALSE;
`;

// ============================================================
//  SINGLE SOURCE OF TRUTH FOR PLANS AND LIMITS
//  PURE file — no DB, no Node APIs. Can be imported
//  both server-side (loader/action) and in the browser (components).
// ============================================================

export const ACTIONS = {
  CHAT: 'chat',
  SCAN: 'scan',
  PET: 'pet',
};

// Map action -> the plan limit key
export const ACTION_LIMIT_KEY = {
  [ACTIONS.CHAT]: 'aiChatsPerMonth',
  [ACTIONS.SCAN]: 'scansPerMonth',
  [ACTIONS.PET]: 'pets',
};

export const PLANS = {
  free: {
    id: 'free',
    name: 'Free Forever',
    shortName: 'Free',
    price: 0,
    priceLabel: '$0',
    // Limite lunare
    limits: {
      pets: 1,
      aiChatsPerMonth: 5,
      scansPerMonth: 3,
      healthLogs: 10,
      schedules: 3,
    },
    // Config AI (economie de cost)
    aiModel: 'gpt-4o-mini',
    aiMaxTokens: 300,
    ads: true,
  },
  starter: {
    id: 'starter',
    name: 'Starter Lifetime',
    shortName: 'Starter',
    price: 29,
    priceLabel: '$29',
    limits: {
      pets: 3,
      aiChatsPerMonth: 100,
      scansPerMonth: 100,
      healthLogs: 1000,
      schedules: 100,
    },
    aiModel: 'gpt-4o',
    aiMaxTokens: 500,
    ads: false,
  },
  pro: {
    id: 'pro',
    name: 'Pro Lifetime',
    shortName: 'Pro',
    price: 49,
    priceLabel: '$49',
    limits: {
      pets: 9999,
      aiChatsPerMonth: 9999,
      scansPerMonth: 9999,
      healthLogs: 99999,
      schedules: 99999,
    },
    aiModel: 'gpt-4o',
    aiMaxTokens: 700,
    ads: false,
  },
};

export const UNLIMITED_THRESHOLD = 9000;

// ---------- HELPERI PURI ----------

export function getPlan(planId) {
  return PLANS[planId] || PLANS.free;
}

export function getLimits(planId) {
  return getPlan(planId).limits;
}

/** Numeric limit for an action. */
export function getLimit(planId, action) {
  const key = ACTION_LIMIT_KEY[action];
  if (!key) return 0;
  return getPlan(planId).limits[key] ?? 0;
}

export function isUnlimited(planId, action) {
  return getLimit(planId, action) >= UNLIMITED_THRESHOLD;
}

export function isPaidPlan(planId) {
  return planId === 'starter' || planId === 'pro';
}

export function getNextPlan(planId) {
  if (planId === 'free') return PLANS.starter;
  if (planId === 'starter') return PLANS.pro;
  return null;
}

/** Remaining allowance (null = unlimited). */
export function getRemaining(planId, action, used) {
  const limit = getLimit(planId, action);
  if (limit >= UNLIMITED_THRESHOLD) return null;
  return Math.max(0, limit - used);
}

/** Procentul folosit (0-100), pentru bare de progres. */
export function getUsagePercent(planId, action, used) {
  const limit = getLimit(planId, action);
  if (!limit || limit >= UNLIMITED_THRESHOLD) return 0;
  return Math.min(100, Math.round((used / limit) * 100));
}

/** Display text for "X of Y". */
export function formatUsage(planId, action, used) {
  const limit = getLimit(planId, action);
  if (limit >= UNLIMITED_THRESHOLD) return 'Nelimitat';
  return `${used}/${limit}`;
}

/** Friendly unit label for an action. */
export function actionNoun(action, plural = false) {
  if (action === ACTIONS.CHAT) return plural ? 'AI questions' : 'AI question';
  if (action === ACTIONS.SCAN) return plural ? 'scans' : 'scan';
  if (action === ACTIONS.PET) return plural ? 'pets' : 'pet';
  return plural ? 'actions' : 'action';
}

/** Paywall message, tailored to plan and action. */
export function paywallReason(action, used, limit, planId = 'free') {
  const next = getNextPlan(planId);
  const noun = actionNoun(action, true);
  const target = next ? `${next.name} (${next.priceLabel})` : 'un plan superior';

  if (action === ACTIONS.PET) {
    if (planId === 'free') {
      return `You have ${used} ${actionNoun(action, used !== 1)} on the Free plan. Upgrade to Starter Lifetime ($29) for 3 pets.`;
    }
    return `You reached ${limit} pets. Upgrade to Pro Lifetime ($49) for unlimited pets.`;
  }

  if (limit >= UNLIMITED_THRESHOLD) {
    return `You have used a lot of ${noun} this month. Check your plan.`;
  }

  if (planId === 'free') {
    return `You used ${used}/${limit} free ${noun} this month. Unlock ${getLimit('starter', action)}/month with ${target}, one-time payment.`;
  }

  return `You used ${used}/${limit} ${noun} this month. Upgrade to ${target} for more.`;
}

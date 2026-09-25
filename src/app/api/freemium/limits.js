// ============================================================
//  ⚠️  NOTE: this file is kept only for backward compatibility.
//
//  This file is NOT a route (routes.ts only registers
//  `page.jsx` files), so it was never executed.
//
//  The real limits logic now lives in:
//    - src/lib/plans.js   → plan + limit definitions (pure, client-safe)
//    - src/lib/usage.js   → counter read/write, monthly reset, plan activation
//
//  Do not add logic here. Edit src/lib/plans.js instead.
// ============================================================

export * from "../../../lib/plans.js";

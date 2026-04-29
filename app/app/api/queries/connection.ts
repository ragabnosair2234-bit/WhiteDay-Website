// This file is a compatibility shim - the real DB queries now use api/lib/db.ts (msnodesqlv8)
// Kept here to satisfy any remaining imports during the transition.
export function getDb() {
  throw new Error("getDb() is deprecated. Use query() from api/lib/db.ts instead.");
}

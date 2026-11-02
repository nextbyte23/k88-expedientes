import { db } from "@/lib/db";

/**
 * Writes CorrectionLog rows for any field that differs between old and new values.
 * Returns the list of corrections written.
 */
export async function logCorrections(opts: {
  recordType:
    | "MEDICAL_RECORD"
    | "DENTAL_RECORD"
    | "EVOLUTION_NOTE"
    | "PRESCRIPTION";
  recordId: string;
  userId: string;
  oldValues: Record<string, unknown>;
  newValues: Record<string, unknown>;
  reason?: string;
}) {
  const { recordType, recordId, userId, oldValues, newValues, reason } = opts;
  const writes = [];
  for (const key of Object.keys(newValues)) {
    if (key === "updatedAt" || key === "createdAt") continue;
    const oldV = oldValues[key];
    const newV = newValues[key];
    if (oldV === undefined && newV === undefined) continue;
    const oldStr = oldV === null || oldV === undefined ? "" : String(oldV);
    const newStr = newV === null || newV === undefined ? "" : String(newV);
    if (oldStr === newStr) continue;
    writes.push(
      db.correctionLog.create({
        data: {
          recordType,
          recordId,
          userId,
          fieldName: key,
          oldValue: oldStr || null,
          newValue: newStr || null,
          reason: reason || null,
        },
      })
    );
  }
  if (writes.length === 0) return [];
  return Promise.all(writes);
}

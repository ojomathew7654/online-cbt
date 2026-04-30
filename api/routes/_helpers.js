import prisma from "../prisma/prisma.js";

/**
 * Generate a sequential entry number like JE-20250001
 */

export async function generateEntryNumber(schoolId) {
  const last = await prisma.journalEntry.findFirst({
    where: { schoolId },
    orderBy: { createdAt: "desc" },
    select: { entryNumber: true },
  });

  let nextNum = 1;

  if (last?.entryNumber) {
    // Extract the last 4 digits: "JE-20260009" → 9
    const match = last.entryNumber.match(/(\d{4})$/);
    if (match) nextNum = parseInt(match[1]) + 1;
  }

  const padded = String(nextNum).padStart(4, "0");
  const year = new Date().getFullYear();
  return `JE-${year}${padded}`;
}

/**
 * Generate a receipt number like RCP-20250001
 */

export async function generateReceiptNumber() {
  const last = await prisma.feePayment.findFirst({
    orderBy: { createdAt: "desc" },
    select: { receiptNumber: true },
  });

  let nextNum = 1;

  if (last?.receiptNumber) {
    const match = last.receiptNumber.match(/(\d{4})$/);
    if (match) nextNum = parseInt(match[1]) + 1;
  }

  const padded = String(nextNum).padStart(4, "0");
  const year = new Date().getFullYear();
  return `RCP-${year}${padded}`;
}

/**
 * Guard: throw if session is locked
 */
export async function assertSessionNotLocked(sessionId) {
  const session = await prisma.academicSession.findUnique({
    where: { id: sessionId },
  });
  if (!session) throw new Error("Academic session not found.");
  if (session.isLocked)
    throw new Error("This session is locked. No new transactions allowed.");
  return session;
}

/**
 * Create an audit log entry
 */
export async function createAuditLog({
  action,
  entity,
  entityId,
  userId,
  schoolId,
  oldData = null,
  newData = null,
}) {
  await prisma.auditLog.create({
    data: { action, entity, entityId, userId, schoolId, oldData, newData },
  });
}

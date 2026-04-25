import express from "express";
const loanDonationRoute = express.Router();
import expressAsyncHandler from "express-async-handler";
import prisma from "../prisma/prisma.js";
import {
  generateEntryNumber,
  assertSessionNotLocked,
  createAuditLog,
} from "./_helpers.js";
import { protect } from "../middleware/auth.js";

// ════════════════════════════════════════════════
// LOANS
// ════════════════════════════════════════════════

// ─── Record Loan Received ─────────────────────────────────────────────────
// ACCOUNTING RULE:
//   Debit:  Cash account      (money received)
//   Credit: Loan Liability    (obligation created)
loanDonationRoute.post(
  "/loans",
  protect,
  expressAsyncHandler(async (req, res) => {
    const {
      amount,
      lender,
      description,
      dateReceived,
      repaymentDate,
      liabilityAccountId,
      cashAccountId,
      sessionId,
      schoolId,
      createdById,
    } = req.body;

    if (
      !amount ||
      !lender ||
      !dateReceived ||
      !liabilityAccountId ||
      !cashAccountId ||
      !sessionId ||
      !schoolId ||
      !createdById
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided." });
    }

    await assertSessionNotLocked(sessionId);

    const entryNumber = await generateEntryNumber(schoolId);

    const [loan, journalEntry] = await prisma.$transaction([
      prisma.loan.create({
        data: {
          amount,
          amountRepaid: 0, // ← track repayments
          lender,
          description,
          dateReceived: new Date(dateReceived),
          repaymentDate: repaymentDate ? new Date(repaymentDate) : null,
          status: "ACTIVE",
          liabilityAccountId,
          cashAccountId,
          sessionId,
          schoolId,
        },
      }),

      prisma.journalEntry.create({
        data: {
          entryNumber,
          date: new Date(dateReceived),
          description: `Loan received from ${lender}`,
          source: "LOAN",
          status: "POSTED",
          postedAt: new Date(),
          sessionId,
          schoolId,
          createdById,
          lines: {
            create: [
              {
                accountId: cashAccountId,
                entryType: "DEBIT",
                amount,
                narration: `Cash from loan — ${lender}`,
              },
              {
                accountId: liabilityAccountId,
                entryType: "CREDIT",
                amount,
                narration: `Loan liability — ${lender}`,
              },
            ],
          },
        },
      }),
    ]);

    // Link journal entry to loan
    await prisma.loan.update({
      where: { id: loan.id },
      data: { journalEntryId: journalEntry.id },
    });

    await createAuditLog({
      action: "CREATE",
      entity: "Loan",
      entityId: loan.id,
      userId: createdById,
      schoolId,
      newData: { amount, lender },
    });

    res.status(201).json({ loan, journalEntry });
  }),
);

// ─── Repay Loan (Partial or Full) ─────────────────────────────────────────
// Supports multiple partial repayments. Auto-marks PAID when balance hits 0.
// ACCOUNTING RULE (each repayment):
//   Debit:  Loan Liability account  (reduces the debt)
//   Credit: Cash account            (cash leaves the school)
loanDonationRoute.post(
  "/loans/:id/repay",
  protect,
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    const { amount, note } = req.body;
    const userId = req.user.id;

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res
        .status(400)
        .json({ message: "A valid repayment amount is required." });
    }

    const loan = await prisma.loan.findUnique({ where: { id } });

    if (!loan) {
      return res.status(404).json({ message: "Loan not found." });
    }

    if (loan.status === "PAID") {
      return res
        .status(400)
        .json({ message: "This loan is already fully paid." });
    }

    await assertSessionNotLocked(loan.sessionId);

    const balance = loan.amount - loan.amountRepaid;
    const repayAmount = Number(amount);

    // ── Overpayment guard ─────────────────────────────────────────────────
    if (repayAmount > balance) {
      return res.status(400).json({
        message: `Repayment amount (${repayAmount}) exceeds remaining balance (${balance}). Maximum allowed is ${balance}.`,
      });
    }

    const newAmountRepaid = loan.amountRepaid + repayAmount;
    const newBalance = loan.amount - newAmountRepaid;
    const isFullyPaid = newBalance === 0;

    const entryNumber = await generateEntryNumber(loan.schoolId);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create repayment journal entry
      const journalEntry = await tx.journalEntry.create({
        data: {
          entryNumber,
          date: new Date(),
          description: `Loan repayment to ${loan.lender}${note ? ` — ${note}` : ""}`,
          source: "LOAN_REPAYMENT",
          status: "POSTED",
          postedAt: new Date(),
          sessionId: loan.sessionId,
          schoolId: loan.schoolId,
          createdById: userId,
          lines: {
            create: [
              {
                accountId: loan.liabilityAccountId,
                entryType: "DEBIT", // reduces liability
                amount: repayAmount,
                narration: `Loan repayment — ${loan.lender}${note ? ` (${note})` : ""}`,
              },
              {
                accountId: loan.cashAccountId,
                entryType: "CREDIT", // cash leaves
                amount: repayAmount,
                narration: `Cash paid for loan — ${loan.lender}`,
              },
            ],
          },
        },
      });

      // 2. Create repayment record
      const repayment = await tx.loanRepayment.create({
        data: {
          loanId: id,
          amount: repayAmount,
          note: note || null,
          journalEntryId: journalEntry.id,
          paidById: userId,
          schoolId: loan.schoolId,
        },
      });

      // 3. Update loan — reduce amountRepaid, auto-set PAID if balance reaches 0
      const updatedLoan = await tx.loan.update({
        where: { id },
        data: {
          amountRepaid: newAmountRepaid,
          status: isFullyPaid ? "PAID" : "ACTIVE",
          ...(isFullyPaid ? { repaymentJournalEntryId: journalEntry.id } : {}),
        },
      });

      return { journalEntry, repayment, updatedLoan };
    });

    await createAuditLog({
      action: "LOAN_REPAYMENT",
      entity: "Loan",
      entityId: id,
      userId,
      schoolId: loan.schoolId,
      newData: {
        repaymentAmount: repayAmount,
        newBalance,
        fullyPaid: isFullyPaid,
      },
    });

    res.status(201).json({
      message: isFullyPaid
        ? "Loan fully repaid and marked as PAID."
        : `Repayment of ${repayAmount} recorded. Remaining balance: ${newBalance}.`,
      repayment: result.repayment,
      loan: result.updatedLoan,
      newBalance,
      isFullyPaid,
    });
  }),
);

// ─── Get Repayments for a Loan ────────────────────────────────────────────
loanDonationRoute.get(
  "/loans/:id/repayments",
  protect,
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;

    const repayments = await prisma.loanRepayment.findMany({
      where: { loanId: id },
      include: {
        paidBy: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(repayments);
  }),
);

// ─── Get All Loans ────────────────────────────────────────────────────────
loanDonationRoute.get(
  "/loans/school/:schoolId",
  expressAsyncHandler(async (req, res) => {
    const { schoolId } = req.params;
    const { sessionId, status } = req.query;

    const loans = await prisma.loan.findMany({
      where: {
        schoolId,
        ...(sessionId ? { sessionId } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        LiabilityAccount: { select: { name: true, code: true } },
        CashAccount: { select: { name: true, code: true } },
        repayments: {
          orderBy: { createdAt: "desc" },
          include: { paidBy: { select: { name: true } } },
        },
      },
      orderBy: { dateReceived: "desc" },
    });

    res.json(loans);
  }),
);

// ════════════════════════════════════════════════
// DONATIONS
// ════════════════════════════════════════════════

// ─── Record Donation ──────────────────────────────────────────────────────
// ACCOUNTING RULE:
//   Debit:  Cash account        (money received)
//   Credit: Donation Revenue    (income recognised)
loanDonationRoute.post(
  "/donations",
  protect,
  expressAsyncHandler(async (req, res) => {
    const {
      donorName,
      amount,
      description,
      date,
      revenueAccountId,
      cashAccountId,
      sessionId,
      schoolId,
      createdById,
    } = req.body;

    if (
      !amount ||
      !date ||
      !revenueAccountId ||
      !cashAccountId ||
      !sessionId ||
      !schoolId ||
      !createdById
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided." });
    }

    await assertSessionNotLocked(sessionId);

    const entryNumber = await generateEntryNumber(schoolId);

    const [donation, journalEntry] = await prisma.$transaction([
      prisma.donation.create({
        data: {
          donorName,
          amount,
          description,
          date: new Date(date),
          revenueAccountId,
          cashAccountId,
          sessionId,
          schoolId,
        },
      }),

      prisma.journalEntry.create({
        data: {
          entryNumber,
          date: new Date(date),
          description: `Donation received${donorName ? ` from ${donorName}` : ""}`,
          source: "DONATION",
          status: "POSTED",
          postedAt: new Date(),
          sessionId,
          schoolId,
          createdById,
          lines: {
            create: [
              {
                accountId: cashAccountId,
                entryType: "DEBIT",
                amount,
                narration: `Cash from donation${donorName ? ` — ${donorName}` : ""}`,
              },
              {
                accountId: revenueAccountId,
                entryType: "CREDIT",
                amount,
                narration: `Donation revenue${donorName ? ` — ${donorName}` : ""}`,
              },
            ],
          },
        },
      }),
    ]);

    // Link journal entry to donation
    await prisma.donation.update({
      where: { id: donation.id },
      data: { journalEntryId: journalEntry.id },
    });

    await createAuditLog({
      action: "CREATE",
      entity: "Donation",
      entityId: donation.id,
      userId: createdById,
      schoolId,
      newData: { amount, donorName },
    });

    res.status(201).json({ donation, journalEntry });
  }),
);

// ─── Get All Donations ────────────────────────────────────────────────────
loanDonationRoute.get(
  "/donations/school/:schoolId",
  expressAsyncHandler(async (req, res) => {
    const { schoolId } = req.params;
    const { sessionId } = req.query;

    const donations = await prisma.donation.findMany({
      where: { schoolId, ...(sessionId ? { sessionId } : {}) },
      include: {
        RevenueAccount: { select: { name: true, code: true } },
        CashAccount: { select: { name: true, code: true } },
      },
      orderBy: { date: "desc" },
    });

    const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0);

    res.json({ donations, totalDonated });
  }),
);

export default loanDonationRoute;

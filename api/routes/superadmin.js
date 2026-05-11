import express from "express";
const superAdminRoute = express.Router();
import expressAsyncHandler from "express-async-handler";
import prisma from "../prisma/prisma.js";
import { protect, requireRole } from "../middleware/auth.js";

// ─── Get All Schools ───────────────────────────────────────────────────────
superAdminRoute.get(
  "/schools",
  protect,
  requireRole("SUPER_ADMIN"),
  expressAsyncHandler(async (req, res) => {
    const schools = await prisma.school.findMany({
      include: {
        _count: {
          select: { users: true, students: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(schools);
  }),
);

// ─── Get Single School ─────────────────────────────────────────────────────
superAdminRoute.get(
  "/schools/:id",
  protect,
  requireRole("SUPER_ADMIN"),
  expressAsyncHandler(async (req, res) => {
    const school = await prisma.school.findUnique({
      where: { id: req.params.id },
      include: {
        _count: { select: { users: true, students: true } },
      },
    });
    if (!school) return res.status(404).json({ message: "School not found." });
    res.json(school);
  }),
);

// ─── Get Users for a School ───────────────────────────────────────────────
superAdminRoute.get(
  "/schools/:id/users",
  protect,
  requireRole("SUPER_ADMIN"),
  expressAsyncHandler(async (req, res) => {
    const users = await prisma.user.findMany({
      where: { schoolId: req.params.id },
      select: {
        id: true,
        username: true,
        password: true,
        name: true,
        role: true,
        gender: true,
        schoolId: true,
      },
      orderBy: { role: "asc" },
    });
    res.json(users);
  }),
);

// ─── Create School ─────────────────────────────────────────────────────────
superAdminRoute.post(
  "/schools",
  protect,
  requireRole("SUPER_ADMIN"),
  expressAsyncHandler(async (req, res) => {
    const { name, fullName, classes } = req.body;

    if (!name || !classes || classes.length === 0) {
      return res.status(400).json({
        message: "School name and at least one class are required.",
      });
    }

    const existing = await prisma.school.findUnique({ where: { name } });
    if (existing) {
      return res.status(409).json({
        message: `A school with name "${name}" already exists.`,
      });
    }

    const school = await prisma.school.create({
      data: {
        name,
        fullName,
        classes: classes.map((c) => c.toLowerCase().trim()),
      },
    });

    res.status(201).json(school);
  }),
);

// ─── Update School ─────────────────────────────────────────────────────────
superAdminRoute.put(
  "/schools/:id",
  protect,
  requireRole("SUPER_ADMIN"),
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, fullName, classes } = req.body;

    const school = await prisma.school.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(fullName !== undefined ? { fullName } : {}),
        ...(classes
          ? { classes: classes.map((c) => c.toLowerCase().trim()) }
          : {}),
      },
    });

    res.json(school);
  }),
);

// ─── Delete School ─────────────────────────────────────────────────────────
superAdminRoute.delete(
  "/schools/:id",
  protect,
  requireRole("SUPER_ADMIN"),
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;

    await prisma.auditLog.deleteMany({ where: { schoolId: id } });

    // Nullify all journalEntryId foreign keys BEFORE deleting journal entries
    await prisma.donation.updateMany({
      where: { schoolId: id },
      data: { journalEntryId: null },
    });
    await prisma.feePayment.updateMany({
      where: { schoolId: id },
      data: { journalEntryId: null },
    });
    await prisma.expense.updateMany({
      where: { schoolId: id },
      data: { journalEntryId: null },
    });
    await prisma.loan.updateMany({
      where: { schoolId: id },
      data: { journalEntryId: null, repaymentJournalEntryId: null },
    });
    await prisma.loanRepayment.updateMany({
      where: { schoolId: id },
      data: { journalEntryId: null },
    });

    // Now safe to delete journal data
    await prisma.journalLine.deleteMany({
      where: { JournalEntry: { schoolId: id } },
    });
    await prisma.journalEntry.updateMany({
      where: { schoolId: id },
      data: { reversalOfId: null },
    });
    await prisma.journalEntry.deleteMany({ where: { schoolId: id } });

    // Now delete the rest
    await prisma.feePayment.deleteMany({ where: { schoolId: id } });
    await prisma.studentFee.deleteMany({ where: { schoolId: id } });
    await prisma.feeStructure.deleteMany({ where: { schoolId: id } });
    await prisma.expense.deleteMany({ where: { schoolId: id } });
    await prisma.donation.deleteMany({ where: { schoolId: id } });
    await prisma.loanRepayment.deleteMany({ where: { schoolId: id } });
    await prisma.loan.deleteMany({ where: { schoolId: id } });
    await prisma.academicSession.deleteMany({ where: { schoolId: id } });
    await prisma.chartOfAccount.deleteMany({ where: { schoolId: id } });
    await prisma.answer.deleteMany({ where: { schoolId: id } });
    await prisma.exam.deleteMany({ where: { schoolId: id } });
    await prisma.subject.deleteMany({ where: { schoolId: id } });
    await prisma.student.deleteMany({ where: { schoolId: id } });
    await prisma.user.deleteMany({ where: { schoolId: id } });
    await prisma.school.delete({ where: { id } });

    res.json({ message: "School and all related data deleted successfully." });
  }),
);

// superAdminRoute.delete(
//   "/schools/:id",
//   protect,
//   requireRole("SUPER_ADMIN"),
//   expressAsyncHandler(async (req, res) => {
//     const { id } = req.params;

//     // 1. Audit logs
//     await prisma.auditLog.deleteMany({ where: { schoolId: id } });

//     // 2. Nullify journal FK references before deleting journal entries
//     await prisma.donation.updateMany({
//       where: { schoolId: id },
//       data: { journalEntryId: null },
//     });
//     await prisma.feePayment.updateMany({
//       where: { schoolId: id },
//       data: { journalEntryId: null },
//     });
//     await prisma.expense.updateMany({
//       where: { schoolId: id },
//       data: { journalEntryId: null },
//     });
//     await prisma.loan.updateMany({
//       where: { schoolId: id },
//       data: { journalEntryId: null, repaymentJournalEntryId: null },
//     });
//     await prisma.loanRepayment.updateMany({
//       where: { schoolId: id },
//       data: { journalEntryId: null },
//     });

//     // 3. Delete journal data
//     await prisma.journalLine.deleteMany({
//       where: { JournalEntry: { schoolId: id } },
//     });
//     await prisma.journalEntry.updateMany({
//       where: { schoolId: id },
//       data: { reversalOfId: null },
//     });
//     await prisma.journalEntry.deleteMany({ where: { schoolId: id } });

//     // 4. Delete all payment & fee records
//     await prisma.feePayment.deleteMany({ where: { schoolId: id } });
//     await prisma.studentFee.deleteMany({ where: { schoolId: id } });
//     await prisma.feeStructure.deleteMany({ where: { schoolId: id } });

//     // 5. Delete financial records
//     await prisma.expense.deleteMany({ where: { schoolId: id } });
//     await prisma.donation.deleteMany({ where: { schoolId: id } });
//     await prisma.loanRepayment.deleteMany({ where: { schoolId: id } });
//     await prisma.loan.deleteMany({ where: { schoolId: id } });

//     // 6. Delete accounting structure
//     await prisma.academicSession.deleteMany({ where: { schoolId: id } });
//     await prisma.chartOfAccount.deleteMany({ where: { schoolId: id } });

//     // 7. Delete exam-related data (answers reference students, so delete answers first)
//     await prisma.answer.deleteMany({ where: { schoolId: id } });
//     await prisma.exam.deleteMany({ where: { schoolId: id } });
//     await prisma.subject.deleteMany({ where: { schoolId: id } });

//     // 8. Delete users (staff) but NOT students
//     // await prisma.user.deleteMany({ where: { schoolId: id } });

//     // ✅ Students are intentionally left intact

//     res.json({ message: "School data reset. Students have been preserved." });
//   }),
// );

// ─── Update User ───────────────────────────────────────────────────────────

superAdminRoute.put(
  "/users/:id",
  protect,
  requireRole("SUPER_ADMIN"),
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, username, password, role } = req.body;

    if (username) {
      const existing = await prisma.user.findUnique({ where: { username } });
      if (existing && existing.id !== id) {
        return res.status(409).json({ message: "Username already taken." });
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name: name.trim() } : {}),
        ...(username ? { username: username.trim() } : {}),
        ...(password ? { password: password.trim() } : {}),
        ...(role ? { role } : {}),
      },
      select: {
        id: true,
        username: true,
        password: true,
        name: true,
        role: true,
        gender: true,
        schoolId: true,
      },
    });

    res.json(user);
  }),
);

// ─── Delete User ───────────────────────────────────────────────────────────
superAdminRoute.delete(
  "/users/:id",
  protect,
  requireRole("SUPER_ADMIN"),
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    await prisma.user.delete({ where: { id } });
    res.json({ message: "User deleted successfully." });
  }),
);

// ─── Create Admin User for a School ───────────────────────────────────────
superAdminRoute.post(
  "/schools/:id/admins",
  protect,
  requireRole("SUPER_ADMIN"),
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    const { username, password, name, role } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required." });
    }

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return res.status(409).json({ message: "Username already taken." });
    }

    const user = await prisma.user.create({
      data: {
        username,
        password,
        name,
        role: role || "ADMIN",
        schoolId: id,
      },
    });

    res.status(201).json({
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
    });
  }),
);

export default superAdminRoute;

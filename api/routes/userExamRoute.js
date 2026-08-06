import express from "express";
import expressAsyncHandler from "express-async-handler";
import prisma from "../prisma/prisma.js";

const userExamRoute = express.Router();

// ADMIN: ASSIGN EXAM TO USER
userExamRoute.post(
  "/assign",
  expressAsyncHandler(async (req, res) => {
    const { userId, examId } = req.body;

    if (!userId || !examId) {
      return res.status(400).json({
        message: "User ID and Exam ID are required.",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        schoolId: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    if (user.role !== "USER") {
      return res.status(400).json({
        message: "Only users with USER role can be assigned exams.",
      });
    }

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        Subject: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!exam) {
      return res.status(404).json({
        message: "Exam not found.",
      });
    }

    // Prevent assigning an exam from another school
    if (user.schoolId !== exam.schoolId) {
      return res.status(403).json({
        message: "User and exam do not belong to the same school.",
      });
    }

    const existingAssignment = await prisma.userExam.findUnique({
      where: {
        userId_examId: {
          userId,
          examId,
        },
      },
    });

    if (existingAssignment) {
      return res.status(409).json({
        message: "This exam is already assigned to this user.",
      });
    }

    const assignment = await prisma.userExam.create({
      data: {
        userId,
        examId,
      },
      include: {
        Exam: {
          include: {
            Subject: {
              select: {
                name: true,
              },
            },
          },
        },
        User: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    });

    res.status(201).json({
      message: "Exam assigned successfully.",
      assignment,
    });
  }),
);

// ADMIN: GET USER'S ASSIGNED EXAMS
userExamRoute.get(
  "/user/:userId",
  expressAsyncHandler(async (req, res) => {
    const { userId } = req.params;

    const assignments = await prisma.userExam.findMany({
      where: {
        userId,
      },

      include: {
        Exam: {
          include: {
            Subject: {
              select: {
                name: true,
              },
            },
            _count: {
              select: {
                questions: true,
              },
            },
          },
        },
      },

      orderBy: {
        assignedAt: "desc",
      },
    });

    const exams = assignments.map((assignment) => ({
      assignmentId: assignment.id,
      assignedAt: assignment.assignedAt,

      id: assignment.Exam.id,
      subjectName: assignment.Exam.Subject?.name || "Unknown",
      level: assignment.Exam.level,
      termType: assignment.Exam.termType,
      visible: assignment.Exam.visible,
      examDuration: assignment.Exam.examDuration,
      questionCount: assignment.Exam._count.questions,
    }));

    res.status(200).json(exams);
  }),
);

// ADMIN: REMOVE EXAM FROM USER
userExamRoute.delete(
  "/:userId/:examId",
  expressAsyncHandler(async (req, res) => {
    const { userId, examId } = req.params;

    const assignment = await prisma.userExam.findUnique({
      where: {
        userId_examId: {
          userId,
          examId,
        },
      },
    });

    if (!assignment) {
      return res.status(404).json({
        message: "Exam is not assigned to this user.",
      });
    }

    await prisma.userExam.delete({
      where: {
        userId_examId: {
          userId,
          examId,
        },
      },
    });

    res.status(200).json({
      message: "Exam removed from user successfully.",
    });
  }),
);

// =========================================================
// USER: GET MY ASSIGNED EXAMS
// =========================================================

userExamRoute.get(
  "/my-exams/:userId",
  expressAsyncHandler(async (req, res) => {
    const { userId } = req.params;

    const assignments = await prisma.userExam.findMany({
      where: {
        userId,
      },

      include: {
        Exam: {
          include: {
            Subject: {
              select: {
                name: true,
              },
            },

            _count: {
              select: {
                questions: true,
              },
            },
          },
        },
      },

      orderBy: {
        assignedAt: "desc",
      },
    });

    const exams = assignments.map((assignment) => ({
      assignmentId: assignment.id,
      assignedAt: assignment.assignedAt,

      id: assignment.Exam.id,
      subjectName: assignment.Exam.Subject?.name || "Unknown",
      level: assignment.Exam.level,
      termType: assignment.Exam.termType,
      visible: assignment.Exam.visible,
      examDuration: assignment.Exam.examDuration,
      questionCount: assignment.Exam._count.questions,
    }));

    res.status(200).json(exams);
  }),
);

// =========================================================
// USER: VERIFY / GET ONE ASSIGNED EXAM
// =========================================================

userExamRoute.get(
  "/my-exams/:examId",
  expressAsyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { examId } = req.params;

    const assignment = await prisma.userExam.findUnique({
      where: {
        userId_examId: {
          userId,
          examId,
        },
      },

      include: {
        Exam: {
          include: {
            Subject: {
              select: {
                name: true,
              },
            },
            questions: true,
          },
        },
      },
    });

    if (!assignment) {
      return res.status(403).json({
        message: "You do not have access to this examination.",
      });
    }

    res.status(200).json({
      assignmentId: assignment.id,
      exam: assignment.Exam,
    });
  }),
);

export { userExamRoute };

import express from "express";
import prisma from "../prisma/prisma.js";
const userRoute = express.Router();
import expressAsyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";

//create-school
userRoute.post(
  "/create-school",
  expressAsyncHandler(async (req, res) => {
    const { fullName, name, viewExamHistory, logo } = req.body;
    try {
      const schoolAlreadyExist = await prisma.school.findFirst({
        where: { name },
      });
      if (schoolAlreadyExist) {
        res
          .status(409)
          .send({ message: `School with the name '${name}' already exists` });
        return;
      }
      const newSchool = await prisma.school.create({
        data: {
          fullName,
          name,
          viewExamHistory,
        },
      });
      res.status(200).json(newSchool);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }),
);

//Get school by Id
userRoute.get(
  "/school/:id",
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
      const school = await prisma.school.findUnique({
        where: { id },
      });
      if (!school) {
        res.status(404).json({ message: "School not found" });
        return;
      }
      res.status(200).json(school);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }),
);

//update school
userRoute.put(
  "/school/:id",
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params; // Extract school ID from the request parameters
    const { viewExamHistory } = req.body; // Extract viewExamHistory from the request body

    try {
      // Check if the school exists
      const school = await prisma.school.findUnique({
        where: { id },
      });

      if (!school) {
        return res.status(404).json({ message: "School not found" });
      }

      // Update the school's viewExamHistory field
      const updatedSchool = await prisma.school.update({
        where: { id },
        data: { viewExamHistory },
      });

      // Send the updated school data as the response
      res.status(200).json(updatedSchool);
    } catch (err) {
      console.error("Error updating school:", err);
      res
        .status(500)
        .json({ message: "Failed to update school", error: err.message });
    }
  }),
);

//create-user
userRoute.post(
  "/create-user",
  expressAsyncHandler(async (req, res) => {
    try {
      const { username, password, name, gender, role, schoolId } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          message: "Username and password are required",
        });
      }

      const userAlreadyExist = await prisma.user.findFirst({
        where: {
          username,
        },
      });

      if (userAlreadyExist) {
        return res.status(409).json({
          message: `User with the username '${username}' already exists`,
        });
      }

      const newUser = await prisma.user.create({
        data: {
          username,
          password,
          name: name || null,
          gender: gender || null,
          role: role || "USER",
          schoolId: schoolId || null,
        },
        select: {
          id: true,
          username: true,
          name: true,
          gender: true,
          role: true,
          schoolId: true,
        },
      });

      res.status(201).json(newUser);
    } catch (err) {
      console.error("Error creating user:", err);

      res.status(500).json({
        message: "An error occurred while creating user",
        error: err.message,
      });
    }
  }),
);

// Get users belonging to a school
userRoute.get(
  "/school/:schoolId/users",
  expressAsyncHandler(async (req, res) => {
    const { schoolId } = req.params;

    try {
      const users = await prisma.user.findMany({
        where: {
          schoolId,
        },
        select: {
          id: true,
          username: true,
          name: true,
          gender: true,
          role: true,
          schoolId: true,
        },
        orderBy: {
          name: "asc",
        },
      });

      res.status(200).json(users);
    } catch (err) {
      console.error("Error fetching users:", err);

      res.status(500).json({
        message: "Failed to fetch users",
        error: err.message,
      });
    }
  }),
);

// Get user by ID
userRoute.get(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
      const user = await prisma.user.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          username: true,
          name: true,
          gender: true,
          role: true,
          schoolId: true,
        },
      });

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      res.status(200).json(user);
    } catch (err) {
      console.error("Error fetching user:", err);

      res.status(500).json({
        message: "Failed to fetch user",
        error: err.message,
      });
    }
  }),
);

// Update user
userRoute.put(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
      const existingUser = await prisma.user.findUnique({
        where: {
          id,
        },
      });

      if (!existingUser) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      const { username, password, name, gender, role } = req.body;

      if (username && username !== existingUser.username) {
        const usernameExists = await prisma.user.findFirst({
          where: {
            username,
            NOT: {
              id,
            },
          },
        });

        if (usernameExists) {
          return res.status(409).json({
            message: `User with the username '${username}' already exists`,
          });
        }
      }

      const updateData = {
        username,
        name: name || null,
        gender: gender || null,
        role,
      };

      // Only update password when a new password was provided
      if (password && password.trim() !== "") {
        updateData.password = password;
      }

      const updatedUser = await prisma.user.update({
        where: {
          id,
        },
        data: updateData,
        select: {
          id: true,
          username: true,
          name: true,
          gender: true,
          role: true,
          schoolId: true,
        },
      });

      res.status(200).json(updatedUser);
    } catch (err) {
      console.error("Error updating user:", err);

      res.status(500).json({
        message: "Failed to update user",
        error: err.message,
      });
    }
  }),
);

// Delete user
userRoute.delete(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
      const existingUser = await prisma.user.findUnique({
        where: {
          id,
        },
      });

      if (!existingUser) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      await prisma.user.delete({
        where: {
          id,
        },
      });

      res.status(200).json({
        message: "User deleted successfully",
      });
    } catch (err) {
      console.error("Error deleting user:", err);

      res.status(500).json({
        message: "Failed to delete user",
        error: err.message,
      });
    }
  }),
);

// admin/dashboard
userRoute.get(
  "/admin/dashboard/:schoolId",
  expressAsyncHandler(async (req, res) => {
    try {
      const { schoolId } = req.params;

      if (!schoolId) {
        return res.status(400).json({
          message: "School ID is required.",
        });
      }

      // Make sure the school exists
      const school = await prisma.school.findUnique({
        where: {
          id: schoolId,
        },
        select: {
          id: true,
          name: true,
          viewExamHistory: true,
        },
      });

      if (!school) {
        return res.status(404).json({
          message: "School not found.",
        });
      }

      // Get all counts belonging to this school
      const [totalStudents, totalSubjects, totalExams, students] =
        await Promise.all([
          prisma.student.count({
            where: {
              schoolId,
            },
          }),

          prisma.subject.count({
            where: {
              schoolId,
            },
          }),

          prisma.exam.count({
            where: {
              schoolId,
            },
          }),

          prisma.student.findMany({
            where: {
              schoolId,
            },
            select: {
              id: true,
            },
          }),
        ]);

      // Count all answer/exam-history records belonging
      // to students in this school.
      const studentIds = students.map((student) => student.id);

      const examHistoryCount =
        studentIds.length === 0
          ? 0
          : await prisma.answer.count({
              where: {
                studentId: {
                  in: studentIds,
                },
              },
            });

      res.status(200).json({
        totalStudents,
        totalSubjects,
        totalExams,
        examHistoryCount,
        viewExamHistory: school.viewExamHistory,
      });
    } catch (error) {
      console.error("Admin dashboard error:", error);

      res.status(500).json({
        message: "Failed to fetch admin dashboard data.",
        error: error.message,
      });
    }
  }),
);

//login-user
userRoute.post(
  "/login-user",
  expressAsyncHandler(async (req, res) => {
    const { username, password } = req.body;

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(404).json({ message: "Username not found" });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: "Wrong password" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, schoolId: user.schoolId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
    );

    let currentSessionId = null;
    let classes = [];
    let sessions = [];

    if (user.schoolId) {
      const [currentSession, school, fetchedSessions] = await Promise.all([
        // rename to fetchedSessions
        prisma.academicSession.findFirst({
          where: { schoolId: user.schoolId, isCurrent: true },
        }),
        prisma.school.findUnique({ where: { id: user.schoolId } }),
        prisma.academicSession.findMany({
          where: { schoolId: user.schoolId },
          orderBy: { createdAt: "desc" },
          select: { id: true, name: true, term: true, isCurrent: true },
        }),
      ]);
      currentSessionId = currentSession?.id || null;
      classes = school?.classes || [];
      sessions = fetchedSessions; // assign the renamed variable
    }

    res.status(200).json({
      message: "Login successful",
      currentSessionId,
      token,
      userId: user.id,
      schoolId: user.schoolId || null,
      role: user.role,
      classes,
      sessions,
    });
  }),
);

export { userRoute };

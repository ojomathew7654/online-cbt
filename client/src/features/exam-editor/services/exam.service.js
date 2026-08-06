import axios from "axios";
import { apiUrl } from "../../../utils";

// ============================================================
// EXAM APIs
// ============================================================

// Upload exam/question image
export const uploadExamImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  try {
    const { data } = await axios.post(
      `${apiUrl}/api/exams/upload-image`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return {
      url: data.url,
      publicId: data.publicId,
    };
  } catch (err) {
    console.error("Image upload failed:", err);
    throw err;
  }
};

// Create a single exam question
export const createQuestion = async (payload) => {
  try {
    const { data } = await axios.post(
      `${apiUrl}/api/exams/create-question`,
      payload,
    );

    return data;
  } catch (err) {
    console.error("Failed to create question:", err);
    throw err;
  }
};

// Create multiple exam questions
export const createQuestions = async (payload) => {
  try {
    const { data } = await axios.post(
      `${apiUrl}/api/exams/create-questions`,
      payload,
    );

    return data;
  } catch (err) {
    console.error("Failed to create questions:", err);
    throw err;
  }
};

// Get a single exam by ID
export const getExamById = async (examId) => {
  try {
    const { data } = await axios.get(`${apiUrl}/api/exams/exam/${examId}`);

    return data;
  } catch (err) {
    console.error("Failed to fetch exam:", err);
    throw err;
  }
};

// ============================================================
// USER EXAM APIs
// ============================================================

// Assign an exam to a user
export const assignExamToUser = async (userId, examId) => {
  try {
    const { data } = await axios.post(`${apiUrl}/api/user-exams/assign`, {
      userId,
      examId,
    });

    return data;
  } catch (err) {
    console.error("Failed to assign exam to user:", err);
    throw err;
  }
};

// Get exams assigned to a specific user
export const getUserAssignedExams = async (userId) => {
  try {
    const { data } = await axios.get(`${apiUrl}/api/user-exams/user/${userId}`);

    return data;
  } catch (err) {
    console.error("Failed to fetch user assigned exams:", err);
    throw err;
  }
};

// Remove an exam from a user
export const removeExamFromUser = async (userId, examId) => {
  try {
    const { data } = await axios.delete(
      `${apiUrl}/api/user-exams/${userId}/${examId}`,
    );

    return data;
  } catch (err) {
    console.error("Failed to remove exam from user:", err);
    throw err;
  }
};

// Get exams assigned to the currently logged-in user
export const getMyExams = async () => {
  try {
    const { data } = await axios.get(`${apiUrl}/api/user-exams/my-exams`);

    return data;
  } catch (err) {
    console.error("Failed to fetch my exams:", err);
    throw err;
  }
};

// Get a single exam assigned to the currently logged-in user
export const getMyExam = async (examId) => {
  try {
    const { data } = await axios.get(
      `${apiUrl}/api/user-exams/my-exams/${examId}`,
    );

    return data;
  } catch (err) {
    console.error("Failed to fetch my exam:", err);
    throw err;
  }
};

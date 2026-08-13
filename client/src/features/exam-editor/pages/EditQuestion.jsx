import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { FiArrowLeft, FiEdit3 } from "react-icons/fi";

import AlertDialog from "../../../components/ui/AlertDialog";
import Spinner from "../../../components/ui/Spinner";
import ManualQuestionForm from "./ManualQuestionForm";
import { apiUrl, getError } from "../../../utils";

const EditQuestion = () => {
  const { questionId = "" } = useParams();
  const navigate = useNavigate();

  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);

  const [openAlert, setOpenAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    if (!questionId) {
      setAlertMessage("Question ID was not provided.");
      setOpenAlert(true);
      setLoading(false);
      return;
    }

    const fetchQuestion = async () => {
      try {
        setLoading(true);

        const { data } = await axios.get(
          `${apiUrl}/api/exams/question/${questionId}`,
        );
        setQuestion(data);
      } catch (error) {
        console.error("Error fetching question:", error);

        setAlertMessage(getError(error) || "Failed to load the question.");

        setOpenAlert(true);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [questionId]);

  if (loading) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-bg">
        <Spinner size="4rem" />
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-bg px-4 py-6 text-white sm:px-6 lg:px-8">
      {openAlert && (
        <AlertDialog message={alertMessage} setOpenAlert={setOpenAlert} />
      )}

      <div className="mx-auto max-w-6xl">
        {/* Back */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-light transition hover:text-primary"
        >
          <FiArrowLeft size={18} />
          Back
        </button>

        {/* Editor */}
        {question && (
          <ManualQuestionForm
            examId={question.examId}
            questionId={question.id}
            initialQuestion={question}
            mode="edit"
            title="Edit Examination Question"
            onAddQuestion={() => {
              navigate(-1);
            }}
          />
        )}
      </div>
    </section>
  );
};

export default EditQuestion;

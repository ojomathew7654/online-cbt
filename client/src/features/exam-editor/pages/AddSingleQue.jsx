import { useEffect, useState } from "react";
import { FiArrowLeft, FiBookOpen } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { apiUrl, getError } from "../../../utils";
import ManualQuestionForm from "./ManualQuestionForm";

const AddSingleQue = () => {
  const navigate = useNavigate();
  const { examId } = useParams();

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * ---------------------------------------------------------
   * LOAD SELECTED EXAM
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (!examId) {
      setLoading(false);
      setError("No examination was specified.");
      return;
    }

    const fetchExam = async () => {
      try {
        setLoading(true);
        setError("");

        const { data } = await axios.get(`${apiUrl}/api/exams/exam/${examId}`);

        setExam(data);
      } catch (error) {
        console.error("Failed to load examination:", error);

        setError(getError(error) || "Failed to load the selected examination.");
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [examId]);

  /*
   * ---------------------------------------------------------
   * LOADING
   * ---------------------------------------------------------
   */

  if (loading) {
    return (
      <section className="min-h-screen bg-bg px-4 py-6 text-white sm:px-6 lg:px-8">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-border border-t-primary" />

            <p className="text-sm text-light">Loading examination...</p>
          </div>
        </div>
      </section>
    );
  }

  /*
   * ---------------------------------------------------------
   * ERROR / EXAM NOT FOUND
   * ---------------------------------------------------------
   */

  if (error || !exam) {
    return (
      <section className="min-h-screen bg-bg px-4 py-6 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Back button */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-5 flex items-center gap-2 text-sm text-light transition hover:text-primary"
          >
            <FiArrowLeft size={18} />
            Back
          </button>

          {/* Error */}
          <div className="rounded-2xl border border-danger/30 bg-danger-variant p-6">
            <h1 className="text-lg font-semibold text-danger">
              Unable to load examination
            </h1>

            <p className="mt-2 text-sm text-light">
              {error || "The selected examination could not be found."}
            </p>
          </div>
        </div>
      </section>
    );
  }

  /*
   * ---------------------------------------------------------
   * PAGE
   * ---------------------------------------------------------
   */

  return (
    <section className="min-h-screen bg-bg px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Back button */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-5 flex items-center gap-2 text-sm text-light transition hover:text-primary"
        >
          <FiArrowLeft size={18} />
          Back
        </button>

        {/* HEADER */}
        <div className="mb-6">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FiBookOpen size={24} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                Examination Management
              </p>

              <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
                Add Examination Question
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-light">
                Add a new question to the examination shown below.
              </p>
            </div>
          </div>
        </div>

        {/* CURRENT EXAM */}
        <section className="mb-6 rounded-2xl border border-primary/30 bg-bg-deep p-5 shadow-xl">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Currently Working On
            </p>

            <h2 className="mt-1 text-xl font-bold">{exam.subjectName}</h2>

            <p className="mt-1 text-sm text-light">Exam ID: {exam.id}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {/* CLASS */}
            <div className="rounded-xl border border-border bg-bg p-4">
              <p className="text-xs uppercase tracking-wider text-light">
                Class
              </p>

              <p className="mt-1 font-semibold text-white">
                {exam.level?.toUpperCase() || "N/A"}
              </p>
            </div>

            {/* SUBJECT */}
            <div className="rounded-xl border border-border bg-bg p-4">
              <p className="text-xs uppercase tracking-wider text-light">
                Subject
              </p>

              <p className="mt-1 font-semibold text-white">
                {exam.subjectName || "Unknown"}
              </p>
            </div>

            {/* TERM */}
            <div className="rounded-xl border border-border bg-bg p-4">
              <p className="text-xs uppercase tracking-wider text-light">
                Term
              </p>

              <p className="mt-1 font-semibold text-white">
                {exam.termType ? `${exam.termType} TERM` : "N/A"}
              </p>
            </div>
          </div>
        </section>

        {/* QUESTION FORM */}
        <ManualQuestionForm
          examId={examId}
          onAddQuestion={() => {
            // Keep the current exam.
            // Teacher can continue adding questions.
          }}
        />
      </div>
    </section>
  );
};

export default AddSingleQue;

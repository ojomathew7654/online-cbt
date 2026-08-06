import { useEffect, useMemo, useState } from "react";
import { FiArrowLeft, FiBookOpen, FiChevronDown } from "react-icons/fi";
import axios from "axios";
import { apiUrl, getError } from "../../../utils";
import ManualQuestionForm from "./ManualQuestionForm";

const AddSingleQue = () => {
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loggedInUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("loggedInStudent"));
    } catch {
      return null;
    }
  }, []);

  const schoolId = loggedInUser?.schoolId;

  /*
   * ---------------------------------------------------------
   * LOAD EXAMS
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (!schoolId) {
      setLoading(false);
      setError("School information could not be found.");
      return;
    }

    const fetchExams = async () => {
      try {
        setLoading(true);
        setError("");

        const { data } = await axios.get(
          `${apiUrl}/api/exams/visible-true-exams/${schoolId}`,
        );

        setExams(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);

        setError(getError(error) || "Failed to load available examinations.");
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, [schoolId]);

  const selectedExam = exams.find((exam) => exam.id === selectedExamId);

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

            <p className="text-sm text-light">
              Loading available examinations...
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
                Select an existing examination before creating a question.
                Questions will automatically be attached to the examination you
                select.
              </p>
            </div>
          </div>
        </div>

        {/* EXAM SELECTOR */}
        <section className="mb-6 rounded-2xl border border-border bg-bg-deep p-5 shadow-xl">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Select Examination</h2>

            <p className="mt-1 text-sm text-light">
              Choose the term, class, subject and examination you want to add
              the question to.
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-danger/30 bg-danger-variant px-4 py-3 text-sm text-danger">
              {error}
            </div>
          )}

          <div className="relative">
            <select
              value={selectedExamId}
              onChange={(event) => setSelectedExamId(event.target.value)}
              className="
                h-12 w-full appearance-none
                rounded-xl
                border border-border
                bg-bg
                px-4 pr-11
                text-sm text-white
                outline-none
                transition
                focus:border-primary
                focus:ring-2
                focus:ring-primary/20
              "
            >
              <option value="">Select an examination</option>

              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.level?.toUpperCase()} —{" "}
                  {exam.subjectName?.toUpperCase()} — {exam.termType} TERM
                </option>
              ))}
            </select>

            <FiChevronDown
              size={18}
              className="
                pointer-events-none
                absolute right-4 top-1/2
                -translate-y-1/2
                text-light
              "
            />
          </div>

          {/* SELECTED EXAM INFORMATION */}
          {selectedExam && (
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-bg p-4">
                <p className="text-xs uppercase tracking-wider text-light">
                  Class
                </p>

                <p className="mt-1 font-semibold text-white">
                  {selectedExam.level?.toUpperCase()}
                </p>
              </div>

              <div className="rounded-xl border border-border bg-bg p-4">
                <p className="text-xs uppercase tracking-wider text-light">
                  Subject
                </p>

                <p className="mt-1 font-semibold text-white">
                  {selectedExam.subjectName}
                </p>
              </div>

              <div className="rounded-xl border border-border bg-bg p-4">
                <p className="text-xs uppercase tracking-wider text-light">
                  Term
                </p>

                <p className="mt-1 font-semibold text-white">
                  {selectedExam.termType} TERM
                </p>
              </div>
            </div>
          )}
        </section>

        {/* QUESTION FORM */}
        {selectedExamId ? (
          <ManualQuestionForm
            examId={selectedExamId}
            onAddQuestion={() => {
              // Optional:
              // Keep the selected exam so teacher can continue
              // adding questions to the same exam.
            }}
          />
        ) : (
          <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-border bg-bg-deep p-8 text-center">
            <div>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <FiBookOpen size={28} />
              </div>

              <h2 className="mt-4 text-lg font-semibold">
                Select an examination first
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-light">
                Select the examination above. Once selected, the question editor
                will appear here.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default AddSingleQue;

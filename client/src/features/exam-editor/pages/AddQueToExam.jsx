import { useState } from "react";
import axios from "axios";
import { FiBookOpen, FiCheckCircle, FiLayers, FiPlus } from "react-icons/fi";
import { apiUrl, getError } from "../../../utils";
import AlertDialog from "../../../components/ui/AlertDialog";

const AddQueToExam = ({ newQuestions, setQuestions }) => {
  const [loading, setLoading] = useState(false);
  const [exam, setExam] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [examId, setExamId] = useState("");

  // Alert dialog
  const [openAlert, setOpenAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const schoolId = JSON.parse(
    localStorage.getItem("loggedInStudent"),
  )?.schoolId;

  const showAlert = (message) => {
    setAlertMessage(message);
    setOpenAlert(true);
  };

  const fetchExam = async (termType, level) => {
    try {
      if (!termType || !level) {
        setExam([]);
        setExamId("");
        return;
      }

      const { data } = await axios.get(
        `${apiUrl}/api/exams/exams-by-level-term`,
        {
          params: {
            level,
            termType,
            schoolId,
          },
        },
      );

      setExam(data);
      setExamId("");
    } catch (error) {
      console.error(getError(error));
      setExam([]);
      setExamId("");

      showAlert(getError(error));
    }
  };

  const handleTermChange = async (event) => {
    const term = event.target.value;

    setSelectedTerm(term);

    await fetchExam(term, selectedLevel);
  };

  const handleLevelChange = async (event) => {
    const level = event.target.value;

    setSelectedLevel(level);

    await fetchExam(selectedTerm, level);
  };

  const handleExamChange = (event) => {
    setExamId(event.target.value);
  };

  const handleAddQuestions = async () => {
    if (!examId) {
      showAlert("Please select an exam before adding questions.");
      return;
    }

    if (!newQuestions?.length) {
      showAlert("No question to add.");
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${apiUrl}/api/exams/create-questions`, {
        examId,
        questions: newQuestions,
      });

      setQuestions([]);
      setExamId("");

      showAlert("Successfully added all questions.");
    } catch (error) {
      console.error(getError(error));

      showAlert(getError(error));
    } finally {
      setLoading(false);
    }
  };

  const inputClassName = `
    w-full
    rounded-xl
    border border-border
    bg-bg
    px-4
    py-3
    text-sm
    text-white
    outline-none
    transition-all
    duration-200
    cursor-pointer

    hover:border-primary/50

    focus:border-primary
    focus:ring-2
    focus:ring-primary/20

    disabled:cursor-not-allowed
    disabled:opacity-50
  `;

  return (
    <>
      <section className="w-full">
        <div className="rounded-2xl border border-border bg-bg-deep/40 p-5 shadow-lg sm:p-6">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-variant text-primary">
                <FiPlus size={22} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-white">
                  Add Questions to Exam
                </h2>

                <p className="mt-1 text-sm leading-6 text-light">
                  Select a class, term and exam to add your prepared questions.
                </p>
              </div>
            </div>

            {/* Question count */}
            <div
              className={`
                flex items-center gap-2
                self-start
                rounded-xl
                px-3 py-2

                ${
                  newQuestions?.length
                    ? "bg-success-variant text-success"
                    : "bg-danger-variant text-danger"
                }
              `}
            >
              <FiCheckCircle size={17} />

              <span className="text-sm font-medium">
                {newQuestions?.length || 0} question
                {newQuestions?.length === 1 ? "" : "s"} ready
              </span>
            </div>
          </div>

          {/* Selection fields */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Class */}
            <div>
              <label
                htmlFor="classSelect"
                className="mb-2 flex items-center gap-2 text-sm font-medium text-white"
              >
                <FiLayers className="text-primary" size={16} />
                Class
              </label>

              <select
                id="classSelect"
                value={selectedLevel}
                onChange={handleLevelChange}
                className={inputClassName}
              >
                <option value="" disabled>
                  Select Class
                </option>

                <option value="js1">JSS 1</option>
                <option value="js2">JSS 2</option>
                <option value="js3">JSS 3</option>
                <option value="ss1">SSS 1</option>
                <option value="ss2">SSS 2</option>
                <option value="ss3">SSS 3</option>
              </select>
            </div>

            {/* Term */}
            <div>
              <label
                htmlFor="termSelect"
                className="mb-2 flex items-center gap-2 text-sm font-medium text-white"
              >
                <FiBookOpen className="text-primary" size={16} />
                Academic Term
              </label>

              <select
                id="termSelect"
                value={selectedTerm}
                onChange={handleTermChange}
                className={inputClassName}
              >
                <option value="" disabled>
                  Select Term
                </option>

                <option value="FIRST">First Term</option>
                <option value="SECOND">Second Term</option>
                <option value="THIRD">Third Term</option>
              </select>
            </div>

            {/* Exam */}
            <div>
              <label
                htmlFor="examSelect"
                className="mb-2 flex items-center gap-2 text-sm font-medium text-white"
              >
                <FiCheckCircle className="text-primary" size={16} />
                Exam
              </label>

              <select
                id="examSelect"
                value={examId}
                onChange={handleExamChange}
                disabled={!exam.length}
                className={inputClassName}
              >
                <option value="">
                  {!selectedLevel || !selectedTerm
                    ? "Select class and term first"
                    : exam.length
                      ? "Select Exam"
                      : "No exams available"}
                </option>

                {exam.map((examItem) => (
                  <option key={examItem.id} value={examItem.id}>
                    {examItem.subjectName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Selected exam information */}
          {examId && (
            <div className="mt-5 flex items-center gap-3 rounded-xl border border-primary/20 bg-primary-variant/10 px-4 py-3">
              <FiCheckCircle className="shrink-0 text-primary" size={18} />

              <div>
                <p className="text-xs text-light">Selected examination</p>

                <p className="mt-0.5 text-sm font-medium text-white">
                  {exam.find((item) => item.id === examId)?.subjectName}
                </p>
              </div>
            </div>
          )}

          {/* Action */}
          <div className="mt-6 flex justify-end border-t border-border pt-5">
            <button
              type="button"
              onClick={handleAddQuestions}
              disabled={loading || !examId || !newQuestions?.length}
              className="
                inline-flex
                min-w-[210px]
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-primary
                px-5
                py-3
                text-sm
                font-semibold
                text-bg
                shadow-md
                transition-all
                duration-200

                hover:-translate-y-0.5
                hover:shadow-lg
                hover:brightness-110

                active:translate-y-0

                disabled:cursor-not-allowed
                disabled:opacity-40
                disabled:hover:translate-y-0
                disabled:hover:brightness-100
              "
            >
              {loading ? (
                <>
                  <span
                    className="
                      h-4
                      w-4
                      animate-spin
                      rounded-full
                      border-2
                      border-bg/30
                      border-t-bg
                    "
                  />
                  Adding questions...
                </>
              ) : (
                <>
                  <FiPlus size={18} />
                  Add Questions to Exam
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Custom Alert */}
      {openAlert && (
        <AlertDialog setOpenAlert={setOpenAlert} message={alertMessage} />
      )}
    </>
  );
};

export default AddQueToExam;

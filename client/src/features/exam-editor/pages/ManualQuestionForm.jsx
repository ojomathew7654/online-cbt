import { useEffect, useRef, useState } from "react";
import { createQuestion, uploadExamImage } from "../services/exam.service";
import RichQuestionEditor from "../components/RichQuestionEditor";
import resolvePendingImages from "../extensions/resolvePendingImages";
import AlertDialog from "../../../components/ui/AlertDialog";

const ManualQuestionForm = ({
  examId: examIdProp,
  questionId,
  initialQuestion = null,
  mode = "create",
  onAddQuestion,
  title = "Create Examination Question",
}) => {
  const [examId, setExamId] = useState(
    examIdProp || "6a6b87a19f594ef48e4a1375",
  );

  const [question, setQuestion] = useState(initialQuestion?.question || "");

  const [options, setOptions] = useState(
    Array.isArray(initialQuestion?.options)
      ? initialQuestion.options
      : ["", "", "", ""],
  );

  const [correctAnswer, setCorrectAnswer] = useState(
    initialQuestion?.correctAnswer || "",
  );

  const [submitting, setSubmitting] = useState(false);

  // Alert state
  const [openAlert, setOpenAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const [resetKey, setResetKey] = useState(0);

  const pendingImagesRef = useRef(new Map());

  const labels = ["A", "B", "C", "D"];

  useEffect(() => {
    if (!initialQuestion) {
      return;
    }

    console.log("Prefilling question form:", initialQuestion);

    setQuestion(initialQuestion.question || "");

    setOptions(
      Array.isArray(initialQuestion.options)
        ? initialQuestion.options
        : ["", "", "", ""],
    );

    setCorrectAnswer(initialQuestion.correctAnswer || "");

    if (initialQuestion.examId) {
      setExamId(initialQuestion.examId);
    }
  }, [initialQuestion]);

  const showAlert = (message) => {
    setAlertMessage(message);
    setOpenAlert(true);
  };

  const handleOptionChange = (index, html) => {
    setOptions((prev) => {
      const next = [...prev];

      next[index] = html;

      return next;
    });
  };

  const handleSubmit = async () => {
    /*
     * Question validation
     */
    if (!question.trim()) {
      showAlert("Please enter the examination question.");
      return;
    }

    /*
     * Options validation
     * Make sure A, B, C and D are all provided.
     */
    const emptyOptionIndex = options.findIndex(
      (option) => !option || !option.trim(),
    );

    if (emptyOptionIndex !== -1) {
      const emptyOptionLabel = labels[emptyOptionIndex];

      showAlert(
        `Option ${emptyOptionLabel} is empty. Please provide Option ${emptyOptionLabel} before submitting.`,
      );

      return;
    }

    /*
     * Correct answer validation
     */
    if (!correctAnswer) {
      showAlert("Please select the correct answer before submitting.");
      return;
    }

    /*
     * Exam validation
     */
    if (!examId.trim()) {
      showAlert("Exam ID is required.");
      return;
    }

    setSubmitting(true);

    try {
      /*
       * Resolve images inside the question
       */
      const resolvedQuestion = await resolvePendingImages(
        question,
        pendingImagesRef.current,
        uploadExamImage,
      );

      /*
       * Resolve images inside all options
       */
      const resolvedOptionResults = await Promise.all(
        options.map((html) =>
          resolvePendingImages(html, pendingImagesRef.current, uploadExamImage),
        ),
      );

      const resolvedOptionsHtml = resolvedOptionResults.map(
        (result) => result.html,
      );

      /*
       * Update editor content with resolved images
       */
      setQuestion(resolvedQuestion.html);
      setOptions(resolvedOptionsHtml);

      /*
       * Get the selected correct answer
       */
      const correctAnswerIndex = labels.indexOf(correctAnswer);

      const resolvedCorrectAnswer = resolvedOptionsHtml[correctAnswerIndex];

      /*
       * Make sure the selected correct-answer option
       * actually contains content.
       */
      if (!resolvedCorrectAnswer || !resolvedCorrectAnswer.trim()) {
        showAlert(
          `Option ${correctAnswer} is empty. Please fill in Option ${correctAnswer} before marking it as the correct answer.`,
        );

        return;
      }

      /*
       * Collect uploaded image public IDs
       */
      const imagePublicIds = [
        ...resolvedQuestion.publicIds,
        ...resolvedOptionResults.flatMap((result) => result.publicIds),
      ];

      /*
       * Create payload
       */
      const payload = {
        question: resolvedQuestion.html,
        options: resolvedOptionsHtml,
        correctAnswer: resolvedCorrectAnswer,
        examId,
        imagePublicIds,
      };

      /*
       * Create question
       */
      const result = await createQuestion(payload);

      /*
       * Notify parent
       */
      if (onAddQuestion) {
        onAddQuestion(result);
      }

      /*
       * Reset form
       */
      setQuestion("");
      setOptions(["", "", "", ""]);
      setCorrectAnswer("");
      setResetKey((key) => key + 1);

      /*
       * Success alert
       */
      showAlert("Question added successfully.");
    } catch (err) {
      console.error("Failed to add question:", err);

      showAlert(
        err?.response?.data?.message ||
          "Failed to add question. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg p-4 md:p-6">
      <div className="mx-auto max-w-5xl">
        {/* ALERT */}
        {openAlert && (
          <AlertDialog setOpenAlert={setOpenAlert} message={alertMessage} />
        )}

        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-white">{title}</h1>

          <p className="mt-1 text-sm text-light">
            Enter questions using text, equations, formulas, chemical notation,
            images, and diagrams.
          </p>
        </div>

        {/* EXAM ID */}
        {!examIdProp && (
          <div className="mb-4 rounded-xl border border-border bg-bg-deep p-4">
            <label className="mb-2 block text-sm font-semibold text-white">
              Exam ID
            </label>

            <input
              type="text"
              value={examId}
              onChange={(event) => setExamId(event.target.value)}
              placeholder="Paste an existing exam's ID for testing"
              className="
                w-full
                rounded-lg
                border border-border
                bg-bg
                px-3 py-2
                text-sm text-white
                outline-none
                focus:border-primary
              "
            />
          </div>
        )}

        {/* QUESTION */}
        <section className="rounded-xl border border-border bg-bg-deep p-4">
          <div className="mb-3">
            <label className="text-sm font-semibold text-white">Question</label>

            <p className="mt-1 text-xs text-light">
              Supports mathematics, physics, chemistry, biology, images, and
              uploaded diagrams. Click an image to reveal a resize handle.
            </p>
          </div>

          <RichQuestionEditor
            key={`question-${resetKey}`}
            content={question}
            onChange={setQuestion}
            placeholder="Type the examination question..."
            pendingImagesRef={pendingImagesRef}
          />
        </section>

        {/* OPTIONS */}
        <section className="mt-6 space-y-5">
          {labels.map((label, index) => (
            <div
              key={label}
              className="rounded-xl border border-border bg-bg-deep p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <label className="font-semibold text-white">
                  Option {label}
                </label>

                <label className="flex cursor-pointer items-center gap-2 text-sm text-light">
                  <input
                    type="radio"
                    name="correctAnswer"
                    value={label}
                    checked={correctAnswer === label}
                    onChange={(event) => setCorrectAnswer(event.target.value)}
                    className="accent-primary"
                  />

                  <span>Correct Answer</span>
                </label>
              </div>

              <RichQuestionEditor
                key={`option-${label}-${resetKey}`}
                content={options[index]}
                onChange={(html) => handleOptionChange(index, html)}
                placeholder={`Enter option ${label}...`}
                pendingImagesRef={pendingImagesRef}
              />
            </div>
          ))}
        </section>

        {/* SUBMIT */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!question.trim() || submitting}
            className="
              rounded-lg
              bg-primary
              px-6
              py-3
              font-semibold
              text-white
              transition-all
              hover:opacity-90
              active:scale-95
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {submitting ? "Uploading & Adding..." : "Add Question"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManualQuestionForm;

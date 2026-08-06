import { FiCheck } from "react-icons/fi";

const QuestionNavigator = ({
  questions,
  answers,
  currentQuestionIndex,
  onSelectQuestion,
}) => {
  return (
    <div className="w-full">
      <div
        className="
          grid
          grid-cols-5
          gap-1
          sm:grid-cols-8
          md:grid-cols-10
          lg:grid-cols-12
          xl:grid-cols-15
        "
      >
        {questions.map((question, index) => {
          const answered = answers[question.id] !== undefined;

          const current = index === currentQuestionIndex;

          return (
            <button
              key={question.id || index}
              type="button"
              onClick={() => onSelectQuestion(index)}
              className={`
                relative
                flex
                h-8
                min-w-0
                items-center
                justify-center
                border
                text-xs
                font-medium
                transition-all
                sm:h-9

                ${
                  current
                    ? "border-primary bg-primary text-bg"
                    : answered
                      ? "border-green-600 bg-green-500 text-black"
                      : "border-slate-400 bg-slate-400 text-black hover:bg-slate-300"
                }
              `}
            >
              {index + 1}

              {answered && !current && (
                <FiCheck size={9} className="absolute right-0.5 top-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuestionNavigator;

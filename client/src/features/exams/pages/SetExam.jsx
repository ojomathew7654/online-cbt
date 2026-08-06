import { useState } from "react";
import FileInput from "../components/FileInput";
import ReadExcel from "../components/ReadExcel";
import AddQueToExam from "../../exam-editor/pages/AddQueToExam";

const SetExam = () => {
  const [questions, setQuestions] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");

  const handleFileChange = async (file) => {
    try {
      const datas = await ReadExcel(file);

      const filteredData = datas
        .filter((item) => Array.isArray(item) && item[0])
        .slice(1);

      const incompleteQuestions = filteredData.some((item) => item.length < 6);

      if (incompleteQuestions) {
        alert("One or more questions are incomplete.");
        return;
      }

      const allQuestion = filteredData.map((item, index) => {
        return {
          question: item[0],
          options: Object.values(item)
            .slice(1, 5)
            .map((value) => value.toString().trim()),
          correctAnswer: item[5].toString().trim(),
        };
      });

      setQuestions(allQuestion);
    } catch (error) {
      console.error("Error reading the Excel file:", error);
    }
  };

  const handleSubjectChange = (e) => {
    setSelectedSubject(e.target.value);
  };

  return (
    <section className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-1 text-sm font-medium uppercase tracking-wider text-indigo-400">
                Examination Management
              </p>

              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Set Examination
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Import questions from an Excel file, select the destination
                exam, and review the questions before adding them.
              </p>
            </div>

            <div className="flex h-10 w-fit items-center rounded-full border border-slate-700 bg-slate-900 px-4 text-sm text-slate-300 shadow-sm">
              <span className="mr-2 h-2 w-2 rounded-full bg-emerald-400" />
              {questions.length}{" "}
              {questions.length === 1 ? "Question" : "Questions"} loaded
            </div>
          </div>
        </div>

        {/* Import / Exam Selection */}
        <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-white">
              Question Import
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Import your Excel questions and select the exam they should be
              added to.
            </p>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/70 p-4">
              <FileInput onFileChange={handleFileChange} />
            </div>

            <div className="min-w-0 flex-1 lg:max-w-3xl">
              <AddQueToExam
                selectedSubject={selectedSubject}
                newQuestions={questions}
                handleSubjectChange={handleSubjectChange}
                setQuestions={setQuestions}
              />
            </div>
          </div>
        </div>

        {/* Questions Preview */}
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
          <div className="flex flex-col gap-3 border-b border-slate-800 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Imported Questions
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Review the imported questions before submitting them to an
                examination.
              </p>
            </div>

            {questions.length > 0 && (
              <span className="w-fit rounded-lg bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-400">
                {questions.length} loaded
              </span>
            )}
          </div>

          {questions.length === 0 ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800 text-2xl">
                📄
              </div>

              <h3 className="text-base font-semibold text-slate-200">
                No questions imported
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                Import an Excel file using the button above. Your questions will
                appear here for review.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/70">
                    <th className="w-16 px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-400">
                      No
                    </th>

                    <th className="min-w-[350px] px-4 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Question
                    </th>

                    <th className="min-w-[180px] px-4 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      A
                    </th>

                    <th className="min-w-[180px] px-4 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      B
                    </th>

                    <th className="min-w-[180px] px-4 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      C
                    </th>

                    <th className="min-w-[180px] px-4 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      D
                    </th>

                    <th className="min-w-[180px] px-4 py-4 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                      Correct Answer
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800">
                  {questions.map((question, index) => (
                    <tr
                      key={index}
                      className="transition-colors hover:bg-slate-800/40"
                    >
                      <td className="px-4 py-5 text-center text-sm font-semibold text-slate-500">
                        {index + 1}
                      </td>

                      <td className="px-4 py-5 align-top">
                        <div className="max-w-[500px] whitespace-pre-wrap break-words text-sm leading-6 text-slate-200">
                          {question.question}
                        </div>
                      </td>

                      {question.options.map((option, optionIndex) => (
                        <td
                          key={optionIndex}
                          className="px-4 py-5 align-top text-sm leading-6 text-slate-400"
                        >
                          <div className="max-w-[220px] whitespace-pre-wrap break-words">
                            {option}
                          </div>
                        </td>
                      ))}

                      <td className="px-4 py-5 align-top">
                        <span className="inline-flex max-w-[220px] whitespace-pre-wrap break-words rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm font-medium leading-5 text-emerald-400">
                          {question.correctAnswer}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SetExam;

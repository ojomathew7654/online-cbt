import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { FiBookOpen, FiLogOut } from "react-icons/fi";
import ExamQuestion from "../components/ExamQuestion";
import { apiUrl, getError } from "../../../utils";
import Dialog from "../../../components/ui/Dialog";
import AlertDialog from "../../../components/ui/AlertDialog";
import Spinner from "../../../components/ui/Spinner";

const Exam = () => {
  const navigate = useNavigate();
  const { examId } = useParams();

  const [exam, setExam] = useState(null);
  const [loggedInStudent, setLoggedInStudent] = useState(null);

  const [loading, setLoading] = useState(true);
  const [examLoading, setExamLoading] = useState(false);

  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);

  const [alertMessage, setAlertMessage] = useState("");
  const [redirectAfterAlert, setRedirectAfterAlert] = useState(false);

  const [allowStudent, setAllowStudent] = useState(false);

  const schoolId = loggedInStudent?.schoolId;

  /*
   * ---------------------------------------------------------
   * EXAM TIMER
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (!exam?.id || submitted || timeLeft <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((previous) => {
        if (previous <= 1) {
          clearInterval(timer);
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [exam?.id, submitted, timeLeft]);

  /*
   * ---------------------------------------------------------
   * LOAD LOGGED-IN STUDENT
   * ---------------------------------------------------------
   */

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("loggedInStudent");

      if (!storedUser) {
        navigate("/login", { replace: true });
        return;
      }

      const parsedUser = JSON.parse(storedUser);

      if (!parsedUser?.id) {
        localStorage.removeItem("loggedInStudent");

        navigate("/login", {
          replace: true,
        });

        return;
      }

      setLoggedInStudent(parsedUser);
    } catch (error) {
      console.error("Invalid logged-in student:", error);

      localStorage.removeItem("loggedInStudent");

      navigate("/login", {
        replace: true,
      });
    }
  }, [navigate]);

  /*
   * ---------------------------------------------------------
   * CHECK SCHOOL SETTINGS
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (!schoolId) {
      return;
    }

    const fetchSchool = async () => {
      try {
        const { data } = await axios.get(
          `${apiUrl}/api/users/school/${schoolId}`,
        );

        setAllowStudent(Boolean(data.viewExamHistory));
      } catch (error) {
        console.error(getError(error));
      }
    };

    fetchSchool();
  }, [schoolId]);

  /*
   * ---------------------------------------------------------
   * LOAD SELECTED EXAM
   *
   * The exam ID now comes directly from:
   *
   * /selected-exam/:examId
   *
   * Example:
   *
   * /selected-exam/6a01ab71ad786865c80780c3
   * ---------------------------------------------------------
   */

  const fetchSelectedExam = useCallback(async () => {
    if (!examId) {
      setExamLoading(false);
      setLoading(false);
      return;
    }

    try {
      setExamLoading(true);

      const { data } = await axios.get(`${apiUrl}/api/exams/exam/${examId}`);

      const questions = Array.isArray(data?.questions)
        ? [...data.questions]
        : [];

      // Fisher-Yates shuffle
      for (let i = questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [questions[i], questions[j]] = [questions[j], questions[i]];
      }

      const shuffledExam = {
        ...data,
        questions,
      };

      setExam(shuffledExam);
      setSubmitted(false);
      setTimeLeft(Number(data?.examDuration || 0));
    } catch (error) {
      console.error(getError(error));

      setAlertMessage(getError(error) || "Unable to load this examination.");

      setOpenAlert(true);
    } finally {
      setExamLoading(false);
      setLoading(false);
    }
  }, [examId]);

  useEffect(() => {
    fetchSelectedExam();
  }, [fetchSelectedExam]);

  /*
   * ---------------------------------------------------------
   * CHECK IF STUDENT ALREADY SUBMITTED THIS EXAM
   * ---------------------------------------------------------
   */

  const checkIfScoreExist = useCallback(
    async (studentId) => {
      if (!studentId || !examId) {
        return;
      }

      try {
        const { data } = await axios.get(
          `${apiUrl}/api/students/check-score-exists/${studentId}/${examId}`,
        );

        if (data.scoreExists) {
          setAlertMessage(
            "You have already submitted this exam. Please wait until the next exam.",
          );

          setOpenAlert(true);
          setRedirectAfterAlert(true);

          localStorage.removeItem("loggedInStudent");
        }
      } catch (error) {
        console.error(getError(error));
      }
    },
    [examId],
  );

  useEffect(() => {
    if (!loggedInStudent?.id || !examId) {
      return;
    }

    checkIfScoreExist(loggedInStudent.id);
  }, [loggedInStudent, examId, checkIfScoreExist]);

  /*
   * ---------------------------------------------------------
   * REDIRECT AFTER ALREADY-SUBMITTED ALERT
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (redirectAfterAlert && !openAlert) {
      navigate("/login", {
        replace: true,
      });
    }
  }, [redirectAfterAlert, openAlert, navigate]);

  /*
   * ---------------------------------------------------------
   * UPDATE STUDENT SCORE
   * ---------------------------------------------------------
   */

  const updateStudentScore = async (score, studentId) => {
    if (!examId || !studentId) {
      return;
    }

    try {
      await axios.put(
        `${apiUrl}/api/students/update-student-subjects/${studentId}`,
        {
          subjects: {
            [examId]: score,
          },
          studentId,
        },
      );
    } catch (error) {
      console.error("Error updating student score:", error);
    }
  };

  /*
   * ---------------------------------------------------------
   * LOGOUT
   * ---------------------------------------------------------
   */

  const handleLogout = () => {
    setOpenDialog(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("loggedInStudent");
    localStorage.removeItem("isAdmin");

    setOpenDialog(false);

    navigate("/login", {
      replace: true,
    });
  };

  /*
   * ---------------------------------------------------------
   * INITIAL LOADING
   * ---------------------------------------------------------
   */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="4rem" />

          <p className="text-light">Loading your examination...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* =====================================================
          LOGOUT CONFIRMATION
      ====================================================== */}

      {openDialog && (
        <Dialog
          message="Are you sure you want to log out?"
          action={confirmLogout}
          setOpenDialog={setOpenDialog}
        />
      )}

      {/* =====================================================
          ALERT
      ====================================================== */}

      {openAlert && (
        <AlertDialog message={alertMessage} setOpenAlert={setOpenAlert} />
      )}

      <div className="min-h-screen bg-bg text-white">
        {/* ===================================================
            HEADER
        ==================================================== */}

        <header className="w-full px-4 pt-3 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4">
            {/* Selected Examination Information */}

            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-variant text-primary">
                <FiBookOpen size={19} />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {exam?.subjectName || "Examination"}
                </p>

                {exam && (
                  <p className="mt-0.5 truncate text-xs uppercase text-light">
                    {exam.level} • {exam.termType} TERM
                  </p>
                )}
              </div>
            </div>

            {/* Logout */}

            <button
              type="button"
              onClick={handleLogout}
              className="
                inline-flex
                h-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-danger
                px-4
                text-sm
                font-bold
                text-white
                shadow-lg
                transition
                hover:brightness-110
                focus:outline-none
                focus:ring-2
                focus:ring-danger/40
                sm:px-6
              "
            >
              <FiLogOut size={17} />

              <span className="ml-2">Log out</span>
            </button>
          </div>
        </header>

        {/* =====================================================
            MAIN EXAM CONTENT
        ====================================================== */}

        <main className="mx-auto max-w-[1200px] px-3 pb-8 pt-4 sm:px-6 lg:px-8">
          {/* ===================================================
              EXAM LOADING
          ==================================================== */}

          {examLoading && (
            <div className="flex min-h-[55vh] items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <Spinner size="4rem" />

                <p className="text-light">Preparing your examination...</p>
              </div>
            </div>
          )}

          {/* ===================================================
              EXAM NOT FOUND
          ==================================================== */}

          {!exam && !examLoading && (
            <div className="flex min-h-[55vh] items-center justify-center">
              <div className="max-w-md text-center">
                <div
                  className="
                    mx-auto
                    flex
                    h-16
                    w-16
                    items-center
                    justify-center
                    rounded-2xl
                    bg-danger-variant
                    text-danger
                  "
                >
                  <FiBookOpen size={30} />
                </div>

                <h2 className="mt-5 text-2xl font-semibold text-white">
                  Examination unavailable
                </h2>

                <p className="mt-2 text-sm leading-6 text-light">
                  We could not load the selected examination. Please return and
                  select another examination.
                </p>

                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="
                    mt-6
                    rounded-xl
                    bg-primary
                    px-5
                    py-3
                    text-sm
                    font-semibold
                    text-bg
                    transition
                    hover:brightness-110
                  "
                >
                  Go Back
                </button>
              </div>
            </div>
          )}

          {/* ===================================================
              ACTIVE EXAM
          ==================================================== */}

          {exam && !examLoading && (
            <ExamQuestion
              exam={exam}
              loggedInStudent={loggedInStudent}
              updateStudentScore={updateStudentScore}
              timeLeft={timeLeft}
              setTimeLeft={setTimeLeft}
              submitted={submitted}
              setSubmitted={setSubmitted}
            />
          )}
        </main>
      </div>
    </>
  );
};

export default Exam;

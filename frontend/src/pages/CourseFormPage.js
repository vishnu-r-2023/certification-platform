import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AlertMessage from "../components/AlertMessage";
import LoadingSpinner from "../components/LoadingSpinner";
import { createCourse, getCourseById, updateCourse } from "../services/courseService";
import { getApiErrorMessage } from "../services/api";

const createLesson = () => ({
  title: "",
  videoUrl: ""
});

const createQuestion = () => ({
  question: "",
  options: ["", ""],
  correctAnswer: ""
});

const createInitialState = () => ({
  title: "",
  description: "",
  lessons: [createLesson()],
  quiz: [createQuestion()]
});

function CourseFormPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(courseId);

  const [formData, setFormData] = useState(createInitialState);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    const loadCourse = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getCourseById(courseId);
        const course = response.course;
        setFormData({
          title: course.title || "",
          description: course.description || "",
          lessons: course.lessons?.length ? course.lessons : [createLesson()],
          quiz: course.quiz?.length
            ? course.quiz.map((question) => ({
                ...question,
                correctAnswer: ""
              }))
            : [createQuestion()]
        });
      } catch (apiError) {
        setError(getApiErrorMessage(apiError, "Unable to load course for editing."));
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [courseId, isEditMode]);

  const updateField = (name, value) => {
    setFormData((current) => ({
      ...current,
      [name]: value
    }));
  };

  const updateLesson = (index, field, value) => {
    setFormData((current) => {
      const nextLessons = [...current.lessons];
      nextLessons[index] = { ...nextLessons[index], [field]: value };
      return { ...current, lessons: nextLessons };
    });
  };

  const addLesson = () => {
    setFormData((current) => ({
      ...current,
      lessons: [...current.lessons, createLesson()]
    }));
  };

  const removeLesson = (index) => {
    setFormData((current) => {
      if (current.lessons.length === 1) {
        return { ...current, lessons: [createLesson()] };
      }

      return {
        ...current,
        lessons: current.lessons.filter((_, lessonIndex) => lessonIndex !== index)
      };
    });
  };

  const updateQuestion = (index, field, value) => {
    setFormData((current) => {
      const nextQuiz = [...current.quiz];
      nextQuiz[index] = { ...nextQuiz[index], [field]: value };
      return { ...current, quiz: nextQuiz };
    });
  };

  const addQuestion = () => {
    setFormData((current) => ({
      ...current,
      quiz: [...current.quiz, createQuestion()]
    }));
  };

  const removeQuestion = (index) => {
    setFormData((current) => {
      if (current.quiz.length === 1) {
        return { ...current, quiz: [createQuestion()] };
      }

      return {
        ...current,
        quiz: current.quiz.filter((_, questionIndex) => questionIndex !== index)
      };
    });
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    setFormData((current) => {
      const nextQuiz = [...current.quiz];
      const nextOptions = [...nextQuiz[questionIndex].options];
      const previousOptionValue = nextOptions[optionIndex];
      nextOptions[optionIndex] = value;

      let nextCorrectAnswer = nextQuiz[questionIndex].correctAnswer;
      if (nextCorrectAnswer === previousOptionValue) {
        nextCorrectAnswer = value;
      }

      nextQuiz[questionIndex] = {
        ...nextQuiz[questionIndex],
        options: nextOptions,
        correctAnswer: nextCorrectAnswer
      };

      return { ...current, quiz: nextQuiz };
    });
  };

  const addOption = (questionIndex) => {
    setFormData((current) => {
      const nextQuiz = [...current.quiz];
      nextQuiz[questionIndex] = {
        ...nextQuiz[questionIndex],
        options: [...nextQuiz[questionIndex].options, ""]
      };
      return { ...current, quiz: nextQuiz };
    });
  };

  const removeOption = (questionIndex, optionIndex) => {
    setFormData((current) => {
      const nextQuiz = [...current.quiz];
      const question = nextQuiz[questionIndex];

      if (question.options.length <= 2) {
        return current;
      }

      const removedOption = question.options[optionIndex];
      const nextOptions = question.options.filter((_, currentIndex) => currentIndex !== optionIndex);

      nextQuiz[questionIndex] = {
        ...question,
        options: nextOptions,
        correctAnswer: question.correctAnswer === removedOption ? "" : question.correctAnswer
      };

      return { ...current, quiz: nextQuiz };
    });
  };

  const validatePayload = () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      return "Course title and description are required.";
    }

    for (const lesson of formData.lessons) {
      if (!lesson.title.trim() || !lesson.videoUrl.trim()) {
        return "Every lesson must include a title and video URL.";
      }
    }

    for (const question of formData.quiz) {
      if (!question.question.trim()) {
        return "Every quiz question needs text.";
      }

      const cleanedOptions = question.options.map((option) => option.trim()).filter(Boolean);

      if (cleanedOptions.length < 2) {
        return "Each quiz question must contain at least two options.";
      }

      if (!question.correctAnswer.trim()) {
        return "Please select the correct answer for every question.";
      }

      if (!cleanedOptions.includes(question.correctAnswer.trim())) {
        return "Correct answers must match one of the available options.";
      }
    }

    return "";
  };

  const buildPayload = () => ({
    title: formData.title.trim(),
    description: formData.description.trim(),
    lessons: formData.lessons.map((lesson) => ({
      title: lesson.title.trim(),
      videoUrl: lesson.videoUrl.trim()
    })),
    quiz: formData.quiz.map((question) => ({
      question: question.question.trim(),
      options: question.options.map((option) => option.trim()).filter(Boolean),
      correctAnswer: question.correctAnswer.trim()
    }))
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    const validationMessage = validatePayload();

    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setSaving(true);

    try {
      const payload = buildPayload();

      if (isEditMode) {
        const response = await updateCourse(courseId, payload);
        setSuccessMessage(response.message || "Course updated successfully.");
      } else {
        const response = await createCourse(payload);
        navigate("/admin", {
          replace: true,
          state: {
            message: response.message || "Course created successfully."
          }
        });
      }
    } catch (apiError) {
      setError(getApiErrorMessage(apiError, "Unable to save the course."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="page-section">
        <LoadingSpinner label="Loading course form..." />
      </section>
    );
  }

  return (
    <section className="page-section">
      <div className="content-card">
        <div className="split-header">
          <div className="page-title">
            <span className="pill">{isEditMode ? "Edit course" : "Create course"}</span>
            <h1>{isEditMode ? "Update course content" : "Build a new certification course"}</h1>
            <p>
              Add lessons and quiz data in the same structure expected by the backend Mongoose
              schemas.
            </p>
          </div>
          <Link className="button button--ghost" to="/admin">
            Back to Admin
          </Link>
        </div>

        {isEditMode ? (
          <AlertMessage
            type="success"
            message="Correct answers are hidden on course read endpoints, so please reselect them before saving updates."
          />
        ) : null}

        <AlertMessage message={error} />
        <AlertMessage message={successMessage} type="success" />

        <form className="form-card" onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Course Details</h3>
            <div className="field-group">
              <label htmlFor="title">Course title</label>
              <input
                id="title"
                value={formData.title}
                onChange={(event) => updateField("title", event.target.value)}
                placeholder="React Fundamentals"
                required
              />
            </div>
            <div className="field-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(event) => updateField("description", event.target.value)}
                placeholder="What will learners achieve by the end of this course?"
                required
              />
            </div>
          </div>

          <div className="form-section">
            <div className="split-header">
              <h3>Lessons</h3>
              <button className="button button--ghost" onClick={addLesson} type="button">
                Add Lesson
              </button>
            </div>

            <div className="stack">
              {formData.lessons.map((lesson, lessonIndex) => (
                <div className="repeatable-card" key={`lesson-${lessonIndex}`}>
                  <div className="repeatable-card__header">
                    <strong>Lesson {lessonIndex + 1}</strong>
                    <button
                      className="button button--danger"
                      onClick={() => removeLesson(lessonIndex)}
                      type="button"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="field-group">
                    <label>Lesson title</label>
                    <input
                      value={lesson.title}
                      onChange={(event) => updateLesson(lessonIndex, "title", event.target.value)}
                      placeholder="Introduction to React"
                    />
                  </div>

                  <div className="field-group">
                    <label>Video URL</label>
                    <input
                      value={lesson.videoUrl}
                      onChange={(event) => updateLesson(lessonIndex, "videoUrl", event.target.value)}
                      placeholder="https://example.com/video"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-section">
            <div className="split-header">
              <h3>Quiz Questions</h3>
              <button className="button button--ghost" onClick={addQuestion} type="button">
                Add Question
              </button>
            </div>

            <div className="stack">
              {formData.quiz.map((question, questionIndex) => (
                <div className="repeatable-card" key={`question-${questionIndex}`}>
                  <div className="repeatable-card__header">
                    <strong>Question {questionIndex + 1}</strong>
                    <button
                      className="button button--danger"
                      onClick={() => removeQuestion(questionIndex)}
                      type="button"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="field-group">
                    <label>Question text</label>
                    <input
                      value={question.question}
                      onChange={(event) => updateQuestion(questionIndex, "question", event.target.value)}
                      placeholder="Which hook is used for side effects?"
                    />
                  </div>

                  <div className="stack">
                    {question.options.map((option, optionIndex) => (
                      <div className="repeatable-card" key={`option-${questionIndex}-${optionIndex}`}>
                        <div className="repeatable-card__header">
                          <strong>Option {optionIndex + 1}</strong>
                          <button
                            className="button button--ghost"
                            onClick={() => removeOption(questionIndex, optionIndex)}
                            type="button"
                          >
                            Remove Option
                          </button>
                        </div>
                        <div className="field-group">
                          <label>Option text</label>
                          <input
                            value={option}
                            onChange={(event) =>
                              updateOption(questionIndex, optionIndex, event.target.value)
                            }
                            placeholder="useEffect"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="inline-actions">
                    <button
                      className="button button--ghost"
                      onClick={() => addOption(questionIndex)}
                      type="button"
                    >
                      Add Option
                    </button>
                  </div>

                  <div className="field-group">
                    <label>Select the correct answer</label>
                    <select
                      value={question.correctAnswer}
                      onChange={(event) =>
                        updateQuestion(questionIndex, "correctAnswer", event.target.value)
                      }
                    >
                      <option value="">Choose the correct option</option>
                      {question.options
                        .map((option) => option.trim())
                        .filter(Boolean)
                        .map((option, optionIndex) => (
                          <option key={`${option}-${optionIndex}`} value={option}>
                            {option}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button className="button button--primary" disabled={saving} type="submit">
            {saving ? "Saving..." : isEditMode ? "Update Course" : "Create Course"}
          </button>
        </form>
      </div>
    </section>
  );
}

export default CourseFormPage;

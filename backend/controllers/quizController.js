const Course = require("../models/Course");
const Result = require("../models/Result");
const User = require("../models/User");
const asyncHandler = require("../middleware/asyncHandler");
const { issueCertificate } = require("./certificateController");

const normalizeAnswerText = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().toLowerCase();
};

const normalizeAnswers = (answers) => {
  if (Array.isArray(answers)) {
    if (answers.every((item) => typeof item === "string")) {
      return answers;
    }

    const normalizedArray = [];

    answers.forEach((item) => {
      if (
        item &&
        typeof item === "object" &&
        item.questionIndex !== undefined &&
        item.answer !== undefined
      ) {
        const index = Number(item.questionIndex);

        if (!Number.isNaN(index)) {
          normalizedArray[index] = String(item.answer);
        }
      }
    });

    return normalizedArray;
  }

  if (answers && typeof answers === "object") {
    const normalizedArray = [];

    Object.entries(answers).forEach(([key, value]) => {
      const index = Number(key);

      if (!Number.isNaN(index)) {
        normalizedArray[index] = String(value);
      }
    });

    return normalizedArray;
  }

  return [];
};

const submitQuiz = asyncHandler(async (req, res) => {
  const { courseId, answers } = req.body;

  if (!courseId || answers === undefined) {
    res.status(400);
    throw new Error("courseId and answers are required.");
  }

  const course = await Course.findById(courseId);

  if (!course) {
    res.status(404);
    throw new Error("Course not found.");
  }

  if (!Array.isArray(course.quiz) || course.quiz.length === 0) {
    res.status(400);
    throw new Error("This course does not have a quiz yet.");
  }

  const normalizedAnswers = normalizeAnswers(answers);

  const correctAnswersCount = course.quiz.reduce((count, question, index) => {
    const submittedAnswer = normalizeAnswerText(normalizedAnswers[index]);
    const correctAnswer = normalizeAnswerText(question.correctAnswer);

    if (submittedAnswer && submittedAnswer === correctAnswer) {
      return count + 1;
    }

    return count;
  }, 0);

  const totalQuestions = course.quiz.length;
  const score = Math.round((correctAnswersCount / totalQuestions) * 100);
  const passMark = Number(process.env.PASSING_SCORE_PERCENTAGE) || 70;
  const passed = score >= passMark;

  const result = await Result.findOneAndUpdate(
    {
      userId: req.user._id,
      courseId
    },
    {
      score,
      passed
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true
    }
  );

  await User.findByIdAndUpdate(req.user._id, {
    $addToSet: { enrolledCourses: courseId }
  });

  let certificate = null;

  if (passed) {
    certificate = await issueCertificate({
      req,
      userId: req.user._id,
      courseId
    });
  }

  res.status(200).json({
    success: true,
    message: "Quiz submitted successfully.",
    result: {
      id: result._id,
      courseId,
      score,
      passed,
      correctAnswersCount,
      totalQuestions,
      passMark
    },
    certificate: certificate
      ? {
          id: certificate._id,
          issuedAt: certificate.issuedAt,
          certificateUrl: certificate.certificateUrl
        }
      : null
  });
});

module.exports = {
  submitQuiz
};

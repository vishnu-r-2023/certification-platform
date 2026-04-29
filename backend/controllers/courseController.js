const Course = require("../models/Course");
const Result = require("../models/Result");
const Certificate = require("../models/Certificate");
const User = require("../models/User");
const asyncHandler = require("../middleware/asyncHandler");

const formatCourse = (course, includeCorrectAnswers = false) => {
  const courseObject = course.toObject ? course.toObject() : course;

  return {
    ...courseObject,
    quiz: Array.isArray(courseObject.quiz)
      ? courseObject.quiz.map((question) => {
          if (includeCorrectAnswers) {
            return question;
          }

          const { correctAnswer, ...safeQuestion } = question;
          return safeQuestion;
        })
      : []
  };
};

const getCourses = asyncHandler(async (_req, res) => {
  const courses = await Course.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: courses.length,
    courses: courses.map((course) => formatCourse(course))
  });
});

const getCourseById = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error("Course not found.");
  }

  res.status(200).json({
    success: true,
    course: formatCourse(course)
  });
});

const createCourse = asyncHandler(async (req, res) => {
  const { title, description, lessons = [], quiz = [] } = req.body;

  if (!title || !description) {
    res.status(400);
    throw new Error("Title and description are required.");
  }

  const course = await Course.create({
    title,
    description,
    lessons,
    quiz
  });

  res.status(201).json({
    success: true,
    message: "Course created successfully.",
    course: formatCourse(course, true)
  });
});

const updateCourse = asyncHandler(async (req, res) => {
  const { title, description, lessons, quiz } = req.body;
  const course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error("Course not found.");
  }

  if (title !== undefined) {
    course.title = title;
  }

  if (description !== undefined) {
    course.description = description;
  }

  if (lessons !== undefined) {
    course.lessons = lessons;
  }

  if (quiz !== undefined) {
    course.quiz = quiz;
  }

  const updatedCourse = await course.save();

  res.status(200).json({
    success: true,
    message: "Course updated successfully.",
    course: formatCourse(updatedCourse, true)
  });
});

const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error("Course not found.");
  }

  await Promise.all([
    Course.deleteOne({ _id: course._id }),
    Result.deleteMany({ courseId: course._id }),
    Certificate.deleteMany({ courseId: course._id }),
    User.updateMany({}, { $pull: { enrolledCourses: course._id } })
  ]);

  res.status(200).json({
    success: true,
    message: "Course deleted successfully."
  });
});

module.exports = {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse
};

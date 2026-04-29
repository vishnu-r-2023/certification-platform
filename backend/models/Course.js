const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Lesson title is required."],
      trim: true
    },
    videoUrl: {
      type: String,
      required: [true, "Lesson video URL is required."],
      trim: true
    }
  },
  {
    _id: false
  }
);

const quizQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, "Quiz question is required."],
      trim: true
    },
    options: {
      type: [String],
      required: [true, "Quiz options are required."],
      validate: {
        validator: (options) => Array.isArray(options) && options.length >= 2,
        message: "Each quiz question must contain at least two options."
      }
    },
    correctAnswer: {
      type: String,
      required: [true, "Correct answer is required."],
      trim: true,
      validate: {
        validator(value) {
          return Array.isArray(this.options) && this.options.includes(value);
        },
        message: "Correct answer must match one of the provided options."
      }
    }
  },
  {
    _id: false
  }
);

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Course title is required."],
      trim: true
    },
    description: {
      type: String,
      required: [true, "Course description is required."],
      trim: true
    },
    lessons: {
      type: [lessonSchema],
      default: []
    },
    quiz: {
      type: [quizQuestionSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Course", courseSchema);

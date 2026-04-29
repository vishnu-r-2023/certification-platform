const express = require("express");
const {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse
} = require("../controllers/courseController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router
  .route("/")
  .get(getCourses)
  .post(protect, authorizeRoles("admin"), createCourse);

router
  .route("/:id")
  .get(getCourseById)
  .put(protect, authorizeRoles("admin"), updateCourse)
  .delete(protect, authorizeRoles("admin"), deleteCourse);

module.exports = router;

const Course = require("../models/Course");
const Result = require("../models/Result");
const Certificate = require("../models/Certificate");
const asyncHandler = require("../middleware/asyncHandler");

const buildCertificateUrl = (req, courseId) => {
  const baseUrl = process.env.APP_BASE_URL || `${req.protocol}://${req.get("host")}`;
  return `${baseUrl}/api/certificate/${courseId}`;
};

const issueCertificate = async ({ req, userId, courseId }) => {
  let certificate = await Certificate.findOne({ userId, courseId });

  if (certificate) {
    return certificate;
  }

  certificate = await Certificate.create({
    userId,
    courseId,
    issuedAt: new Date(),
    certificateUrl: buildCertificateUrl(req, courseId)
  });

  return certificate;
};

const getCertificate = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const course = await Course.findById(courseId).select("title");

  if (!course) {
    res.status(404);
    throw new Error("Course not found.");
  }

  let certificate = await Certificate.findOne({
    userId: req.user._id,
    courseId
  });

  if (!certificate) {
    const passedResult = await Result.findOne({
      userId: req.user._id,
      courseId,
      passed: true
    });

    if (!passedResult) {
      res.status(404);
      throw new Error("No certificate found for this course. Pass the quiz first.");
    }

    certificate = await issueCertificate({
      req,
      userId: req.user._id,
      courseId
    });
  }

  res.status(200).json({
    success: true,
    message: "Certificate fetched successfully.",
    certificate: {
      id: certificate._id,
      userId: req.user._id,
      courseId,
      courseTitle: course.title,
      issuedAt: certificate.issuedAt,
      certificateUrl: certificate.certificateUrl
    }
  });
});

module.exports = {
  getCertificate,
  issueCertificate
};

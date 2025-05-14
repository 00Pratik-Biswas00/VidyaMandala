const Course = require("../models/Course");
const { STATUSCODE } = require("../constants");
const { createCustomError } = require("../utils/errorHandler");

// Get all courses
const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({});
    res.status(STATUSCODE.SUCCESS).json({
      success: true,
      count: courses.length,
      courses,
    });
  } catch (error) {
    next(error);
  }
};

// Get a single course by title
const getCourseByTitle = async (req, res) => {
  try {
    const { title } = req.params;

    const course = await Course.findOne({
      title: decodeURIComponent(title),
    });

    if (!course) {
      return next(
        createCustomError(
          `No course found with title: ${title}`,
          STATUSCODE.NOT_FOUND
        )
      );
    }

    res.status(STATUSCODE.SUCCESS).json({
      success: true,
      course,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCourses,
  getCourseByTitle,
};

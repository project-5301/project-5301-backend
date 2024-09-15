const Classes = require('../models/classes'); // Adjust the path according to your project structure

const overview = async (req, res) => {
  try {
    // Fetch all classes data from the database
    const classes = await Classes.find();

    // Perform the calculations
    const totalMax = classes.reduce((sum, classItem) => sum + classItem.optionsAvailable, 0);
    const availableClasses = classes.length;

    // Prepare the response data
    const response = {
      totalMax,
      availableClasses,
    };

    // Send the response
    return res.status(200).json({
      status: 200,
      message: "Class overview retrieved successfully",
      data,
    });
  } catch (error) {
    logger.error("Error during class overview calculation:", error);
    return res.status(500).json({
      status: 500,
      message: "An unexpected error occurred while retrieving class overview",
      data: null,
    });  }
};

module.exports = {
  overview,
};

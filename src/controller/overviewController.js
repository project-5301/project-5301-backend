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
    return res.status(200).json({ message: "Data fetched", data: response });
  } catch (error) {
    logger.error("Error during class overview calculation:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  overview,
};

const Classes = require('../models/classes'); // Adjust the path according to your project structure

// Create a new class
const create = async (req, res) => {
  try {
    const { name, price, optionsAvailable } = req.body;

    // Create a new class instance
    const newClass = new Classes({
      name,
      price,
      optionsAvailable,
    });

    // Save the new class to the database
    await newClass.save();

    return res.status(201).json(newClass);
  } catch (error) {
    logger.error("Error during class creation:", error);
    return res.status(500).json({status:500, message: "Internal Server Error" });
  }
};

// Fetch all classes or a specific class by ID
const fetch = async (req, res) => {
  try {
    const { id } = req.params;

    let result;
    if (id) {
      // Fetch a specific class by ID
      result = await Classes.findById(id).sort({ createdAt: 1 });
      if (!result) {
        return res.status(404).json({ status:404, message: "Class not found" });
      }
    } else {
      // Fetch all classes
      result = await Classes.find();
    }

    return res.status(200).json(result);
  } catch (error) {
    logger.error("Error during class fetch:", error);
    return res.status(500).json({status:500, message: "Internal Server Error" });
  }
};

// Update a class by ID
const update = async (req, res) => {
  try {
    // const { id } = req.params;
    const {classId} = req.params;
    const { name, price, optionsAvailable } = req.body;

    // Find the class by ID and update it
    const updatedClass = await Classes.findByIdAndUpdate(
      classId,
      { name, price, optionsAvailable },
      { new: true, runValidators: true }
    );

    if (!updatedClass) {
      return res.status(404).json({status:404, message: "Class not found" });
    }

    return res.status(200).json(updatedClass);
  } catch (error) {
    logger.error("Error during class update:", error);
    return res.status(500).json({status:500, message: "Internal Server Error" });
  }
};

// Delete a class by ID
const remove = async (req, res) => {
  try {
    // const { id } = req.params;
    const{classId} = req.params;
    // Find the class by ID and delete it
    const deletedClass = await Classes.findByIdAndDelete(classId);

    if (!deletedClass) {
      return res.status(404).json({status:404, message: "Class not found" });
    }

    return res.status(200).json({status:200, message: "Class deleted successfully" });
  } catch (error) {
    logger.error("Error during class deletion:", error);
    return res.status(500).json({status:500, message: "Internal Server Error" });
  }
};

module.exports = {
  create,
  fetch,
  update,
  remove,
};

const Classes = require("../models/classes");
const User = require("../models/user");
const mongoose = require('mongoose')
const create = async (req, res) => {
  try {
    const providerId = req.user.id
    const { name, price, optionsAvailable, filledOptions, availability } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }
    if (!user.isProvider) {
      return res.status(403).json({
        status: 403,
        message: "User is not authorized to create classes.",
      });
    }
    const newClass = new Classes({
      name,
      price,
      optionsAvailable,
      filledOptions,
      availability,
      providerId
    });

    // Save the new class to the database
    await newClass.save();

    return res.status(201).json({
      status: 201,
      message: "Class created successfully",
      data: newClass,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "An unexpected error occurred during class creation",
    });
  }
};

const fetch = async (req, res) => {
  try {
    const { id } = req.params;

    let result;
    if (id) {
      result = await Classes.findById(id).sort({ createdAt: 1 });
      if (!result) {
        return res
          .status(404)
          .json({ status: 404, message: "Class not found", data: null });
      }
    } else {
      result = await Classes.find().sort({ createdAt: -1 });
    }

    return res.status(200).json({
      status: 200,
      message: "Classes retrieved successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "An unexpected error occurred during class retrieval",
      data: null,
    });
  }
};

const update = async (req, res) => {
  try {
    const { classId } = req.params;
    const { name, price, optionsAvailable, filledOptions, availability } =
      req.body;

    const updatedClass = await Classes.findByIdAndUpdate(
      classId,
      { name, price, optionsAvailable, filledOptions, availability },
      { new: true, runValidators: true }
    );

    if (!updatedClass) {
      return res.status(404).json({
        status: 404,
        message: "Class not found",
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Class updated successfully",
      data: updatedClass,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "An unexpected error occurred during class update",
      error: error.message,
    });
  }
};

const remove = async (req, res) => {
  try {
    const { classId } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }
    if (!user.isProvider) {
      return res.status(403).json({
        status: 403,
        message: "User is not authorized to delete classes.",
      });
    }
    const deletedClass = await Classes.findByIdAndDelete(classId);

    if (!deletedClass) {
      return res.status(404).json({
        status: 404,
        message: "Class not found",
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Class deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "An unexpected error occurred during class deletion",
    });
  }
};

const allClasses = async (req, res) => {
  try {
    const data = await Classes.find().sort({ createdAt: -1 });
    return res.status(200).json({ message: "Records fetched", data: data });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const totalClassCount = async (req, res) => {
  try {
    const { providerId } = req.params;
    const totalCount = await Classes.countDocuments({ providerId }); 
    return res
      .status(200)
      .json({ message: "Total class count retrieved", count: totalCount });
  } catch (error) {
    return res
      .status(500)
      .json({
        message: "Error retrieving total class count",
        error: error.message,
      });
  }
};

const availableClassCount = async (req, res) => {
  try {
    const { providerId } = req.params;

    const availableCount = await Classes.countDocuments({providerId, availability: true }); 
    return res
      .status(200)
      .json({
        message: "Available class count retrieved",
        count: availableCount,
      });
  } catch (error) {
    return res
      .status(500)
      .json({
        message: "Error retrieving available class count",
        error: error.message,
      });
  }
};


const getClassAnalysis = async (req, res) => {
  try {
    const providerId = req.user.id;
console.log("Provider ID:", providerId);
    if (!providerId) {
      return res.status(400).json({
        status: 400,
        message: "Provider ID is missing from the request.",
      });
    }
    const analysisData = await Classes.aggregate([
      {
        $match: {
          availability: true,
          providerId: new mongoose.Types.ObjectId(providerId),
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" },
          },
          totalFilledOptions: { $sum: "$filledOptions" },
          totalAvailableOptions: { $sum: "$optionsAvailable" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    console.log("Analysis Data:", analysisData);
    res.status(200).json({
      status: 200,
      message: "Class analysis fetched successfully",
      data: analysisData,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "An error occurred while fetching class analysis",
      error: error.message,
    });
  }
};

const classesByProvider = async(req, res)=>{
  try {
    const providerId = req.user.id;

    if (!providerId) {
      return res.status(400).json({
        status: 400,
        message: "Provider ID is required.",
      });
    }

    // Fetch classes created by the specified provider
    const classes = await Classes.find({
      providerId: new mongoose.Types.ObjectId(providerId),
    });

    res.status(200).json({
      status: 200,
      message: "Classes fetched successfully",
      data: classes,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "An error occurred while fetching classes",
      error: error.message,
    });
  }
}

module.exports = {
  create,
  fetch,
  update,
  remove,
  allClasses,
  totalClassCount,
  availableClassCount,
  getClassAnalysis,
  classesByProvider
};

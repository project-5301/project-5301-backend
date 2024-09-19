const mongoose = require("mongoose");
const logger = require("../utils/logger");
const User = require("../models/user");
const ProviderDetails = require("../models/providerDetails");
const { uploadSingleImageToCloudflare } = require("../utils/upload");
const Class = require("../models/classes");
const Category = require("../models/category");

const createProviderDetails = async (req, res) => {
  try {
    const {
      providerName,
      subtitle,
      categoryId,
      experience,
      location,
      classId,
      aboutProvider,
      phoneNumber,
    } = req.body;
    const file = req.file;
    // Ensure required fields are present
    if (!providerName || !categoryId || !classId) {
      return res.status(400).json({
        status: 400,
        message: "Provider name, class ID and category ID are required",
      });
    }

    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
      return res
        .status(404)
        .json({ status: 404, message: "Category not found." });
    }

    let unauthorizedClassIds = [];
    for (let id of classId) {
      const classExists = await Class.findById(id);
      if (!classExists) {
        return res
          .status(404)
          .json({ status: 404, message: `Class not found for ID: ${id}` });
      }

      if (classExists.providerId.toString() !== req.user.id) {
        unauthorizedClassIds.push(id);
      }
    }

    // If there are unauthorized class IDs, return an error
    if (unauthorizedClassIds.length > 0) {
      return res.status(403).json({
        status: 403,
        message: `You are not authorized to use the following class IDs: ${unauthorizedClassIds.join(
          ", "
        )}. please use the class that is created by you`,
      });
    }
    // Find the user associated with the request
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }
    if (!user.isProvider) {
      return res.status(403).json({
        status: 403,
        message: "User is not authorized to create provider details.",
      });
    }
    if (file) {
      const imageUrl = await uploadSingleImageToCloudflare(file, "img");
      user.img = imageUrl;
    }
    // Create a new provider
    const providerDetails = new ProviderDetails({
      providerName,
      subtitle,
      categoryId,
      experience,
      location,
      classId,
      aboutProvider,
      phoneNumber,
      img: user.img,
      providerId: user._id,
    });

    // Save the provider
    const createdProviderDetails = await providerDetails.save();
    const populatedProviderDetails = await ProviderDetails.findById(
      createdProviderDetails._id
    )
      .populate("categoryId")
      .populate("classId");

    // Update the user to mark them as a provider
    await User.findByIdAndUpdate(
      req.user.id,
      { isProvider: true },
      { new: true } // Optionally return the updated document
    );

    res.status(201).json({
      status: 201,
      message: "Provider created successfully.",
      provider: populatedProviderDetails,
    });
  } catch (error) {
    logger.error("Error during provider creation:", error);
    res
      .status(500)
      .json({ status: 500, message: "Failed to create provider." });
  }
};

const getAllProvidersDetails = async (req, res) => {
  try {
    const providerDetails = await ProviderDetails.find()
      .populate("categoryId")
      .populate("classId");
    res.status(200).json({
      status: 200,
      message: "Providers fetched successfully.",
      providerDetails,
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: 500, message: "Failed to fetch providers." });
  }
};

const getProviderDetailsForAProvider = async (req, res) => {
  try {
    const { providerId } = req.params;
    console.log("providerId", providerId);

    const providerDetails = await ProviderDetails.find({
      providerId,
    })
      .populate("categoryId")
      .populate("classId")
      .sort({ createdAt: -1 });
    if (!providerDetails) {
      return res
        .status(404)
        .json({ status: 404, message: "Provider details not found." });
    }

    res.status(200).json({
      status: 200,
      message: "Provider details fetched successfully.",
      providerDetails,
    });
  } catch (err) {
    res
      .status(500)
      .json({ status: 500, message: "Failed to fetch provider details." });
  }
};

const updateProviderDetails = async (req, res) => {
  try {
    const providerId = req.params.providerId;
    const {
      providerName,
      subtitle,
      categoryId,
      experience,
      location,
      classId,
      aboutProvider,
      phoneNumber,
    } = req.body;
    const file = req.file;

    console.log("Request Body:", req.body);

    const providerDetails = await ProviderDetails.findById(providerId);
    if (!providerDetails) {
      return res
        .status(404)
        .json({ status: 404, message: "Provider not found." });
    }

    if (providerDetails.providerId.toString() !== req.user.id.toString()) {
      return res
        .status(403)
        .json({
          status: 403,
          message: "Not authorized to update this provider.",
        });
    }

    // Handle category IDs
    if (categoryId) {
      const categoryIdsArray = Array.isArray(categoryId)
        ? categoryId
        : [categoryId];
      const existingCategoryIds = providerDetails.categoryId || [];
      const validCategoryIds = new Set(existingCategoryIds);

      for (let id of categoryIdsArray) {
        const categoryExists = await Category.findById(id);
        console.log(`Category Exists for ID ${id}:`, categoryExists);
        if (!categoryExists) {
          return res
            .status(404)
            .json({ status: 404, message: `Category not found for ID: ${id}` });
        }
        validCategoryIds.add(id);
      }
      providerDetails.categoryId = Array.from(validCategoryIds);
    }

    // Handle class IDs
    if (classId) {
      const classIdsArray = Array.isArray(classId) ? classId : [classId];
      const existingClassIds = providerDetails.classId || [];
      const validClassIds = new Set(existingClassIds);

      for (let id of classIdsArray) {
        const classExists = await Class.findById(id);
        console.log(`Class Exists for ID ${id}:`, classExists);
        if (!classExists) {
          return res
            .status(404)
            .json({ status: 404, message: `Class not found for ID: ${id}` });
        }
        if (classExists.providerId.toString() === req.user.id) {
          validClassIds.add(id);
        } else {
          return res
            .status(403)
            .json({
              status: 403,
              message: `You are not authorized to use class ID: ${id}.`,
            });
        }
      }
      providerDetails.classId = Array.from(validClassIds);
    }

    providerDetails.providerName = providerName || providerDetails.providerName;
    providerDetails.subtitle = subtitle || providerDetails.subtitle;
    providerDetails.experience = experience || providerDetails.experience;
    providerDetails.location = location || providerDetails.location;
    providerDetails.aboutProvider =
      aboutProvider || providerDetails.aboutProvider;
    providerDetails.phoneNumber = phoneNumber || providerDetails.phoneNumber;

    if (file) {
      providerDetails.img = await uploadSingleImageToCloudflare(file, "img");
    }

    console.log("Provider Details Before Save:", providerDetails);

    const updatedProviderDetails = await providerDetails.save();

    const populatedProviderDetails = await ProviderDetails.findById(
      updatedProviderDetails._id
    )
      .populate("categoryId")
      .populate("classId");
    res.status(200).json({
      status: 200,
      message: "Provider updated successfully.",
      provider: populatedProviderDetails,
    });
  } catch (error) {
    logger.error("Error during updating provider:", error);
    res
      .status(500)
      .json({ status: 500, message: "Failed to update provider." });
  }
};




const deleteProviderDetails = async (req, res) => {
  try {
    const providerId = req.params.providerId;

    const providerDetails = await ProviderDetails.findById(providerId);
    if (!providerDetails) {
      return res
        .status(404)
        .json({ status: 404, message: "Provider not found." });
    }
    console.log(providerDetails.providerId);
    if (providerDetails.providerId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        status: 403,
        message: "Not authorized to delete this provider.",
      });
    }

    await providerDetails.deleteOne();

    res.status(200).json({
      status: 200,
      message: "Provider deleted successfully.",
    });
  } catch (error) {
    logger.error("Error during deleting provider:", error);
    res
      .status(500)
      .json({ status: 500, message: "Failed to delete provider." });
  }
};

const getProviderDetailsById = async (req, res) => {
  try {
    const providerId = req.params.id;
    const providerDetails = await ProviderDetails.findById(providerId);

    if (!providerDetails) {
      return res
        .status(404)
        .json({ status: 404, message: "Provider Details not found." });
    }

    res.status(200).json({
      status: 200,
      message: "Provider Details fetched successfully.",
      providerDetails,
    });
  } catch (error) {
    logger.error("Error during fetching Provider Details:", error);
    res
      .status(500)
      .json({ status: 500, message: "Failed to fetch Provider Details." });
  }
};

const getAllProvidersDetailsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    if (!categoryId) {
      return res
        .status(400)
        .json({ status: 400, message: "Category ID is required" });
    }

    const providers = await ProviderDetails.find({
      categoryId: { $in: [categoryId] },
    });

    // console.log("Found Providers:", providers);

    if (!providers || providers.length === 0) {
      return res.status(404).json({
        status: 404,
        message: "No providers found for the given category",
      });
    }
    res.status(200).json({ success: true, providers });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Failed to fetch provider details",
      error: err.message,
    });
  }
};

module.exports = {
  createProviderDetails,
  getAllProvidersDetails,
  updateProviderDetails,
  deleteProviderDetails,
  getProviderDetailsById,
  getAllProvidersDetailsByCategory,
  getProviderDetailsForAProvider,
};

const mongoose = require('mongoose');
const logger = require("../utils/logger");
const User = require("../models/user");
const Provider = require("../models/provider");
const { uploadSingleImageToCloudflare } = require("../utils/upload");
const Class = require("../models/classes")
const Category = require("../models/category")

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
      } = req.body;
      const file = req.file;
      // Ensure required fields are present
      if (!providerName || !categoryId || !classId) {
        return res.status(400).json({ status:400, message: "Provider name and category ID are required"});
      }
  
      const categoryExists = await Category.findById(categoryId);
      if (!categoryExists) {
        return res
          .status(404)
          .json({ status: 404, message: "Category not found." });
      }
      const classExists = await Class.findById(classId);
      if (!classExists) {
        return res
          .status(404)
          .json({ status: 404, message: "Class not found." });
      }
      // Find the user associated with the request
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({status: 404, message: "User not found" });
      }
      if (!user.isProvider) {
        return res
          .status(403)
          .json({
            status: 403,
            message: "User is not authorized to create provider details.",
          });
      }
  if (file) {
    const imageUrl = await uploadSingleImageToCloudflare(
      file,
      "img"
    );
    user.img = imageUrl;
  }
      // Create a new provider
      const providerDetails = new Provider({
        providerName,
        subtitle,
        categoryId,
        experience,
        location,
        classId,
        aboutProvider,
        img: user.img,
        providerId: user._id,
      });
  
      // Save the provider
      const createdProviderDetails = await providerDetails.save();
  
      // Update the user to mark them as a provider
      await User.findByIdAndUpdate(
        req.user.id,
        { isProvider: true },
        { new: true } // Optionally return the updated document
      );
  
      res.status(201).json({
        status: 201,
        message: "Provider created successfully.",
        provider: createdProviderDetails,
      });
  
    } catch (error) {
      logger.error("Error during provider creation:", error);
      res.status(500).json({status:500, message: "Failed to create provider." });
    }
  };

const getAllProvidersDetails = async (req, res) => {
  try {
    const providers = await Provider.find();
    res.status(200).json({
      status: 200,
      message: "Providers fetched successfully.",
      providers,
    });
  } catch (error) {
    logger.error("Error during fetching providers:", error);
    res
      .status(500)
      .json({ status: 500, message: "Failed to fetch providers." });
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
    } = req.body;
    const file = req.file;

    const providerDetails = await Provider.findById(providerId);
    if (!providerDetails) {
      return res
        .status(404)
        .json({ status: 404, message: "Provider not found." });
    }

    if (providerDetails.providerId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        status: 403,
        message: "Not authorized to update this provider.",
      });
    }

    // Update provider details
    providerDetails.providerName = providerName || providerDetails.providerName;
    providerDetails.subtitle = subtitle || providerDetails.subtitle;
    providerDetails.categoryId = categoryId || providerDetails.categoryId;
    providerDetails.experience = experience || providerDetails.experience;
    providerDetails.location = location || providerDetails.location;
    providerDetails.classId = classId || providerDetails.classId;
    providerDetails.aboutProvider =
      aboutProvider || providerDetails.aboutProvider;

    // Upload new image if provided
    if (file) {
      providerDetails.img = await uploadSingleImageToCloudflare(file, "img");
    }

    const updatedProviderDetails = await provider.save();

    res.status(200).json({
      status: 200,
      message: "Provider updated successfully.",
      provider: updatedProviderDetails,
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

    const providerDetails = await Provider.findById(providerId);
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
    const providerDetails = await Provider.findById(providerId);

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


module.exports = {
  createProviderDetails,
  getAllProvidersDetails,
  updateProviderDetails,
  deleteProviderDetails,
  getProviderDetailsById,
};
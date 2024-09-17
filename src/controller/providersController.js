const logger = require("../utils/logger");
const User = require("../models/user");
const Provider = require("../models/provider");

const createProvider = async (req, res) => {
  try {
    const {
      providerName,
      subtitle,
      categoryId,
      experience,
      location,
      classId,
      aboutProvider
    } = req.body;
    const image = req.file;
    // Ensure required fields are present
    if (!providerName || !categoryId) {
      return res.status(400).json({ message: "Provider name and category ID are required" });
    }

    // Find the user associated with the request
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create a new provider
    const provider = new Provider({
      providerName,
      subtitle,
      categoryId,
      experience,
      location,
      classId,
      aboutProvider,
      img: image ? Date.now() + '-' + image.originalname : ""
    });

    // Save the provider
    const createdProvider = await provider.save();

    // Update the user to mark them as a provider
    await User.findByIdAndUpdate(
      req.user.id,
      { isProvider: true },
      { new: true } // Optionally return the updated document
    );

    res.status(201).json({
      message: "Provider created successfully.",
      provider: createdProvider
    });

  } catch (error) {
    console.log(error)
    logger.error("Error during provider creation:", error);
    res.status(500).json({ message: "Failed to create provider.", error });
  }
};

const getAllProviders = async (req, res) => {
  try {
    const providers = await Provider.find({}).sort({ createdAt: -1 }).select({
      providerName: 1,
      subtitle: 1,
      categoryId: 1,
      experience: 1,
      location: 1,
      classId: 1,
      aboutProvider: 1,
      img: 1
    });

    if (providers.length === 0) {
      return res.status(404).json({ message: "No providers found." });
    }

    res.status(200).json({
      message: "Providers retrieved successfully.",
      providers
    });
  } catch (error) {
    logger.error("Error retrieving providers:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateProvider = async (req, res) => {
  try {
    const { providerId } = req.params;
    const updateData = req.body;

    // Ensure providerId is provided
    if (!providerId) {
      return res.status(400).json({ error: "Provider ID is required." });
    }

    // Find and update the provider
    const updatedProvider = await Provider.findByIdAndUpdate(
      providerId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    // Check if provider was found and updated
    if (!updatedProvider) {
      return res.status(404).json({ error: "Provider not found." });
    }

    res.status(200).json({
      message: "Provider updated successfully.",
      data: updatedProvider
    });

  } catch (error) {
    logger.error("Error during provider update:", error);
    res.status(500).json({ error: "Failed to update provider." });
  }
};

const deleteProvider = async (req, res) => {
  try {
    const { providerId } = req.params; // Get providerId from request parameters

    // Ensure providerId is provided
    if (!providerId) {
      return res.status(400).json({ error: "Provider ID is required." });
    }

    // Find and delete the provider
    const deletedProvider = await Provider.findByIdAndDelete(providerId);

    // Check if provider was found and deleted
    if (!deletedProvider) {
      return res.status(404).json({ error: "Provider not found." });
    }

    // Respond with success
    res.status(200).json({
      message: "Provider deleted successfully."
    });

  } catch (error) {
    logger.error("Error during provider deletion:", error);
    res.status(500).json({ error: "Failed to delete provider." });
  }
};


module.exports = {
  createProvider,
  getAllProviders,
  updateProvider,
  deleteProvider
};
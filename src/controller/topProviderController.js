const mongoose = require("mongoose");
const ProviderDetails = require("../models/providerDetails"); // Adjust path as necessary
const Classes = require("../models/classes"); // Adjust path as necessary

const getTopProviders = async (req, res) => {
  try {
    // Aggregate class data by provider
    const providerAnalysis = await Classes.aggregate([
      {
        $group: {
          _id: "$providerId",
          totalClasses: { $sum: 1 },
          totalFilledOptions: { $sum: "$filledOptions" },
          totalOptionsAvailable: { $sum: "$optionsAvailable" },
        },
      },
      {
        $lookup: {
          from: "providerdetails", // Adjust the collection name if necessary
          localField: "_id",
          foreignField: "providerId",
          as: "providerDetails",
        },
      },
      {
        $unwind: "$providerDetails",
      },
      {
        $project: {
          _id: 1,
          totalClasses: 1,
          totalFilledOptions: 1,
          totalOptionsAvailable: 1,
          providerName: "$providerDetails.providerName",
          experience: "$providerDetails.experience",
          location: "$providerDetails.location",
          img: "$providerDetails.img",
        },
      },
      {
        $sort: { totalClasses: -1 , totalFilledOptions:-1}, // Sort by totalClasses
      },
      {
        $limit: 10, // Limit to top 10 providers
      },
    ]);

    res.status(200).json({
      status: 200,
      message: "Top providers retrieved successfully",
      providers: providerAnalysis,
    });
  } catch (error) {
    console.error("Error fetching top providers:", error);
    res.status(500).json({
      status: 500,
      message: "Failed to fetch top providers.",
    });
  }
};


module.exports = { getTopProviders };

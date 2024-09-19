const ProviderDetails = require("../models/providerDetails")
const User = require("../models/user")
const addSocialLink = async (req, res) => {
  try {
    const  userId  = req.user.id;
    const { platform, url } = req.body;

    const provider = await ProviderDetails.findOne({ providerId: userId });
    console.log("Fetched Provider:", provider);
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    provider.socialLinks.push({ platform, url });
    await provider.save();

    res
      .status(200)
      .json({ message: "Social link added successfully", provider });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding social link", error: error.message });
  }
};

const updateSocialLink = async (req, res) => {
  try {
    const userId = req.user.id
    const {  socialId } = req.params;
    const { platform, url } = req.body;

        const provider = await ProviderDetails.findOne({ providerId: userId });

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }
    const socialLink = provider.socialLinks.id(socialId);
    if (!socialLink) {
      return res.status(404).json({ message: "Social link not found" });
    }

    socialLink.platform = platform || socialLink.platform;
    socialLink.url = url || socialLink.url;
    await provider.save();

    res
      .status(200)
      .json({ message: "Social link updated successfully", provider });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating social link", error: error.message });
  }
};


const removeSocialLink = async (req, res) => {
  try {
    const userId = req.user.id
    const { socialId } = req.params;

const provider = await ProviderDetails.findOne({ providerId: userId });
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }
   await ProviderDetails.findByIdAndUpdate(provider._id, {
     $pull: { socialLinks: { _id: socialId } },
   });
    await provider.save();

    res
      .status(200)
      .json({status: 200, message: "Social link removed successfully" });
  } catch (error) {
    res
      .status(500)
      .json({status:500, message: "Error removing social link", error: error.message });
  }
};

const getSocialLinks = async (req, res) => {
  try {
    const userId = req.user.id;

    const provider = await ProviderDetails.findOne({ providerId: userId });
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    res
      .status(200)
      .json({
        message: "Social links fetched successfully",
        socialLinks: provider.socialLinks,
      });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching social links", error: error.message });
  }
};

module.exports = {
  addSocialLink,
  updateSocialLink,
  removeSocialLink,
  getSocialLinks
}
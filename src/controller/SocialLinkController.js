const ProviderDetails = require("../models/providerDetails")
const User = require("../models/user")
const addSocialLink = async (req, res) => {
  try {
    const { id } = req.params;
    const { platform, url } = req.body;

    const provider = await ProviderDetails.findById(id);
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    if (provider.providerId.toString() !== req.user.id.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized to add social link" });
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
    const { id, socialId } = req.params;
    const { platform, url } = req.body;

    const provider = await ProviderDetails.findById(id);

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }
  if (provider.providerId.toString() !== req.user.id.toString()) {
    return res.status(403).json({ message: "Unauthorized to add social link" });
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
    const { id, socialId } = req.params;

    const provider = await ProviderDetails.findById(id);
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }
     if (provider.providerId.toString() !== req.user.id.toString()) {
       return res
         .status(403)
         .json({ message: "Unauthorized to remove social link" });
     }
   await ProviderDetails.findByIdAndUpdate(id, {
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
    const { id } = req.params;

    const provider = await ProviderDetails.findById(id);
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
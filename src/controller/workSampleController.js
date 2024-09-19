const ProviderDetails = require("../models/providerDetails");

const addWorkSample = async (req, res) => {
  try {
    const { id } = req.params;
    const { providerName, subtitle, aboutProvider } = req.body;

    const provider = await ProviderDetails.findById(id);
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    if (provider.providerId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        status: 403,
        message: "Not authorized add work sample",
      });
    }

    const newWorkSample = {
      providerName,
      subtitle,
      aboutProvider,
    };
    provider.workSamples.push(newWorkSample);
    await provider.save();

    res
      .status(200)
      .json({ message: "Work sample added successfully", newWorkSample });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding work sample", error: error.message });
  }
};

const getWorkSamples = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(id);
    const provider = await ProviderDetails.findById(id);
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    res.status(200).json({ workSamples: provider.workSamples });
  } catch (error) {
    res.status(500).json({ message: "Error fetching work samples", error });
  }
};

const updateWorkSample = async (req, res) => {
  try {
    const { providerId, sampleId } = req.params;
    const { providerName, subtitle, aboutProvider } = req.body;

    const provider = await ProviderDetails.findById(providerId);
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    if (provider.providerId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        status: 403,
        message: "Not authorized add work sample",
      });
    }

    const workSample = provider.workSamples.id(sampleId);
    if (!workSample) {
      return res.status(404).json({ message: "Work sample not found" });
    }
    const updatedSample = {
      providerName,
      subtitle,
      aboutProvider,
    };
    provider.workSamples.push(updatedSample);
    await provider.save();

    res
      .status(200)
      .json({ message: "Work sample updated successfully", updatedSample });
  } catch (error) {
    res.status(500).json({ message: "Error updating work sample", error });
  }
};

const deleteWorkSample = async (req, res) => {
  try {
    const { providerId, sampleId } = req.params;

    const provider = await ProviderDetails.findById(providerId);
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }
    if (provider.providerId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        status: 403,
        message: "Not authorized delete work sample",
      });
    }

    const result = await ProviderDetails.updateOne(
      { _id: providerId },
      { $pull: { workSamples: { _id: sampleId } } }
    );

    if (result.nModified === 0) {
      return res.status(404).json({ message: "Work sample not found" });
    }

    res.status(200).json({ message: "Work sample deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting work sample", error: error.message });
  }
};

module.exports = {
  addWorkSample,
  getWorkSamples,
  updateWorkSample,
  deleteWorkSample,
};

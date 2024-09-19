const mongoose = require('mongoose');

const SocialLinkSchema = new mongoose.Schema({
  platform: { type: String, required: true }, 
  url: { type: String, required: true }, 
});

const WorkSampleSchema = new mongoose.Schema({
  providerName: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
  },
  aboutProvider: {
    type: String,
  },
});
const ProviderDetailsSchema = new mongoose.Schema(
  {
    providerName: { type: String, required: true },
    subtitle: { type: String },
    categoryId: { type: [String], ref: "categories", required: true },
    experience: { type: String },
    location: { type: String },
    phoneNumber: { type: String }, 
    classId: { type: [String], ref: "class", required: true },
    aboutProvider: { type: String },
    img: { type: String },
    dob: { type: String },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    workSamples: [WorkSampleSchema],
    socialLinks: [SocialLinkSchema],
  },
  { timestamps: true }
); 

const ProviderDetails = mongoose.model('ProviderDetails', ProviderDetailsSchema);

module.exports = ProviderDetails;

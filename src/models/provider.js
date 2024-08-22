const mongoose = require('mongoose');

// Define the schema
const ProviderSchema = new mongoose.Schema({
  providerName: { type: String, required: true }, // Add validation as needed
  subtitle: { type: String },
  categoryId: { type: String, required: true }, // Add validation if needed
  experience: { type: String },
  location: { type: String },
  classId: { type: String },
  aboutProvider: { type: String },
  img: { type: String }
}, { timestamps: true }); 

// Create the model
const Provider = mongoose.model('Provider', ProviderSchema);

module.exports = Provider;

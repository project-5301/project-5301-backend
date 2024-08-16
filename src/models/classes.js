const mongoose = require('mongoose');

// Define the schema
const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  optionsAvailable: {
    type: Number,
    required: true,
  }
},{timestamps:true});

// Create the model
const classes = mongoose.model('class', classSchema);

module.exports = classes;

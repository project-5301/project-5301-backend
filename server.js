const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

// In-memory storage for classes (In real applications, use a database)
const classes = [];

// Create Class Endpoint
app.post('/api/classes', (req, res) => {
  const { name, price, optionsAvailable } = req.body;

  // Validate request body
  if (!name || typeof price !== 'number' || typeof optionsAvailable !== 'number') {
    return res.status(400).json({ error: 'Failed to create class.' });
  }

  // Create new class object
  const newClass = {
    classId: uuidv4(),
    name,
    price,
    optionsAvailable
  };

  // Save class to the storage
  classes.push(newClass);

  res.status(201).json({
    message: 'Class created successfully.',
    data: newClass
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


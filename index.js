const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 3000;

app.use(bodyParser.json());

// In-memory storage for classes
const classes = [];

// Create Class
app.post('/api/classes', (req, res) => {
  const { name, price, optionsAvailable } = req.body;

  if (!name || typeof price !== 'number' || typeof optionsAvailable !== 'number') {
    return res.status(400).json({ error: 'Failed to create class.' });
  }

  const newClass = {
    classId: uuidv4(),
    name,
    price,
    optionsAvailable,
  };

  classes.push(newClass);

  res.status(201).json({
    message: 'Class created successfully.',
    data: newClass,
  });
});

// Get Classes
app.get('/api/classes', (req, res) => {
  if (classes.length === 0) {
    return res.status(404).json({ error: 'No classes found.' });
  }

  res.status(200).json({
    message: 'Classes retrieved successfully.',
    data: classes,
  });
});

// Update Class
app.put('/api/classes/:classId', (req, res) => {
  const { classId } = req.params;
  const { name, price, optionsAvailable } = req.body;

  const classIndex = classes.findIndex((c) => c.classId === classId);

  if (classIndex === -1 || !name || typeof price !== 'number' || typeof optionsAvailable !== 'number') {
    return res.status(400).json({ error: 'Failed to update class.' });
  }

  classes[classIndex] = {
    classId,
    name,
    price,
    optionsAvailable,
  };

  res.status(200).json({
    message: 'Class updated successfully.',
    data: classes[classIndex],
  });
});

// Delete Class
app.delete('/api/classes/:classId', (req, res) => {
  const { classId } = req.params;

  const classIndex = classes.findIndex((c) => c.classId === classId);

  if (classIndex === -1) {
    return res.status(400).json({ error: 'Failed to delete class.' });
  }

  classes.splice(classIndex, 1);

  res.status(200).json({
    message: 'Class deleted successfully.',
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

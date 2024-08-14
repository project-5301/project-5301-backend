
require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const routes = require('./routes/index');
const bodyParser = require('body-parser');
const swaggerDocs = require('../swagger');
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);
swaggerDocs(app);
connectDB();


module.exports = app;

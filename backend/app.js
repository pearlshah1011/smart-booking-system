const config = require('config');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const routes = require('./src/api/routes/index.js');

// Load configurations
const port = config.get('port') || 8000;
const mongo_uri = config.get('mongo.uri');

// Load express middleware
const app = express();

// Handling unhandled rejections
process.on('unhandledRejection', (err) => {
    console.log('UNHANDLED REJECTION! Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});

process.on('uncaughtException', (err) => {
    console.log('UNCAUGHT EXCEPTION! Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));


// Load routes
app.use('/api', routes);

app.get('/', (req, res) => {
    res.status(200).send('Hello World');
});



// Load MongoDB
mongoose.set("strictQuery", false);
mongoose.connect(mongo_uri, {})
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(err => {
        console.log('Error connecting to MongoDB');
        console.log(err);
    });

app.listen(port, err => {
    if (err) {
        console.log(err);
        return process.exit(1);
    }
    console.log(`Server is running on ${port}`);
});
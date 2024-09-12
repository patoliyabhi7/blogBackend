const express = require('express')
const readEmails = require('./controller/readEmails')
const path = require('path');
const app = express();
const cors = require('cors');
const blogRoute = require('./routes/blog');
app.use(cors());
app.use(express.json());

// Serve the index.html file from the root folder
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Use the blog route for API
app.use('/api', blogRoute); 

app.get('/home', (req, res) => {
    res.status(200).send("Welcome to website");
})

module.exports = app;
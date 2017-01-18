const mongoose = require('mongoose');

// todo
mongoose.connect('mongodb://localhost/movies');

module.exports = mongoose;
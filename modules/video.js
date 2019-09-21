const mongoose  = require('mongoose');

const videoSchema = new mongoose.Schema({
    name: String,
    value: String,
    idcat : String,
    image: String
});

module.exports  = mongoose.model('Video',videoSchema);
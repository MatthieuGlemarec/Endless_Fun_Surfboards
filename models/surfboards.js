const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SurfboardSchema = new Schema({
    category: String,
    title: String,
    description: String,
    price: Number,
    length: String,
    image: [
        {
            url: String,
            filename: String,
        }
    ]
});

module.exports = mongoose.model('Surfboard', SurfboardSchema);

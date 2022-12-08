// load mongoose since we need it to define a model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
movieSchema = new Schema({
    plot: String,
    title: String,
    director: String,
    year: Number,
    rated: String
});
module.exports = mongoose.model('movies', movieSchema, 'movies');
// load mongoose since we need it to define a model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
movieSchema = new Schema({    
    "plot": String,
    "genres": {
        "type": String,
        "default": 0
    },
    "runtime": Number,
    "rated" : String,
    "cast": {
        "type": String,
        "default": 0
    },
    "num_mflix_comments" : Number,
    "poster": String,
    "title": String,
    "fullplot": String,
    "languages": {
        "type " : String,
        "default" : 0
    },
    "released" : Date,
    "directors" : {
        "type " : String,
        "default" : 0
    },
    "writers" : {
        "type " : String,
        "default" : 0
    },
    "awards" : {
        "wins" : Number,
        "nominations" : Number,
        "text": String
    }, 
    "lastupdated" : Date,
    "year" : Number,
    "imdb" : {
        "rating" : Number,
        "votes" : Number,
        "id": Number
    },
    "countries" : {
        "type " : String,
        "default" : 0
    },
    "type": String,
    "tomatoes" : {
        "viewer " : {
            "rating" : Number,
            "numReviews" : Number,
            "meter": Number
        },
    },
    "lastUpdated" : Date
});
module.exports = mongoose.model('movies', movieSchema, 'movies');

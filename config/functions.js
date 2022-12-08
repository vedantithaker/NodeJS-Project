var mongoose = require('mongoose');
var connectionurl = require('../config/dataset2');

const { MONGO_URI } = process.env;

var conn = module.exports;
var Movie = require('../models/dataset2model.js');
//Connecting to the database 
conn.initialize = (connectionString) => {
    mongoose.connect(connectionString)
        .then(() => {
            console.log('Movies database connected successfully.')
        })
        .catch((err) => {
            console.error(`Unsuccessful connection: Facing error ${err}`);
            process.exit(1);
        })
}


//Getting by ID 
conn.getMovieById = (id) => {
    const getMovie = new Promise(function (resolve, reject) {
        Movie.findById(id, function (err, movie) {
            if (err) {
                response = err
                reject(err);
            }
            response = movie;
            resolve(movie)
        });
    });
    console.log(getMovie)
    return getMovie;
}

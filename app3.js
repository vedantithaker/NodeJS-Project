require("dotenv").config();
var express = require('express');

const path = require('path');
const exphbs = require('express-handlebars');
var mongoose = require('mongoose');

//for security authentication
var cookieParser = require('cookie-parser')
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


var app = express();
const fs = require('fs');
app.use(express.json());
var database = require('./config/functions'); //fetching from functions.js
var conn1 = require('./config/dataset2');  //fetching from dataset2.js
const auth = require("./authentication/auth");
app.use(cookieParser()); 
//Initialization
//1st function
database.initialize(conn1.url);
// var port = process.env.PORT || 3500;

var bodyparser = require('body-parser');
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
app.use(bodyparser.json({ type: 'application/vnd.api+json' }));

app.use(express.static(path.join(__dirname, 'public')));

//For Handlebars
const HBS = exphbs.create({ extname: '.hbs', defaultLayout: "main", layoutsDir: path.join(__dirname, 'views', 'layouts') });
app.engine('.hbs', HBS.engine);
app.set('view engine', 'hbs');
// const { json } = require('express');


var movie = require('./models/dataset2model');

// importing user context
const User = require("./models/user");

app.get('/login', (req, res, next) => {
	res.render('login');
});


app.get('/register', (req, res, next) => {
	res.render('register');
});


// Register
app.post("/register", async (req, res) => {
// Our register logic starts here
try {
    // Get user input
    const { first_name, last_name, email, password } = req.body;

    // Validate user input
    if (!(email && password && first_name && last_name)) {
      res.status(400).send("All input is required");
    }

    // check if user already exist
    // Validate if user exist in our database
    const oldUser = await User.findOne({ email });

    if (oldUser) {
      return res.status(409).send("User Already Exist. Please Login");
    }

    //Encrypt user password
    encryptedPassword = await bcrypt.hash(password, 10);

    // Create user in our database
    const user = await User.create({
      first_name,
      last_name,
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      password: encryptedPassword,
    });

    // Create token
    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.TOKEN_KEY,
      {
        expiresIn: "2h",
      }
    );

	 // save user token
	 res.cookie('auth',token);
      res.redirect('/login')

    // return new user
    res.status(201).json(user);
  } catch (err) {
    console.log(err);
  }
});


// Login
app.post("/login", async (req, res) => {
	try {
	  // Get user input
	  let email = req.body.email;
	  let password = req.body.password;
	  // Validate user input
	  if (!(email && password)) {
		res.status(400).send("All input is required");
	  }
	  // Validate if user exist in our database
	  const user = await User.findOne({ email });
  
	  if (user && (await bcrypt.compare(password, user.password))) {
		// Create token
		const token = jwt.sign(
		  { user_id: user._id, email },
		  process.env.TOKEN_KEY,
		  {
			expiresIn: "2h",
		  }
		);
  
		// save user token
		res.cookie('auth',token);
      res.redirect('/');
	  }
	  res.status(400).send("Invalid Credentials");
	} catch (err) {
	  console.log(err);
	}
  });

// Fetching all data from the database
app.get('/',auth, function (req, res) {
	movie.find({}, function (err, result) {
		if (!err) {
			output_p = JSON.stringify(result);
			parsed_data = JSON.parse(output_p)
			res.render('allData', {
				data: parsed_data
			});
		} else {
			console.log('Failed to retrieve.' + err);
		}
	});
});

app.get('/insert',auth, (req, res, next) => {
	res.render("insert", {title : "Insert Movie"});
	});

//Inserting a movie record
app.post('/api/Movies',auth, function addNewMovie(req, res) {
	// use mongoose to get all todos in the database    
	console.log(req.body);
	movie.create({
		plot: req.body.plot,
		title: req.body.title,
		director: req.body.director,
		year: req.body.year,
		rated: req.body.rated
	}, function (err, movies) {
		if (err)
			res.send(err);
		// get and return all the movies after newly added movie record  
		movie.find(function (err, movies) {
		//movie.find().sort({_id:-1}),(function (err, movies) {
			if (err)
				console.log("Error");
			//res.send('Successfully! Movie inserted.');
			res.render('success');
		});
	});
});

//Getting movie by ID
app.get('/api/Movies/:id',auth, function (req, res) {

	let id = req.params.id;
	//Calling function getMovieById
	database.getMovieById(id).then((result) => {
		res.render('allData', {
			data: result
		});
	})
		.catch((error) => {
			console.error(error)
			res(error)
		});
});

//Updating movie 
app.put('/api/Movies/:id',auth, function updateMovieById(req, res) {
	// create mongose method to update an existing record into collection    
	console.log(req.body);
	let id = req.params.id;
	var data = {
		plot: req.body.plot,
		title: req.body.title,
		director: req.body.director,
		year: req.body.year,
		rated: req.body.rated
	}
	// save the user    
	movie.findByIdAndUpdate(id, data, function (err, movies) {
		if (err)
			console.log("Error");
		res.send('Successfully! Movie updated - ' + movies.title);
	});
});

//Deleting a movie
app.delete('/api/Movies/:id',auth, function deleteMovieById(req, res) {
	console.log(req.params.id);
	let id = req.params.id;
	movie.remove({ _id: id }, function (err) {
		if (err)
			res.send(err);
		else
			res.send('Successfully! Movie has been Deleted.');
	});
});

//UI form to filter database using title and pagination
app.get('/search',auth,(req, res, next) => {
	res.render("form", {title : "Search Page"});
	});
	
	app.post("/api/movies2",auth,(req, res) => {
	//display results
		let page = req.body.pgno;
		let perPage = req.body.perpg;
		let m_title = req.body.title; 
		console.log(m_title);
		if (m_title){  
		movie.find({title:m_title}, null, {limit:perPage, skip:(page-1)*perPage}, function(err, docs){
		if (err){
			console.log(err);
		}
		else{
			console.log(docs);
			res.render("allData", {title : "Result Page", data : docs});
		}
	}).lean()}
	else {
		movie.find(null, null, {limit:perPage, skip:(page-1)*perPage}, function(err, docs){
			if (err){
				console.log(err);
			}
			else{
				console.log(docs);
				res.render("allData", {title : "Result Page", data : docs});
			}
		}).lean()}
	});

	app.get("/welcome", auth, (req, res) => {
		res.status(200).send("Welcome");
	  });
	module.exports = app;
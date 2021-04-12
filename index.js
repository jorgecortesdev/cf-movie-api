const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const passport = require('passport');
const cors = require('cors');
const { check, validationResult } = require('express-validator');

require('dotenv').config();

require('./passport');

const app = express();
app.use(bodyParser.json());
app.use(morgan('common'));
app.use(express.static('public'));
app.use(cors());

let auth = require('./auth')(app);

const Models = require('./models');
const Movies = Models.Movie;
const Users = Models.User;

console.log(process.env.CONNECTION_URI);
mongoose.connect(process.env.CONNECTION_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

/**
 * Home route.
 */
app.get('/', (req, res) => {
    res.send('Welcome to my app!');
});

/**
 * Movies routes
 */
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.find()
        .then(movies => {
            res.json(movies)
        })
        .catch(error => {
            console.log(error);
            res.status(500).send(`Error: ${error}`);
        });
});

app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.find({'Title': req.params.Title}).then(movies => res.json(movies));
});

/**
 * Users routes
 */
app.get('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.find()
        .then(users => {
            res.status(201).json(users);
        })
        .catch(error => {
            console.error(error);
            res.status(500).send(`Error: ${error}`);
        });
});

app.post('/users', [
        check('Username', 'Username is required').isLength({min: 5}),
        check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
        check('Password', 'Password is required').not().isEmpty(),
        check('Email', 'Email does not appear to be valid').isEmail()
    ], (req, res) => {
        let errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        let hashedPassword = Users.hashPassword(req.body.Password);

        Users.findOne({'Username': req.body.Username})
            .then(user => {
                if (user) {
                    return res.status(400).send(`${req.body.Username} already exists`);
                }
                Users.create({
                    Username: req.body.Username,
                    Password: hashedPassword,
                    Email: req.body.Email,
                    Birthday: req.body.Birthday
                }).then(user =>  res.status(201).json(user))
                .catch(error => {
                    console.error(error);
                    res.status(500).send(`Error: ${error}`);
                });
            })
            .catch(error => {
                console.error(error);
                res.status(500).send(`Error: ${error}`);
            });
    }
);

app.get('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOne({Username: req.params.Username})
        .then(user => {
            res.json(user);
        })
        .catch(error => {
            console.log(error);
            res.status(500).send(`Error: ${error}`);
        });
});

app.patch('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndUpdate(
        {'Username': req.params.Username}, {
            $set: {
                Username: req.body.Username,
                Password: req.body.Password,
                Email: req.body.Email,
                Birthday: req.body.Birthday
            }
        }, {
            new: true // Makes sure that the updated document is returned
        },
        (error, updatedUser) => {
            if (error) {
                console.error(error);
                res.status(500).send(`Error: ${error}`);
            } else {
                res.json(updatedUser);
            }
        }
    )
});

app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndRemove({Username: req.params.Username})
        .then(user => {
            if (!user) {
                res.status(400).send(`${req.params.Username} was not found`);
            } else {
                res.status(200).send(`${req.params.Username} was deleted`);
            }
        })
        .catch(error => {
            console.log(error);
            res.status(500).send(`Error: ${error}`);
        });
});

app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndUpdate(
        {Username: req.params.Username}, {
            $push: {FavoriteMovies: req.params.MovieID}
        }, {
            new: true
        },
        (error, updatedUser) => {
            if (error) {
                console.log(error);
                res.status(500).send(`Error: ${error}`);
            } else {
                res.json(updatedUser);
            }
        });
});

app.patch('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndUpdate(
        { Username: req.params.Username }, {
            $pull: { FavoriteMovies: req.params.MovieID }
        }, {
            new: true
        },
        (error, updatedUser) => {
            if (error) {
                console.log(error);
                res.status(500).send(`Error: ${error}`);
            } else {
                res.json(updatedUser);
            }
        });
});

/**
 * Genres
 */
app.get('/genres/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({'Genre.Name': req.params.Name})
        .then(movie => {
            res.json(movie.Genre);
        })
        .catch(error => {
            console.log(error);
            res.status(500).send(`Error: ${error}`);
        })
});

/**
 * Directors
 */
app.get('/directors/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ 'Director.Name': req.params.Name })
        .then(movie => {
            res.json(movie.Director);
        })
        .catch(error => {
            console.log(error);
            res.status(500).send(`Error: ${error}`);
        })
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const port = process.env.PORT || 8080;

app.listen(port, '0.0.0.0', () => {
    console.log(`Listening on port ${port}`);
});

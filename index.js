const express = require('express');
const morgan = require('morgan');

const app = express();

app.use(morgan('common'));
app.use(express.static('public'));

let movies = [
    { title: 'Zack Snyder\'s Justice League', year: 2021 },
    { title: 'Coming 2 America', year: 2021 },
    { title: 'Justice League', year: 2017 },
    { title: 'Cherry', year: 2021 },
    { title: 'Raya and the Last Dragon', year: 2021 },
    { title: 'Yes Day', year: 2021 },
    { title: 'Normadland', year: 2020 },
    { title: 'Mank', year: 2020 },
    { title: 'Mortal Kombat', year: 2021 },
    { title: 'Minari', year: 2020 },
    { title: 'Deadly Illusions', year: 2021 },
];

app.get('/', (req, res) => {
    res.send('Welcome to my app!');
});

/**
 * Movies routes
 */
app.get('/movies', (req, res) => {
    res.json(movies);
});

app.get('/movies/:title', (req, res) => {
    res.send(`Successful GET request returning movie "${req.params.title}."`)
});

/**
 * Users routes
 */
app.post('/users/add', (req, res) => {
    res.send('Successful POST request adding user.');
});

app.delete('/users/1', (req, res) => {
    res.send('Successful DELETE request user removed.');
});

app.put('/users/1', (req, res) => {
    res.send('Successful PUT request user updated.');
});

app.post('/users/:id/movies/:id/lists/:id/add', (req, res) => {
    res.send('Successful POST request movie added.');
});

app.delete('/users/:id/movies/:id/lists/:id', (req, res) => {
    res.send('Successful DELETE request movie removed.');
});

/**
 * Genres
 */
app.get('/genres/:name', (req, res) => {
    res.send(`Successful GET request returning ${req.params.name}.`);
});

/**
 * Directors
 */
app.get('/directors/:name', (req, res) => {
    res.send(`Successful GET request returning ${req.params.name}.`);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});

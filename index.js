const express = require('express'),
    morgan = require('morgan');

const app = express();

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

app.use(morgan('common'));

app.get('/', (req, res) => {
    res.send('Welcome to my app!');
});

app.get('/movies', (req, res) => {
    res.json(movies);
});

app.use(express.static('public'));

app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});

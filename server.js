const express = require('express');
const PORT = process.env.PORT || 3001;
const app = express();
//parse incoming string/arr data
app.use(express.urlencoded({ extended: true }));
//parse incoming JSON data
app.use(express.json());
const { animals } = require('./data/animals.json');
const fs = require('fs');
const path = require('path');

function filterByQuery(query, animalsArray) {
    let personalityTraitsArray = [];

    //save animalsArray as filtered results here
    let filteredResults = animalsArray;

    if (query.personalityTraits) {
        //save personalitytraits as dedicated array
        //if personalityTraits is a string, place into new array and save
        if (typeof query.personalityTraits === 'string') {
            personalityTraitsArray = [query.personalityTraits];
        } else {
            personalityTraitsArray = query.personalityTraits;
        }

        //loop thru ea trait in the personalityTraits array:
        personalityTraitsArray.forEach(trait => {
            //check trait against ea animal in the filteredResults array
            //remember, it's initally a copy of animalsArray
            //here we update it for ea trait in the .forEach loop
            //for ea trait being targeted by the filter, the filteredResults
            //array will then contain only the entries that contain the trait,
            //so in the end we have an array of animals that have every one
            //of the traits when the .forEach() loop is finished
            filteredResults = filteredResults.filter(
                animal => animal.personalityTraits.indexOf(trait) !== -1
            );
        });
    }
    if(query.diet) {
        filteredResults = filteredResults.filter(animal => animal.diet === query.diet);
    }
    if (query.species) {
        filteredResults = filteredResults.filter(animal => animal.species === query.species);
    }
    if (query.name) {
        filteredResults = filteredResults.filter(animal => animal.name === query.name);
    }
    return filteredResults;
}

function findById(id, animalsArray) {
    const result = animalsArray.filter(animal => animal.id === id)[0];
    return result;
};

function createNewAnimal(body, animalsArray) {
    const animal = body;
    animalsArray.push(animal);
    fs.writeFileSync(
        path.join(__dirname, './data/animals.json'),
        JSON.stringify({animals: animalsArray }, null, 2)
    );
    return animal;
};

function validateAnimal(animal) {
    if (!animal.name || typeof animal.name !== 'string') {
        return false;
    }
    if (!animal.species || typeof animal.species !== 'string') {
        return false;
    }
    if (!animal.diet || typeof animal.diet !== 'string') {
        return false;
    }
    if (!animal.personalityTraits || !Array.isArray(animal.personalityTraits)) {
        return false;
    }
    return false;
}
//route to fetch from, then callback w data as parameters
app.get('/api/animals', (req, res) => {
    let results = animals;
    if (req.query) {
        results = filterByQuery(req.query, results);
    }
    res.json(results);
});

app.get('/api/animals/:id', (req, res) => {
    const result = findById(req.params.id, animals);
    if (result) {
        res.json(result);
    } else {
        res.sendStatus(404);
    }
});

app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname,'./public/index.html'));
});

app.post('/api/animals', (req,res)=>{
    //set id based on next index of arr 
    req.body.id = animals.length.toString();

    //if any data in req.body is incorrect, send 400 error back
     if (!validateAnimal(req.body)) {
         res.status(400).send("The animal isn't properly formatted.");
    } else {
        //add animal to json file and animals arr in this function
        const animal = createNewAnimal(req.body, animals);
        //req.body is where incoming data goes
        res.json(animal);
    }
});

app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}!`);
});
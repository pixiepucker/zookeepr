const express = require('express');
const PORT = process.env.PORT || 3001;
const app = express();
const { animals } = require('./:data/animals.json');

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

//route to fetch from, then callback w data as parameters
app.get('/api/animals', (req, res) => {
    let results = animals;
    if (req.query) {
        results = filterByQuery(req.query, results);
    }
    res.json(results);
});

app.listen(PORT, ()=>{
    console.log(`API server now on port ${PORT}!`);
});
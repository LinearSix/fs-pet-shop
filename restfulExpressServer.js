'use strict';

let fs = require('fs');
let path = require('path');
let petsPath = path.join(__dirname, 'pets.json');
let express = require('express');
let app = express();
// CONFIGURE MORGAN
let morgan = require('morgan');
app.use(morgan('dev'));
// CONFIGURE BODY-PARSER
let bodyParser = require('body-parser')
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

let port = process.env.PORT || 8000;

app.disable('x-powered-by');

// handle root route request
// PROCESS GET REQUEST WITH NO ID
app.get('/pets', function(req, res) {
    fs.readFile(petsPath, 'utf8', function(err, petsJSON) {
        if (err) {
        console.error(err.stack);
        return res.sendStatus(500);
        };
        // let pets = JSON.parse(petsJSON);
        res.set('Content-Type', 'application/json');
        res.send(petsJSON);
    });
});

// PROCESS GET REQUEST WITH ID
app.get('/pets/:id', function(req, res) {
  fs.readFile(petsPath, 'utf8', function(err, petsJSON){
    if (err) {
      console.error(err.stack);
      return res.sendStatus(500);
    };
    let id = Number.parseInt(req.params.id);
    let pets = JSON.parse(petsJSON);
    if (id < 0 || id >= pets.length || Number.isNaN(id)) {
      return res.sendStatus(404);
    };
    res.set('Content-Type', 'application/json');
    res.send(pets[id]);
  });
});

// POST REQUEST
app.post('/pets', function (req, res) {
    fs.readFile(petsPath, 'utf8', function(err, petsJSON){
        if (err) {
        console.error(err.stack);
        return res.sendStatus(500);
        };
        if (req.body.age && req.body.kind && req.body.name) {
            let pets = JSON.parse(petsJSON);
            // if it wasn't for that stupid age, I could just push req.body, but no. I need to make an object.
            let recordNew = new Object();
                recordNew.age = Number(req.body.age);
                recordNew.kind = req.body.kind;
                recordNew.name = req.body.name;
            pets.push(recordNew);

            fs.writeFile('pets.json', JSON.stringify(pets), (err) => {
                // send the created data to the user
                res.set('Content-Type', 'application/json');
                res.send(recordNew);
            });
        } else {
            res.set('Content-Type', 'application/json');
            res.sendStatus(400);
        };
    });
});

// PUT REQUEST
app.patch('/pets/:id', function (req, res) {
    fs.readFile(petsPath, 'utf8', (err, petsJSON) => {
        if (err) {
            console.error(err.stack);
            return res.sendStatus(500);
        };
        let id = Number.parseInt(req.params.id);
        let pets = JSON.parse(petsJSON);
        if (id < 0 || id >= pets.length || Number.isNaN(id)) {
            return res.sendStatus(404);
        };
        let recordNew = new Object();
            recordNew.age = (Number(req.body.age) ? Number(req.body.age) : pets[id].age);
            recordNew.kind = (req.body.kind ? req.body.kind : pets[id].kind);
            recordNew.name = (req.body.name ? req.body.name : pets[id].name);
        pets.splice(id, 1, recordNew);
            
        fs.writeFile('pets.json', JSON.stringify(pets), (err) => {
        // print the created data
        // send the created data to the user
        res.set('Content-Type', 'application/json');
        res.send(recordNew);
        });
    });
});

app.delete('/pets/:id', function (req, res) {
    fs.readFile(petsPath, 'utf8', (err, petsJSON) => {
        if (err) {
            console.error(err.stack);
            res.set('Content-Type', 'application/json');
            return res.sendStatus(500);
        };
        let id = Number.parseInt(req.params.id);
        let pets = JSON.parse(petsJSON);
        if (id < 0 || id >= pets.length || Number.isNaN(id)) {
            return res.sendStatus(404);
        };
        let deletedRecord = pets[id];
        pets.splice(id, 1);
        fs.writeFile('pets.json', JSON.stringify(pets), (err) => {
        res.set('Content-Type', 'application/json');
        res.send(deletedRecord);
        });
    });
});

app.listen(port, function() {
  console.log('Listening on port', port);
});

module.exports = app;
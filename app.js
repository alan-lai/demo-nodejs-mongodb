const http = require('http');
const Mongo = require('mongodb');
const MongoClient = Mongo.MongoClient;
const express = require('express');
const server = express();
let url = 'mongodb://localhost:27017/';

server.listen(3000, () => console.log('Example app listening on port 3000!'))
server.get('/', (req, res) => {
    MongoClient.connect(url).then(function (db) {
        var dbo = db.db('projectQuotes');
        dbo.collection('authors').findOne({}, (err, result) => {
            if (err) throw err;
            res.send(result);
            db.close();
        });
    }, function (error) {
        console.log(err);
        res.status(500).end();
    });
});

server.get('/authors', (req, res) => {
    MongoClient.connect(url).then(function (db) {
        var dbo = db.db('projectQuotes');
        dbo.collection('authors').find({}).toArray((err, result) => {
            if (err) throw err;
            res.send(result);
            db.close();
        });
    }, function (error) {
        console.log(err);
        res.status(500).end();
    });
});

server.get('/author/:lastName/:firstName', (req, res) => {
    let firstNamePattern = new RegExp(req.params.firstName, 'i');
    let lastNamePattern = new RegExp(req.params.lastName, 'i');
    MongoClient.connect(url).then(function (db) {
        var dbo = db.db('projectQuotes');
        dbo.collection('authors').find({ first_name: firstNamePattern, last_name: lastNamePattern}).toArray((err, authors) => {
            if (err) throw err;
            if(authors.length) {
                authors.forEach(function(author){
                    dbo.collection('quotes').find({ author_id: author._id.toString() }).toArray((err, quotes) => {
                        if(err) throw err;
                        author.quotes = quotes;
                        res.send(author);
                    });
                });
            } else {
                res.status(400).end();
            }
            db.close();
        });
    }, function (error) {
        console.log(err);
        res.status(500).end();
    });
});

server.get('/quote/:id', (req, res) => {
    MongoClient.connect(url).then(function (db) {
        var dbo = db.db('projectQuotes');
        // dbo.collection('quotes').findOne({_id: new Mongo.ObjectId(req.params.id)}, (err, result) => {
        dbo.collection('quotes').findOne({id: parseInt(req.params.id)}, (err, result) => {
            if (err) throw err;
            res.send(result);
            db.close();
        });
    }, function (error) {
        console.log(err);
        res.status(500).end();
    });
});

//insert code
// function getNextSequence(name) {
//     var ret = db.counters.findAndModify(
//         {
//             query: { _id: name },
//             update: { $inc: { seq: 1 } },
//             new: true
//         }
//     );
//     return ret.seq;
// }

// 1. Add new author
// 2. Add new quote
// 3. Search quotes by keyword
// 4. Search authors by keyword
// 5. Lock under admin
// 6. UI
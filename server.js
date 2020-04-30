const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express();
const MongoClient = require('mongodb').MongoClient;

var originsWhitelist = [
    'http://localhost:4200'
];

var corsOptions = {
    origin: function (origin, callback) {
        var isWhitelisted = originsWhitelist.indexOf(origin) !== -1;
        callback(null, isWhitelisted);
    },
    credentials: true
}
app.use(cors(corsOptions));

let connectionString = 'mongodb+srv://root:1234@cluster0-mcayk.mongodb.net/test?retryWrites=true&w=majority';

app.use(bodyParser.urlencoded({ extended: true }))

app.listen(3000, function () {
    console.log('listening on 3000');
})

MongoClient.connect(connectionString, { useUnifiedTopology: true }, (err, client) => {
    if (err) return console.error(err);
    console.log('Connected to Database');

    const db = client.db('client-portal')
    const reportsCollection = db.collection('reports');
    const usersCollection = db.collection('users');

    app.get('/', (req, res) => {
        res.sendFile(__dirname + '/index.html');
    });

    app.get('/get-all-complaints', (req, res) => {
        reportsCollection.find().toArray()
            .then(results => {
                res.json({ results })
                console.log(results)
            })
            .catch(error => console.error(error))
    });

    app.post('/get-complaint', (req, res) => {
        const filter = { _id: req.body.id };
        reportsCollection.findOne(filter)
            .then(results => {
                res.json({ results })
                console.log(results)
            })
            .catch(error => console.error(error))
    });

    app.post('/create-complaint', (req, res) => {
        reportsCollection.insertOne(req.body)
            .then(result => {
                res.send("record inserted");
            })
            .catch(error => console.error(error));
    });

    app.post('/update-complaint', (req, res) => {
        const filter = { _id: req.body.id };
        const update = {
            $set: {
                complaint: req.body.complaint
            }
        }
        reportsCollection.findOneAndUpdate(filter, update)
            .then(result => {
                console.log(result);
                console.log("updated");
            });
    });

    app.post('/delete-complaint', (req, res) => {
        const filter = { username : req.body.username };
        reportsCollection.remove(filter)
            .then(result => {
                console.log(result);
                res.send("record deleted");
            });
    });

    app.post('/register-user', (req, res) => {
        usersCollection.insertOne(req.body)
            .then(result => {
                res.send("user registered");
            })
            .catch(error => console.error(error));
    });

    app.post('/login', (req, res) => {
        const filter = { username: req.body.username };
        usersCollection.findOne(filter)
            .then(results => {
                res.json({ results })
                console.log(results)
            })
            .catch(error => console.error(error))
    });

    app.post('/test', (req, res) => {
        console.log(req.body)
        res.json({ message: 'sucess' })
    });
})
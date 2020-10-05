const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
// ===========================================================

// Default Port:
const port = 5000;
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Mongodb Connection:
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jqvnn.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect((err) => {
  // Collection
  const tasksCollection = client.db('volunteerNetwork').collection('tasks');
  const registrationCollection = client
    .db('volunteerNetwork')
    .collection('registration');

  // Add Volunteer Registration (Create)
  app.post('/addRegistration', (req, res) => {
    const newRegistration = req.body;
    registrationCollection.insertOne(newRegistration).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  // Show data for login user (Read)
  app.get('/userTasks', (req, res) => {
    // console.log(req.query.email)
    registrationCollection
      .find({ email: req.query.email })
      .toArray((err, documents) => {
        res.send(documents);
      });
  });

  // Admin dashboard, show all register (Read)
  app.get('/adminTasks', (req, res) => {
    registrationCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  // Add event (create)
  app.post('/addEvent', (req, res) => {
    const taskEvent = req.body;
    tasksCollection.insertOne(taskEvent).then((result) => {
      // console.log(result)
      res.send(result.insertedCount > 0);
    });
  });

  // Read tasksData from mongo:
  app.get('/taskEvents', (req, res) => {
    tasksCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  // Read single task from mongo based on user selection:
  app.get('/taskEvents/:_id', (req, res) => {
    tasksCollection
      .find({ _id: ObjectId(req.params._id) })
      .toArray((err, documents) => {
        res.send(documents[0]);
      });
  });

  // Delete Task from UserDashboard and Admin Dashboard
  app.delete('/deleteTask/:_id', (req, res) => {
    registrationCollection
      .deleteOne({ _id: ObjectId(req.params._id) })
      .then((result) => {
        res.send(result.deletedCount > 0);
      });
  });
});

// Root:
app.get('/', (req, res) => {
  res.send('The Server is running');
});

// Listener port
app.listen(process.env.PORT || port);

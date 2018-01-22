var express = require('express');
var firebase = require("firebase");

var router = express.Router();

var notesByDept = {
  6: [
    { dept: "6", number: "6.006", title: "Algorithm", year: "2015" },
    { dept: "6", number: "6.01", title: "Intro to EECS", year: "2016" },
  ],
  10: [
    { dept: "10", number: "10.10", title: "Intro to ChemE", year: "2014" },
    { dept: "10", number: "10.301", title: "Fluid Mechanics", year: "2016" },
  ],
  16: [
    { dept: "16", number: "16.09", title: "Statistics and Probability", year: "2015" },
    { dept: "16", number: "16.100", title: "Aerodynamics", year: "2012" },
  ],
}

var SECRETS = require('../config');
var fbConfig = {
  apiKey: SECRETS.FIREBASE.API_KEY,
  authDomain: SECRETS.FIREBASE.PRJ_ID + ".firebaseapp.com",
  databaseURL: "https://" + SECRETS.FIREBASE.DB_NAME + ".firebaseio.com",
  storageBucket: SECRETS.FIREBASE.BUCKET + ".appspot.com",
};

firebase.initializeApp(fbConfig);
var database = firebase.database();

/* ILLEGAL access. */
router.get('/', function(req, res, next) {
  res.render('error',{ message : "Error 401 - Unauthorized" });
});

/* GET all notes. */
router.get('/notes', function(req, res, next) {
  // res.json(notesByDept);
  var ref = database.ref("/notes/");
  ref.once('value').then(function(snapshot) {
    var notes = snapshot.val();
    res.json(notes);
  });
});

/* GET notes by department. */
router.get('/notes/:dept', function(req, res, next) {
  let deptID = req.params.dept;
  var ref = database.ref("/note_by_dept/"+deptID);
  ref.once('value').then(function(snapshot) {
    var notes = snapshot.val();
    res.json(notes);
  });
  // res.json(notesByDept[deptID]);
});

module.exports = router;

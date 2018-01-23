const express = require('express');
const firebase = require('firebase');
const database = require('../modules/firebase');

const router = express.Router();

/* ILLEGAL access. */
router.get('/', function(req, res, next) {
  res.render('error',{ message : "Error 401 - Unauthorized" });
});

/* GET featured notes. */
router.get('/notes/featured', function(req, res, next) {
  if (!req.isAuthenticated()) {
    res.render('error',{ message : "Error 401 - Unauthorized" });
    return;
  }

  let ref = database.ref("/note_by_dept/")
  ref.orderByChild("upload_time").limitToLast(4).once("value").then(function(snapshot) {
    let notes = snapshot.val();
    let extracted = {};
    for (let dept of Object.keys(notes)) {
      let deptNotes = notes[dept]
      for (let noteID of Object.keys(deptNotes)) {
        extracted[noteID] = deptNotes[noteID]
      }
    }
    res.json(extracted);
  });
});

/* GET notes by department. */
router.get('/notes/:dept', function(req, res, next) {
  if (!req.isAuthenticated()) {
    res.render('error',{ message : "Error 401 - Unauthorized" });
    return;
  }

  let deptID = req.params.dept;
  let ref = database.ref("/note_by_dept/"+deptID);
  ref.once("value").then(function(snapshot) {
    let notes = snapshot.val();
    res.json(notes);
  });
});

/* GET notes by subject number. */
router.get('/notes/number/:subject', function(req, res, next) {
  if (!req.isAuthenticated()) {
    res.render('error',{ message : "Error 401 - Unauthorized" });
    return;
  }

  let subjectID = req.params.subject.toUpperCase();
  let regex = subjectID.match('(^[A-Z0-9]+)\\.[A-Z0-9]+$');
  let deptID = regex[1];
  let ref = database.ref("/note_by_dept/"+deptID)
  ref.orderByChild("number").equalTo(subjectID).once("value").then(function(snapshot) {
    let notes = snapshot.val();
    res.json(notes);
  });
});

module.exports = router;

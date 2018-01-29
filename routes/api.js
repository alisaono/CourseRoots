const express = require('express');
const aws = require('aws-sdk');
const database = require('../modules/firebase');

const router = express.Router();

let S3_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY;
if (process.env.NODE_ENV) { // Running on production server
	let SECRETS = process.env; // Configureation is stored on process environment
  S3_BUCKET = SECRETS.S3_BUCKET;
  AWS_ACCESS_KEY_ID = SECRETS.AWS_ACCESS_KEY_ID;
  AWS_SECRET_ACCESS_KEY = SECRETS.AWS_SECRET_ACCESS_KEY;
} else { // Running on local machine
	let SECRETS = require('../config');
  S3_BUCKET = SECRETS.AWS.S3_BUCKET;
  AWS_ACCESS_KEY_ID = SECRETS.AWS.AWS_ACCESS_KEY_ID;
  AWS_SECRET_ACCESS_KEY = SECRETS.AWS.AWS_SECRET_ACCESS_KEY;
}
const s3 = new aws.S3({accessKeyId: AWS_ACCESS_KEY_ID, secretAccessKey: AWS_SECRET_ACCESS_KEY});

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

/* GET note by id. */
router.get('/notes/:dept/:id', function(req, res, next) {
  if (!req.isAuthenticated()) {
    res.render('error',{ message : "Error 401 - Unauthorized" });
    return;
  }

  let deptID = req.params.dept;
  let noteID = req.params.id;
  let ref = database.ref("/note_by_dept/"+deptID+"/"+noteID);
  ref.once("value").then(function(snapshot) {
    let note = snapshot.val();
    res.json(note);
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

/* GET user info by userID. */
router.get('/users/:id', function(req, res, next) {
  if (!req.isAuthenticated()) {
    res.render('error',{ message : "Error 401 - Unauthorized" });
    return;
  }

  let userID = req.params.id;
  let result = {};

  database.ref("/users/"+userID).once("value").then(function(userSnap) {
    let data = userSnap.val();
    result['name'] = data.first_name + " " + data.last_name;
    result['kerbero'] = data.kerbero;
    result['major'] = data.major ? data.major : "";
    result['year'] = data.year ? data.year : "";
    result['introduction'] = data.introduction ? data.introduction : "";

    if (data.favorites || data.uploads) {
      database.ref("/note_by_dept/").once("value").then(function(notesSnap) {
        let notes = notesSnap.val();

        if (data.favorites) {
          let favorites = {};
          for (let noteID of Object.keys(data.favorites)) {
            let dept = data.favorites[noteID]['dept']
            favorites[noteID] = notes[dept][noteID]
          }
          result['favorites'] = favorites;
        } else {
          result['favorites'] = null;
        }

        if (data.uploads) {
          let uploads = {};
          for (let noteID of Object.keys(data.uploads)) {
            let dept = data.uploads[noteID]['dept']
            uploads[noteID] = notes[dept][noteID]
          }
          result['uploads'] = uploads;
        } else {
          result['uploads'] = null;
        }

        res.json(result);
      });

    } else {
      result['favorites'] = null;
      result['uploads'] = null;
      res.json(result);
    }
  });
});

/* POST profile updates */
router.post('/me/update', function(req, res, next) {
  if (!req.isAuthenticated()) {
    res.render('error',{ message : "Error 401 - Unauthorized" });
    return;
  }

  let userID = req.user.mit_id;
  let newValues = {};

  if (req.body.major) {
		newValues['major'] = req.body.major;
	}
  if (req.body.year) {
    newValues['year'] = req.body.year;
  }
  if (req.body.introduction) {
    newValues['introduction'] = req.body.introduction;
  }

  database.ref("/users/" + userID).update(newValues, function(error) {
    let message = error ? error : "";
    res.send(message);
  })
})

/* POST add user favorite */
router.post('/me/like', function(req, res, next) {
  if (!req.isAuthenticated()) {
    res.render('error',{ message : "Error 401 - Unauthorized" });
    return;
  }

  let deptID = req.body.dept;
  let noteID = req.body.id;
  let userID = req.user.mit_id;

  let updates = {};
  updates['/users/'+userID+'/favorites/'+noteID] = { dept: deptID };

  let newLike = {};
  newLike[userID] = true;
  updates['/note_by_dept/'+deptID+'/'+noteID+'/usersLiked'] = newLike;

  database.ref().update(updates, function(error) {
    if (error) {
      res.send(error);
      return;
    }

    let ref = database.ref('/note_by_dept/'+deptID+'/'+noteID+'/popularity');
    ref.transaction(function(currCount) {
      return currCount + 1;
    }, function(error, committed, snapshot) {
      let message = error ? error : "";
      res.send(message);
    });
  });
})

/* POST remove user favorite */
router.post('/me/unlike', function(req, res, next) {
  if (!req.isAuthenticated()) {
    res.render('error',{ message : "Error 401 - Unauthorized" });
    return;
  }

  let deptID = req.body.dept;
  let noteID = req.body.id;
  let userID = req.user.mit_id;

  let updates = {};
  updates['/users/'+userID+'/favorites/'+noteID] = null;
  updates['/note_by_dept/'+deptID+'/'+noteID+'/usersLiked/'+userID] = null;

  database.ref().update(updates, function(error) {
    if (error) {
      res.send(error);
      return;
    }

    let ref = database.ref('/note_by_dept/'+deptID+'/'+noteID+'/popularity');
    ref.transaction(function(currCount) {
      return currCount - 1;
    }, function(error, committed, snapshot) {
      let message = error ? error : "";
      res.send(message);
    });
  });
})

/* POST add user favorite */
router.post('/upload', function(req, res, next) {
  if (!req.isAuthenticated()) {
    res.render('error',{ message : "Error 401 - Unauthorized" });
    return;
  }

  let noteObj = JSON.parse(req.body.note);
  let deptID = noteObj.dept;
  let userID = req.user.mit_id;

  noteObj['author'] = req.user.kerbero;
  noteObj['authorID'] = req.user.mit_id;
  noteObj['popularity'] = 0;
  noteObj['upload_time'] = Math.round(Date.now()/1000);

  let newNoteRef = database.ref("/note_by_dept/"+deptID).push();
  let noteID = newNoteRef.key;

  let updates = {};
  updates['/users/'+userID+'/uploads/'+noteID] = { dept: deptID };
  updates['/note_by_dept/'+deptID+'/'+noteID] = noteObj;

  database.ref().update(updates, function(error) {
    let message = error ? error : "";
    res.send(message);
  });
})

router.post('/annotate', function(req, res, next) {
  if (!req.isAuthenticated()) {
    res.render('error',{ message : "Error 401 - Unauthorized" });
    return;
  }

  console.log("annotate route");
  console.log(req.body);

  let deptID = req.body.deptID;
  let noteID = req.body.noteID;
  let newAnnotationRef = database.ref("/note_by_dept/"+deptID+"/"+noteID+"/annotations").push();
  let annotationID = newAnnotationRef.key;


  let newValues = {};

  newValues['content'] = req.body.content;
  newValues['page'] = req.body.page;
  newValues['user'] = req.user.kerbero;
  newValues['x_coords'] = req.body.x_coords;
  newValues['y_coords'] = req.body.y_coords;

  console.log(newValues)

  database.ref("/note_by_dept/"+deptID+"/"+noteID+"/annotations/" + annotationID).update(newValues, function(error) {
    let message = error ? error : "";
    res.send(message);
  })
})

/* GET a signed S3 upload URL */
router.get('/sign_s3', (req, res) => {
  let userID = req.user.mit_id
  let timestamp = Date.now()
  let suffix = Math.floor(Math.random()*400)
  let fileName = userID + '-' + timestamp + '-' + suffix + '.pdf'

  let params = {
    Bucket: S3_BUCKET,
    Key: fileName,
    Expires: 60,
    ContentType: 'application/pdf',
    ACL: 'public-read',
  }

  s3.getSignedUrl('putObject', params, (err, data) => {
    if (err) {
      console.log(err)
      return res.end()
    }
    let returnData = {
      signedRequest: data,
      pdfID: fileName,
    }
    res.write(JSON.stringify(returnData))
    res.end()
  })
})

module.exports = router;

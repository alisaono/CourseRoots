var express = require('express');
var router = express.Router();

const deptHeaders = {
  '1': "Course 1: Civil and Environmental Engineering",
  '2': "Course 2: Mechanical Engineering",
  '3': "Course 3: Materials Science and Engineering",
  '4': "Course 4: Architecture",
  '5': "Course 5: Chemistry",
  '6': "Course 6: Electrical Engineering and Computer Science",
  '7': "Course 7: Biology",
  '8': "Course 8: Physics",
  '9': "Course 9: Brain and Cognitive Sciences",
  '10': "Course 10: Chemical Engineering",
  '11': "Course 11: Urban Studies and Planning",
  '12': "Course 12: Earth, Atmospheric, and Planetary Sciences",
  '14': "Course 14: Economics",
  '15': "Course 15: Management",
  '16': "Course 16: Aeronautics and Astronautics",
  '17': "Course 17: Political Science",
  '18': "Course 18: Mathematics",
  '20': "Course 20: Biological Engineering",
  '21': "Course 21: Humanities",
  '21A': "Course 21A: Anthropology",
  '21G': "Course 21G: Global Studies and Languages",
  '21H': "Course 21H: History",
  '21L': "Course 21L: Literature",
  '21M': "Course 21M: Music and Theater Arts",
  '21W': "Course 21W/CMS: Comparative Media Studies/Writing",
  '22': "Course 22: Nuclear Science and Engineering",
  '24': "Course 24: Linguistics and Philosophy",
  'HST': "HST: Health Sciences and Technology",
  'IDS': "IDS: Data, Systems, and Society",
  'MAS': "MAS: Media Arts and Sciences",
  'STS': "STS: Science, Technology, and Society"
}

/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.isAuthenticated()) {
    res.redirect('/home');
    return;
  }

  res.render('landing');
});

/* GET main page. */
router.get('/home', function(req, res, next) {
  if (!req.isAuthenticated()) {
    res.redirect('/');
    return;
  }

  res.render('main', { thisUser: req.user });
});

/* GET main page by department. */
router.get('/home/:dept', function(req, res, next) {
  if (!req.isAuthenticated()) {
    res.redirect('/');
    return;
  }

  let deptID = req.params.dept;
  res.render('course', { deptID: deptID, deptHeader: deptHeaders[deptID], thisUser: req.user });
});

/* GET search result page by subject number. */
router.get('/search/number', function(req, res, next) {
  if (!req.isAuthenticated()) {
    res.redirect('/');
    return;
  }

  let subjectID = req.query.subject;
  res.render('subject', { subjectID: subjectID, thisUser: req.user });
});

/* GET note page. */
router.get('/notes/:dept/:id/:pdfID', function(req, res, next) {
  if (!req.isAuthenticated()) {
    res.redirect('/');
    return;
  }

  let noteID = req.params.id;
  let deptID = req.params.dept;
  let pdfID = req.params.pdfID;
  res.render('note', { thisUser: req.user, noteID: noteID, deptID: deptID, pdfID: pdfID});
});

/* GET user page. */
router.get('/users/:id', function(req, res, next) {
  if (!req.isAuthenticated()) {
    res.redirect('/');
    return;
  }

  let userID = req.params.id;
  if (req.user.mit_id === userID) {
    res.redirect('/me');
    return;
  }

  res.render('user', { userID: userID, thisUser: req.user });
});

/* GET your own user page. */
router.get('/me', function(req, res, next) {
  if (!req.isAuthenticated()) {
    res.redirect('/');
    return;
  }

  res.render('me', { thisUser: req.user });
});

/* GET log out. */
router.get('/logout', function(req, res, next) {
  req.logout();
  res.redirect('/');
});

module.exports = router;

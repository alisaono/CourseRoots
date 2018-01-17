var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('landing');
});

/* GET main page. */
router.get('/home', function(req, res, next) {
  let userInfo = { name: "Meowy", id: "123456" };
  res.render('main', { thisUser: userInfo });
});

/* GET note page. */
router.get('/notes/:id', function(req, res, next) {
  let noteID = req.params.id;
  let noteObj = { subject: "Linear Algebra", id: noteID }
  res.render('note', { thisNote: noteObj });
});

module.exports = router;

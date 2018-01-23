const deptIDs = [
  "1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
  "11", "12", "14", "15", "16", "17", "18", "20", "21",
  "21A", "21G", "21H", "21L", "21M", "21W", "22", "24",
  "HST", "IDS", "MAS", "STS"]

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

const fetchLimit = 3
var fetching = false
var doneFetching = false
var lastFetched = -1
var fetchTarget = 0

$(document).ready(function(){
  $.getJSON("/api/notes/featured",function(data){
    let featuredNotes = []
    for (let noteID of Object.keys(data)) {
      featuredNotes.push(data[noteID])
    }
    for (let i = 0; i < featuredNotes.length; i++) {
      let note = featuredNotes[i]
      addNoteToRow(note,"#notes-featured")
    }
  })

  addDeptRows(0,fetchLimit)

  $("#search-btn").on('click', function(e) {
    e.preventDefault()
    let input = $("#subject-input").val()
    let regex = RegExp('^[a-z0-9]+\\.[a-z0-9]+$','i')
    if (regex.test(input)) {
      $("#subject-search").submit()
    } else {
      $('#input-warning').modal()
    }
  })

  $(window).on('scroll', function() {
    if (fetching || doneFetching) {
      return
    }
    if ($(window).scrollTop() + $(window).innerHeight() > fetchTarget) {
      addDeptRows(lastFetched + 1, Math.min(deptIDs.length, lastFetched + fetchLimit + 1))
      if (lastFetched === deptIDs.length - 1) {
        doneFetching = true
      }
    }
  })
})

function addDeptRows(start,end) {
  fetching = true

  for (let i = start; i < end; i++) {
    let deptID = deptIDs[i]
    let $header = $("<h2 id='header-"+deptID+"' class='my-4'>"+deptHeaders[deptID]+"</h2>")
    $("#notes-feed").append($header)
    $("#notes-feed").append("<div id='notes-"+deptID+"' class='row'></div>")
  }

  for (let i = start; i < end; i++) {
    let deptID = deptIDs[i]
    $.getJSON("/api/notes/"+deptID,function(data){
      let deptNotes = []

      if (data === null) {
        $("#notes-"+deptID).append("<p class='no-notes'>No notes available at this time. Check again later!</p>")
      } else {
        for (let noteID of Object.keys(data)) {
          deptNotes.push(data[noteID])
        }
        for (let i = 0; i < Math.min(4,deptNotes.length); i++) {
          let note = deptNotes[i]
          addNoteToRow(note,"#notes-"+deptID)
        }
        $("#header-"+deptID).append("<a href='/home/"+deptID+"'>See more</a>")
      }

      if (i === end-1) {
        lastFetched = i
        fetchTarget = $("#notes-"+deptIDs[lastFetched]).offset().top
        fetching = false
      }
    })
  }
}

function addNoteToRow(note,rowID) {
  let uploadTime = stringifyTime(note.upload_time)
  let instructors = ""
  for (let person of note.instructors) {
    instructors += ", " + person
  }
  let $wrapper = $("<div class='col-lg-3 col-md-4 col-sm-6 note-item'></div>")
  let $card = $("<div class='card h-100'></div>")
  let $cardBody = $("<div class='card-body'></div>")
  let $cardTitle = $("<h4 class='card-title'></h4>")
  let $cardSubTitle = $("<h5 class='card-subtitle '>"+note.title+"</h6>")
  $cardTitle.append("<a target='_blank' href=note.pdf_url>"
    + note.number + "</a>")
  $cardBody.append($cardTitle)
  $cardBody.append($cardSubTitle)
  $cardBody.append("<p class='card-text'>Taught in " + note.year + " " + note.term +
    "<br/>by " + instructors.slice(2) + "</p>")
  $cardBody.append("<p class='card-text'>Uploaded " + uploadTime +
    "<br/>by " + note.author + "</p>")
  // $card.append("<img class='card-img-top' src='http://placehold.it/600x400' alt=''>")
  $card.append($cardBody)
  $wrapper.append($card)
  $(rowID).append($wrapper)
}

function stringifyTime(timestamp) {
  let uploadTimeAgo = Math.round(Date.now()/1000) - timestamp
  let uploadString
  if (uploadTimeAgo < 3600) {
    uploadString = "just now"
  } else if (uploadTimeAgo < 3600*24) {
    uploadString = Math.floor(uploadTimeAgo/3600) + " hours ago"
  } else {
    uploadString = Math.floor(uploadTimeAgo/3600/24) + " days ago"
  }
  return uploadString
}

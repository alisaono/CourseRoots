$(document).ready(function(){
  let notesByTime = []
  let notesByPopularity = []
  let notesByYear = []
  let notesByNumber = []

  $.getJSON("/api/notes/"+deptID,function(data){
    if (data === null) {
      $("#notes").append("<p class='no-notes'>No notes available at this time. Check again later!</p>")
      return
    }
    for (let noteID of Object.keys(data)) {
      notesByTime.push(data[noteID])
    }
    notesByTime.sort(function compare(a,b) {
      if (a.upload_time < b.upload_time) return 1
      if (a.upload_time > b.upload_time) return -1
      return 0
    })
    updateNotes(notesByTime)
  })

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

  $("#sort").change(function() {
    let sortOption = $(this).val()
    switch(sortOption) {
      case "upload_time":
        updateNotes(notesByTime)
        break
      case "popularity":
        if (notesByPopularity.length !== notesByTime.length) {
          notesByPopularity = notesByTime.slice().sort(function compare(a,b) {
            if (a.popularity < b.popularity) return 1
            if (a.popularity > b.popularity) return -1
            return 0
          })
        }
        updateNotes(notesByPopularity)
        break
      case "year":
        if (notesByYear.length !== notesByTime.length) {
          notesByYear = notesByTime.slice().sort(function compare(a,b) {
            if (a.year < b.year) return 1
            if (a.year > b.year) return -1
            if (a.term !== b.term) {
              if (a.term === "Spring") return 1
              if (b.term === "Fall") retun -1
            }
            return 0
          })
        }
        updateNotes(notesByYear)
        break
      case "number":
        if (notesByNumber.length !== notesByTime.length) {
          notesByNumber = notesByTime.slice().sort(function compare(a,b) {
            if (a.number > b.number) return 1
            if (a.number < b.number) return -1
            return 0
          })
        }
        updateNotes(notesByNumber)
        break
      default:
        return
    }
  })
})

function updateNotes(notes) {
  $("#notes").empty()
  for (let i = 0; i < notes.length; i++) {
    let note = notes[i]
    addNoteToRow(note,"#notes")
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
  $cardTitle.append("<a target='_blank' href='http://drive.google.com/uc?export=view&id=1ds6--YvGLpnFWs4VoJWt0uigMubW6Jsd'>"
    + note.number + "</a>")
  $cardBody.append($cardTitle)
  $cardBody.append($cardSubTitle)
  $cardBody.append("<p class='card-text'>Taught in " + note.year + " " + note.term +
    "<br/>by " + instructors.slice(2) + "</p>")
  $cardBody.append("<p class='card-text'>Uploaded " + uploadTime +
    "<br/>by " + note.author + "</p>")
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

$("#sidebar-toggle").on('click', function() {
  $("#wrapper").toggleClass("toggled")
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

function updateNotes(notes,notesHidden) {
  $("#notes").empty()
  for (let i = 0; i < notes.length; i++) {
    let note = notes[i]
    addNoteToRow(note,"#notes")
    if (notesHidden.has(note.id)) {
      $("#"+note.id).hide()
    }
  }
}

function addNoteToRow(note,rowID) {
  let uploadTime = stringifyTime(note.upload_time)
  let instructors = ""
  for (let person of note.instructors) {
    instructors += ", " + person
  }
  let $wrapper = $("<div id='" + note.id + "' class='col-lg-3 col-md-4 col-sm-6 note-item'></div>")
  let $card = $("<div class='card h-100'></div>")
  let $cardBody = $("<div class='card-body'></div>")
  let $cardTitle = $("<h4 class='card-title'></h4>")
  let $cardSubTitle = $("<h5 class='card-subtitle '>"+note.title+"</h6>")
  $cardTitle.append("<a target='_blank' href=" + note.pdf_url + ">"
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

$(document).ready(function(){
  let notes = []
  $.getJSON("/api/notes/"+deptID,function(data){
    if (data === null) {
      console.log("No notes found")
      return
    }
    for (let noteID of Object.keys(data)) {
      notes.push(data[noteID])
    }
    for (let i = 0; i < notes.length; i++) {
      let note = notes[i]
      addNotesToRow(note,"#notes")
    }
  })
})

function addNotesToRow(note,rowID) {
  let uploadTime = stringifyTime(note.upload_time)
  let $wrapper = $("<div class='col-lg-3 col-md-4 col-sm-6 note-item'></div>")
  let $card = $("<div class='card h-100'></div>")
  let $cardBody = $("<div class='card-body'></div>")
  let $cardTitle = $("<h4 class='card-title'></h4>")
  $cardTitle.append("<a href='#'>"+note.number+"</a>")
  $cardBody.append($cardTitle)
  $cardBody.append("<p class='card-text'>"+note.title+"<br/>Taught in "+note.year+"<br/>Uploaded "+uploadTime+"<br/>By "+note.author+"</p>")
  $card.append("<img class='card-img-top' src='http://placehold.it/600x400' alt=''>")
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

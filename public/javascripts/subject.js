$(document).ready(function(){
  let notes = []
  $.getJSON("/api/notes/number/"+subjectID,function(data){
    if (data === null) {
      $("#notes").append("<p class='no-notes'>No notes available at this time. Check again later!</p>")
      return
    }
    for (let noteID of Object.keys(data)) {
      notes.push(data[noteID])
    }
    for (let i = 0; i < notes.length; i++) {
      let note = notes[i]
      addNoteToRow(note,"#notes")
    }
  })
})

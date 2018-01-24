$(document).ready(function(){
  let notes = []
  $.getJSON("/api/notes/number/"+subjectID,function(data){
    if (data === null) {
      $(".no-notes").show()
      $("#sidebar-toggle").prop('disabled',true)
      return
    }
    for (let noteID of Object.keys(data)) {
      let noteObj = data[noteID]
      noteObj.id = noteID
      notes.push(noteObj)
    }
    for (let i = 0; i < notes.length; i++) {
      let note = notes[i]
      addNoteToRow(note,"#notes")
    }
  })
})

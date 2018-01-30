const fetchLimit = 3
var fetching = false
var doneFetching = false
var lastFetched = -1
var fetchTarget = 0

$(document).ready(function(){
  $.getJSON("/api/notes/featured",function(data){
    let featuredNotes = []
    for (let noteID of Object.keys(data)) {
      let noteObj = data[noteID]
      noteObj.id = noteID
      featuredNotes.push(noteObj)
    }
    for (let i = 0; i < Math.min(4,featuredNotes.length); i++) {
      let note = featuredNotes[i]
      addNoteToRow(note,"#notes-featured",thisUserID)
    }
  })

  addDeptRows(0,fetchLimit)

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
          let noteObj = data[noteID]
          noteObj.id = noteID
          deptNotes.push(noteObj)
        }
        for (let i = 0; i < Math.min(4,deptNotes.length); i++) {
          let note = deptNotes[i]
          addNoteToRow(note,"#notes-"+deptID,thisUserID)
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

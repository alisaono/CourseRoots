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
              if (b.term === "Fall") return -1
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

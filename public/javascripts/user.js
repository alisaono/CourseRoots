$(document).ready(function(){
  let favoritesByTime = []
  let favoritesByPopularity = []
  let favoritesByYear = []
  let favoritesByNumber = []

  let uploadsByTime = []
  let uploadsByPopularity = []
  let uploadsByYear = []
  let uploadsByNumber = []

  $.getJSON("/api/users/"+userID,function(data){
    // Populate the name/kerbero field.
    let $header = $("<h1>" + data.name + "</h1>")
    $header.append("<small>(" + data.kerbero + ")</small>")
    $("#prof-info").append($header)

    // Populate the major field.
    let major = (data.major === "") ? "Unknown" : sanitize(data.major)
    let $majorRow = $("<div class='row'></div>")
    $majorRow.append("<p><b>Major: </b><span>" + major + "</span></p>")
    $("#prof-info").append($majorRow)

    // Populate the year field.
    let year = (data.year === "") ? "Unknown" : sanitize(data.year)
    let $yearRow = $("<div class='row'></div>")
    $yearRow.append("<p><b>Year: </b><span>" + year + "</span></p>")
    $("#prof-info").append($yearRow)

    // Populate the intro field.
    if (data.introduction !== "") {
      let $introRow = $("<div class='row'></div>")
      $introRow.append("<p><b>Year: </b><span>" + sanitize(data.introduction) + "</span></p>")
      $("#prof-info").append($introRow)
    }

    // Populate favorite notes.
    if (data.favorites === null) {
      $("#no-favs").show()
    } else {
      let favorites = data.favorites
      for (let noteID of Object.keys(favorites)) {
        let noteObj = favorites[noteID]
        noteObj.id = noteID
        favoritesByTime.push(noteObj)
      }
      favoritesByTime.sort(function compare(a,b) {
        if (a.upload_time < b.upload_time) return 1
        if (a.upload_time > b.upload_time) return -1
        return 0
      })
      updateNotes("#favorites",favoritesByTime,null,thisUserID)
    }

    // Populate uploaded notes.
    if (data.uploads === null) {
      $("#no-uploads").show()
    } else {
      let uploads = data.uploads
      for (let noteID of Object.keys(uploads)) {
        let noteObj = uploads[noteID]
        noteObj.id = noteID
        uploadsByTime.push(noteObj)
      }
      uploadsByTime.sort(function compare(a,b) {
        if (a.upload_time < b.upload_time) return 1
        if (a.upload_time > b.upload_time) return -1
        return 0
      })
      updateNotes("#uploads",uploadsByTime,null,thisUserID)
    }
  })

  $("#favorites-sort").change(function() {
    let sortOption = $(this).val()
    switch(sortOption) {
      case "upload_time":
        updateNotes("#favorites",favoritesByTime,null,thisUserID)
        break
      case "popularity":
        if (favoritesByPopularity.length !== favoritesByTime.length) {
          favoritesByPopularity = favoritesByTime.slice().sort(function compare(a,b) {
            if (a.popularity < b.popularity) return 1
            if (a.popularity > b.popularity) return -1
            return 0
          })
        }
        updateNotes("#favorites",favoritesByPopularity,null,thisUserID)
        break
      case "year":
        if (favoritesByYear.length !== favoritesByTime.length) {
          favoritesByYear = favoritesByTime.slice().sort(function compare(a,b) {
            if (a.year < b.year) return 1
            if (a.year > b.year) return -1
            if (a.term !== b.term) {
              if (a.term === "Spring") return 1
              if (b.term === "Fall") return -1
            }
            return 0
          })
        }
        updateNotes("#favorites",favoritesByYear,null,thisUserID)
        break
      case "number":
        if (favoritesByNumber.length !== favoritesByTime.length) {
          favoritesByNumber = favoritesByTime.slice().sort(function compare(a,b) {
            if (a.number > b.number) return 1
            if (a.number < b.number) return -1
            return 0
          })
        }
        updateNotes("#favorites",favoritesByNumber,null,thisUserID)
        break
      default:
        return
    }
  })

  $("#uploads-sort").change(function() {
    let sortOption = $(this).val()
    switch(sortOption) {
      case "upload_time":
        updateNotes("#uploads",uploadsByTime,null,thisUserID)
        break
      case "popularity":
        if (uploadsByPopularity.length !== uploadsByTime.length) {
          uploadsByPopularity = uploadsByTime.slice().sort(function compare(a,b) {
            if (a.popularity < b.popularity) return 1
            if (a.popularity > b.popularity) return -1
            return 0
          })
        }
        updateNotes("#uploads",uploadsByPopularity,null,thisUserID)
        break
      case "year":
        if (uploadsByYear.length !== uploadsByTime.length) {
          uploadsByYear = uploadsByTime.slice().sort(function compare(a,b) {
            if (a.year < b.year) return 1
            if (a.year > b.year) return -1
            if (a.term !== b.term) {
              if (a.term === "Spring") return 1
              if (b.term === "Fall") return -1
            }
            return 0
          })
        }
        updateNotes("#uploads",uploadsByYear,null,thisUserID)
        break
      case "number":
        if (uploadsByNumber.length !== uploadsByTime.length) {
          uploadsByNumber = uploadsByTime.slice().sort(function compare(a,b) {
            if (a.number > b.number) return 1
            if (a.number < b.number) return -1
            return 0
          })
        }
        updateNotes("#uploads",uploadsByNumber,null,thisUserID)
        break
      default:
        return
    }
  })
})

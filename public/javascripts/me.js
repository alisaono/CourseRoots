$(document).ready(function(){
  let favoritesByTime = []
  let favoritesByPopularity = []
  let favoritesByYear = []
  let favoritesByNumber = []

  let uploadsByTime = []
  let uploadsByPopularity = []
  let uploadsByYear = []
  let uploadsByNumber = []

  $.getJSON("/api/users/"+thisUserID,function(data){
    // Populate the major field.
    addProfField("major","What's your major?",75,"<b>Your Major: </b>")
    if (data.major === "") {
      $("#prof-major").hide()
      addProfInput("major","What's your major?",75)
    } else {
      $("#prof-major p span").text(data.major)
    }

    // Populate the year field.
    addProfField("year","What's your year?",75,"<b>Your Year: </b>")
    if (data.year === "") {
      $("#prof-year").hide()
      addProfInput("year","What's your year?",75)
    } else {
      $("#prof-year p span").text(data.year)
    }

    // Populate the intro field.
    addProfField("introduction","Tell us about yourself!",250,"")
    if (data.introduction === "") {
      $("#prof-introduction").hide()
      addProfInput("introduction","Tell us about yourself!",250)
    } else {
      $("#prof-introduction p span").text(data.introduction)
    }

    // Populate favorite notes.
    if (data.favorites === null) {
      $(".no-notes").show()
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
    if (data.uploads !== null) {
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
    addUploadCard()
  })

  $("#instructors-input .add-row .btn").on('click', function() {
    let $group = $("<div class='input-group new-row'></div>")
    let $input = $("<input type='text' class='form-control' name='instructor' placeholder='Tim Beaver'>")
    let $span = $("<span class='input-group-btn'></span>")

    let $btn = $("<button type='btn' class='btn btn-default remove-row'>x</button>")
    $btn.on('click', function() {
      $group.remove()
    })

    $span.append($btn)
    $group.append($input)
    $group.append($span)
    $("#instructors-input .add-row").before($group)
  })

  $("#upload-btn").on('click', function() {
    let pdfURL = ""

    let title = $("#title-input").val()
    if (title === "") {
      alert("Please enter the title!")
      return
    }

    let dept = $("#dept-input").val()

    let lowerDigits = $("#number-input").val().toUpperCase()
    if (lowerDigits === "") {
      alert("Please complete the subject number!")
      return
    }
    if (lowerDigits.match(/[^A-Z0-9]/g)) {
      alert("Subject number should only contain letters and/or numbers!")
      return
    }
    let number = dept + "." + lowerDigits

    let yearStr = $("#year-input").val()
    if (yearStr === "") {
      alert("Please enter the year!")
      return
    }
    let yearRegex = RegExp('^[0-9]{4}$')
    if (!yearRegex.test(yearStr)) {
      alert("Year should be a 4-digit number!")
      return
    }
    let year = parseInt(yearStr)

    let term = $("#term-input").val()

    let lecStr = $("#lec-input").val()
    if (lecStr.match(/[^0-9]/g)) {
      alert("Lecture number should only contain numbers!")
      return
    }
    let lec = (lecStr !== "") ? parseInt(lecStr) : -1

    let instructors = []
    $("#instructors-input input").each(function(i) {
      if ($(this).val() !== "") {
        instructors.push($(this).val())
      }
    })

    let newNote = {
      pdf_url: pdfURL,
      title: title,
      dept: dept,
      number: number,
      year: year,
      term: term,
      lec: lec,
      instructors: instructors,
    }
    $.ajax({
      url: '/api/upload',
      method: 'POST',
      data: {note : JSON.stringify(newNote)},
    }).done(function(response){
      if (response !== "") {
        alert("Error occurred :( Try again...")
      }
      location.reload()
    })
  })

  $("#upload-modal").on('hidden.bs.modal', function (e) {
    $("#pdf-input").fileinput('clear')
    $("#upload-modal input[type='text']").val('')
    $("#instructors-input .new-row").remove()
    $("#dept-input").val("6")
    $("#term-input").val("IAP")
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
            return compareSubjects(a,b)
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
        addUploadCard()
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
        addUploadCard()
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
        addUploadCard()
        break
      case "number":
        if (uploadsByNumber.length !== uploadsByTime.length) {
          uploadsByNumber = uploadsByTime.slice().sort(function compare(a,b) {
            return compareSubjects(a,b)
          })
        }
        updateNotes("#uploads",uploadsByNumber,null,thisUserID)
        addUploadCard()
        break
      default:
        return
    }
  })
})

function addProfField(name,placeholder,limit,prefix) {
  let $row = $("<div id='prof-" + name + "' class='row'></div>")
  let $icon = $("<img class='edit-icon' src='/images/edit-pencil.png'>")
  let $text = $("<p>" + prefix + "<span></span></p>")
  $row.append($icon)
  $row.append($text)

  $icon.on('click', function() {
    $("#prof-modal-label span").text(name.charAt(0).toUpperCase() + name.slice(1))
    $("#new-prof-input").prop('placeholder',placeholder)
    $("#new-prof-input").prop('maxlength',limit)
    $("#new-prof-input").val($("#prof-" + name + " p span").text())

    $("#new-prof-input").on('input', function() {
      if ($(this).val() !== "") {
        $("#prof-modal .btn-primary").prop('disabled',false)
      } else {
        $("#prof-modal .btn-primary").prop('disabled',true)
      }
    })
    $("#prof-modal .btn-primary").on('click', function(e) {
      e.preventDefault()
      let data = {}
      let input = $("#new-prof-input").val()
      data[name] = input
      $.ajax({
        url: '/api/me/update',
        method: 'POST',
        data: data,
      }).done(function(response){
        if (response === "") {
          $("#prof-"+name+" span").text(input)
          $('#prof-modal').modal('hide')
        } else {
          alert("Error occurred :( Try again...")
          location.reload()
        }
      })
    })
    $("#prof-modal").on('hidden.bs.modal', function (e) {
      $("#prof-modal .btn-primary").off('click')
    })

    $("#prof-modal").modal()
  })

  $("#prof-info").append($row)
}

function addProfInput(name,placeholder,limit) {
  let $inputGroup = $("<div id='add-" + name + "-group' class='input-group'></div>")
  let $input = $("<input type='text' id='add-" + name + "-input' class='form-control' name='"
    + name + "' maxlength='" + limit + "'>")
  $input.prop('placeholder',placeholder)
  let $btnSpan = $("<span class='input-group-btn'></span>")
  let $btn = $("<button type='btn' class='btn btn-primary' id='add-"+ name + "-btn' disabled>Save</button>")
  $btnSpan.append($btn)
  $inputGroup.append($input)
  $inputGroup.append($btnSpan)

  $input.on('input', function() {
    if ($(this).val() !== "") {
      $btn.prop('disabled',false)
    } else {
      $btn.prop('disabled',true)
    }
  })
  $btn.on('click', function(e) {
    e.preventDefault()
    let data = {}
    let input = $input.val()
    data[name] = input
    $.ajax({
      url: '/api/me/update',
      method: 'POST',
      data: data,
    }).done(function(response){
      if (response === "") {
        $("#add-"+name+"-group").remove()
        $("#prof-"+name+" span").text(input)
        $("#prof-"+name).show()
      } else {
        alert("Error occurred :( Try again...")
        location.reload()
      }
    })
  })

  $("#prof-info").append($inputGroup)
}

function addUploadCard() {
  let $wrapper = $("<div id='upload-card' class='col-lg-3 col-md-4 col-sm-6 note-item'></div>")
  let $card = $("<div class='card h-100'></div>")
  let $cardTitle = $("<h4 class='card-title'>Add New Note</h4>")
  let $cardBody = $("<div class='card-body'></div>")
  $cardBody.append($cardTitle)
  $card.append($cardBody)
  $wrapper.append($card)
  $wrapper.on('click', function(){
    $("#upload-modal").modal()
  })
  $("#uploads").prepend($wrapper)
}

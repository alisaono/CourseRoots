const checkboxLimit = 5

$(document).ready(function(){
  let notesByTime = []
  let notesByPopularity = []
  let notesByYear = []
  let notesByNumber = []

  let notesTaughtBy = {}
  let notesUploadBy = {}
  let numInstructors = 0
  let numUsers = 0

  let notesHidden = new Set()

  $.getJSON("/api/notes/"+deptID,function(data){
    if (data === null) {
      $(".no-notes").show()
      $("#sidebar-toggle").prop('disabled',true)
      return
    }
    for (let noteID of Object.keys(data)) {
      let noteObj = data[noteID]
      noteObj.id = noteID
      notesByTime.push(noteObj)

      for (let instructor of noteObj.instructors) {
        if (instructor in notesTaughtBy) {
          notesTaughtBy[instructor].push(noteID)
        } else {
          numInstructors += 1
          notesTaughtBy[instructor] = [noteID]
          addCheckbox(instructor,"taught-by",(numInstructors > checkboxLimit))
        }
      }

      if (noteObj.author in notesUploadBy) {
        notesUploadBy[noteObj.author].push(noteID)
      } else {
        numUsers += 1
        notesUploadBy[noteObj.author] = [noteID]
        addCheckbox(noteObj.author,"upload-by",(numUsers > checkboxLimit))
      }
    }

    if (numInstructors > checkboxLimit) {
      addCheckboxToggle("taught-by")
    }
    if (numUsers > checkboxLimit) {
      addCheckboxToggle("upload-by")
    }

    notesByTime.sort(function compare(a,b) {
      if (a.upload_time < b.upload_time) return 1
      if (a.upload_time > b.upload_time) return -1
      return 0
    })
    updateNotes(notesByTime,notesHidden)
  })

  $("#sort").change(function() {
    let sortOption = $(this).val()
    switch(sortOption) {
      case "upload_time":
        updateNotes(notesByTime,notesHidden)
        break
      case "popularity":
        if (notesByPopularity.length !== notesByTime.length) {
          notesByPopularity = notesByTime.slice().sort(function compare(a,b) {
            if (a.popularity < b.popularity) return 1
            if (a.popularity > b.popularity) return -1
            return 0
          })
        }
        updateNotes(notesByPopularity,notesHidden)
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
        updateNotes(notesByYear,notesHidden)
        break
      case "number":
        if (notesByNumber.length !== notesByTime.length) {
          notesByNumber = notesByTime.slice().sort(function compare(a,b) {
            if (a.number > b.number) return 1
            if (a.number < b.number) return -1
            return 0
          })
        }
        updateNotes(notesByNumber,notesHidden)
        break
      default:
        return
    }
  })

  $("#apply-filter").on('click', function() {
    let yearRegex = RegExp('^[0-9]{4}$')
    if ($("#year-min").val() !== "" && !yearRegex.test($("#year-min").val())) {
      $('#input-warning .modal-body').text("Year should be a 4-digit number!")
      $('#input-warning').modal()
      return
    }
    if ($("#year-max").val() !== "" && !yearRegex.test($("#year-max").val())) {
      $('#input-warning .modal-body').text("Year should be a 4-digit number!")
      $('#input-warning').modal()
      return
    }

    let yearMin = parseInt($("#year-min").val())
    let yearMax = parseInt($("#year-max").val())
    if (yearMin > yearMax) {
      $('#input-warning .modal-body').text("Start year should be the same or before the end year!")
      $('#input-warning').modal()
      return
    }

    notesHidden.clear()
    $(".no-notes").hide()
    $(".note-item").show()

    if ($("#year-min").val() !== "" && $("#year-max").val() !== "") {
      for (let note of notesByTime) {
        if (note.year < yearMin || note.year > yearMax) {
          $("#"+note.id).hide()
          notesHidden.add(note.id)
        }
      }
    } else if ($("#year-min").val() !== "") {
      for (let note of notesByTime) {
        if (note.year < yearMin) {
          $("#"+note.id).hide()
          notesHidden.add(note.id)
        }
      }
    } else if ($("#year-max").val() !== "") {
      for (let note of notesByTime) {
        if (note.year > yearMax) {
          $("#"+note.id).hide()
          notesHidden.add(note.id)
        }
      }
    }

    if ($("#term").val() !== "Any") {
      for (let note of notesByTime) {
        if (note.term !== $("#term").val()) {
          $("#"+note.id).hide()
          notesHidden.add(note.id)
        }
      }
    }

    if ($("#term").val() !== "Any") {
      for (let note of notesByTime) {
        if (note.term !== $("#term").val()) {
          $("#"+note.id).hide()
          notesHidden.add(note.id)
        }
      }
    }

    $("#taught-by input:checkbox:not(:checked)").each(function() {
      for (let noteID of notesTaughtBy[$(this).val()]) {
        $("#"+noteID).hide()
        notesHidden.add(noteID)
      }
    })

    $("#upload-by input:checkbox:not(:checked)").each(function() {
      for (let noteID of notesUploadBy[$(this).val()]) {
        $("#"+noteID).hide()
        notesHidden.add(noteID)
      }
    })

    if ($(".note-item:visible").length === 0) {
      $(".no-notes").show()
    }
  })
})

function addCheckbox(value,group,hidden) {
  let $checkItem = $("<div class='form-check'></div>")
  let $checkbox = $("<input class='form-check-input' type='checkbox' value='" + value
    + "' id='" + value + "' checked='checked'>")
  let $checkLabel = $("<label class='form-check-label' for='" + value + "'>"
    + value + "</label>")

  $checkItem.append($checkbox)
  $checkItem.append($checkLabel)
  $("#"+group).append($checkItem)

  if (hidden) {
    $checkItem.addClass("check-toggle")
    $checkItem.hide()
  }
}

function addCheckboxToggle(group) {
  let $toggleBtn = $("<span class='checkbox-more'>See more</span>")
  $("#"+group).append($toggleBtn)
  $toggleBtn.on('click', function() {
    if ($toggleBtn.text() === "See more") {
      $toggleBtn.text("Hide")
    } else {
      $toggleBtn.text("See more")
    }
    $("#"+group+" .check-toggle").toggle()
  })
}

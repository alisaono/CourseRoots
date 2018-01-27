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
    $('#input-warning .modal-body').text("Subject number should contain a single period between numbers and/or letters!")
    $('#input-warning').modal()
  }
})

function updateNotes(rowID,notes,notesHidden,thisUserID) {
  $(rowID).empty()
  for (let i = 0; i < notes.length; i++) {
    let note = notes[i]
    addNoteToRow(note,rowID,thisUserID)
    if (notesHidden !== null && notesHidden.has(note.id)) {
      $("#"+note.id).hide()
    }
  }
}

function addNoteToRow(note,rowID,thisUserID) {
  let uploadTime = stringifyTime(note.upload_time)
  let instructors = ""
  for (let person of note.instructors) {
    instructors += ", " + person
  }
  let $wrapper = $("<div id='" + note.id + "' class='col-lg-3 col-md-4 col-sm-6 note-item'></div>")
  let $card = $("<div class='card h-100'></div>")
  let $cardBody = $("<div class='card-body'></div>")
  let $cardTitle = $("<h4 class='card-title'></h4>")
  let $cardSubTitle = $("<h5 class='card-subtitle '>" + sanitize(note.title) + "</h6>")

  let $favCount = $("<span class='fav-count'>" + note.popularity + "</span>")
  let $favIcon = $("<img class='fav-icon'>")
  if (note.usersLiked && thisUserID in note.usersLiked) {
    $favIcon.attr('src',"/images/heart-dark.png")
    $favIcon.addClass('liked')
  } else {
    $favIcon.attr('src',"/images/heart-light.png")
  }
  $favIcon.on('click', function() {
    if ($favIcon.hasClass('liked')) {
      let currCount = parseInt($favCount.text())
      let newCount = currCount - 1
      $.ajax({
        url: '/api/me/unlike',
        method: 'POST',
        data: note,
      }).done(function(response){
        if (response === "") {
          $favCount.text(newCount.toString())
          $favIcon.attr('src',"/images/heart-light.png")
          $favIcon.removeClass('liked')
        } else {
          alert("Error occurred :( Try again...")
        }
      })
    } else {
      let currCount = parseInt($favCount.text())
      let newCount = currCount + 1
      $.ajax({
        url: '/api/me/like',
        method: 'POST',
        data: note,
      }).done(function(response){
        if (response === "") {
          $favCount.text(newCount.toString())
          $favIcon.attr('src',"/images/heart-dark.png")
          $favIcon.addClass('liked')
        } else {
          alert("Error occurred :( Try again...")
        }
      })
    }
  })

  $cardTitle.append("<a target='_blank' href=" + note.pdf_url + ">"
    + note.number + "</a>")
  $cardTitle.append($favIcon)
  $cardTitle.append($favCount)
  $cardBody.append($cardTitle)
  $cardBody.append($cardSubTitle)
  $cardBody.append("<p class='card-text'>Taught in " + note.year + " " + note.term +
    "<br/>by " + sanitize(instructors.slice(2)) + "</p>")
  $cardBody.append("<p class='card-text'>Uploaded " + uploadTime +
    "<br/>by <a href='/users/" + note.authorID + "'>" + note.author + "</a></p>")
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

function sanitize(string) {
  return string.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

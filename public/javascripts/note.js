var __PDF_DOC,
    __CURRENT_PAGE,
    __TOTAL_PAGES,
    __ANNOTATIONS = [],
    __PAGE_RENDERING_IN_PROGRESS = 0,
    __PDF_CANVAS = $('#pdf-canvas').get(0);
    __CANVAS = $('#annotation-layer').get(0),
    __CANVAS_CTX = __CANVAS.getContext('2d');

PDFJS.disableworker = true;
// URL of PDF document
var url = "https://s3.amazonaws.com/sinusoidalsuite-courseroots/" + pdfID;
showPDF(url);

  // Initialize and load the PDF
function showPDF(pdf_url) {
    // Show the pdf loader
    $("#pdf-loader").show();

    PDFJS.getDocument({ url: pdf_url }).then(function(pdf_doc) {
        __PDF_DOC = pdf_doc;
        __TOTAL_PAGES = __PDF_DOC.numPages;
        
        // Hide the pdf loader and show pdf container in HTML
        $("#pdf-loader").hide();
        $("#pdf-contents").show();
        $("#pdf-total-pages").text(__TOTAL_PAGES);

        // Show the first page
        showPage(1);
    }).catch(function(error) {
        // If error re-show the upload button
        $("#pdf-loader").hide();
        alert(error.message);
    });;
}

// Load and render a specific page of the PDF
function showPage(page_no) {
    __PAGE_RENDERING_IN_PROGRESS = 1;
    __CURRENT_PAGE = page_no;

    // Disable Prev & Next buttons while page is being loaded
    $("#pdf-next, #pdf-prev").attr('disabled', 'disabled');

    // While page is being rendered hide the canvas and show a loading message
    $("#pdf-canvas").hide();
    $("#page-loader").show();

    // Update current page in HTML
    document.getElementById("pdf-current-page").value = page_no;

    // Fetch the page
    __PDF_DOC.getPage(page_no).then(function(page) {
        // As the canvas is of a fixed width we need to set the scale of the viewport accordingly
        // not needed?
        var scale_required = __PDF_CANVAS.width / page.getViewport(1).width;

        // Get viewport of the page at required scale
        var viewport = page.getViewport(3);
        // Set canvas height
        __PDF_CANVAS.width = viewport.width;
        __CANVAS.width = viewport.width;
        __PDF_CANVAS.height = viewport.height;
        __CANVAS.height = viewport.height;

        var renderContext = {
            canvasContext: __PDF_CANVAS.getContext('2d'),
            viewport: viewport
        };
        
        // Render the page contents in the canvas
        page.render(renderContext).then(function() {
            __PAGE_RENDERING_IN_PROGRESS = 0;

            // Re-enable Prev & Next buttons
            if (__CURRENT_PAGE > 1) {
                $("#pdf-prev").removeAttr('disabled');
            }

            if (__CURRENT_PAGE < __TOTAL_PAGES) {
                $("#pdf-next").removeAttr('disabled');
            }

            // Show the canvas and hide the page loader
            $("#pdf-canvas").show();
            $("#page-loader").hide();

            drawAnnotationLayer(page_no);
            var rect = __CANVAS.getBoundingClientRect();

            $("#comment-bar").empty();

            $.getJSON("/api/notes/" + deptID + "/" + noteID,function(data){
                let annotations = data.annotations;
                for (a in annotations) {
                    if(annotations[String(a)] !== null && annotations[String(a)].page == __CURRENT_PAGE) {
                        var content = annotations[String(a)].content;
                        var user = annotations[String(a)].user;
                        if (user == username) {
                            var funcName = "deleteAnnotation('" + String(a) + "')";
                            $("#comment-bar").append("<div id='" + String(a) + "' class='fade-in' style='color: white; background-color: #a3d852; border-radius:10px; margin-bottom: 5px; padding: 10px'><h3>" 
                                + user + "</h3><p>" + content + "</p>"
                                + "<button id='delete' onclick=" + funcName + ">Delete</button></div>");                            
                        } else {
                            $("#comment-bar").append("<div id='" + String(a) + "' class='fade-in' style='color: white; background-color: #a3d852; border-radius:10px; margin-bottom: 5px; padding: 10px'><h3>" 
                                + user + "</h3><p>" + content + "</p></div>");
                        }
                        __ANNOTATIONS.push({id: String(a), x: annotations[String(a)].x_coords, y: annotations[String(a)].y_coords});
                    }
                }
            });
        });
    });
}

// Previous page of the PDF
$("#pdf-prev").on('click', function() {
    if(__CURRENT_PAGE != 1)
        showPage(--__CURRENT_PAGE);
});

// Next page of the PDF
$("#pdf-next").on('click', function() {
    if(__CURRENT_PAGE != __TOTAL_PAGES)
        showPage(++__CURRENT_PAGE);
});

// Navigation to a specified page
document.getElementById("pdf-current-page").addEventListener("input", function(evt){
    showPage(Number(this.value));
});

document.onkeydown = checkKey;

function checkKey(evt) {
    evt = evt || window.event;

    if (evt.keyCode == '37') {
        if(__CURRENT_PAGE != 1)
            showPage(--__CURRENT_PAGE);
    }
    else if (evt.keyCode == '39') {
        if(__CURRENT_PAGE != __TOTAL_PAGES)
            showPage(++__CURRENT_PAGE);
    }
}

var highlighted_annotation_id;

// Click to add annotation (potentially prevent overlapping pins?)
$("#annotation-layer").on('click', function(evt) {
    annotation_coords = getMousePos(__CANVAS, evt);
    console.log(annotation_coords);
    annotation_page = __CURRENT_PAGE;
    var overlap = false;

    if (!(highlighted_annotation_id == null)) {
        document.getElementById(highlighted_annotation_id).style.backgroundColor = "#a3d852";
    }

    for (a in __ANNOTATIONS) {
        const circle = {
            x: __ANNOTATIONS[a]["x"],
            y: __ANNOTATIONS[a]["y"],
            radius: 10
        };

        if (isIntersect(annotation_coords, circle)) {
            overlap = true;
            highlighted_annotation_id = __ANNOTATIONS[a]["id"];
            break;
        }
    }

    if (overlap == false) {
        var content = prompt('Please enter your annotation: ');
        if (content == null || content == "") {
            alert('Cancelled');
        } else {
            addAnnotation(annotation_coords["x"], annotation_coords["y"], annotation_page, content);
        }
    } else {
        document.getElementById(highlighted_annotation_id).style.backgroundColor = "#5cb85c";
    }
});

// Toggle annotation layer on/off
$('#annotation-layer-checkbox').change(function(){
    if($(this).is(':checked')) {
        $("#annotation-layer").show();
        $("#comment-bar").show();
    } else {
        $("#annotation-layer").hide();
        $("#comment-bar").hide();
    }
});

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

// draw annotation pins on layer
function drawAnnotationLayer(page_no) {
    $.getJSON("/api/notes/" + deptID + "/" + noteID,function(data){
        let annotations = data.annotations;
        for (a in annotations) {
            if(annotations[String(a)] !== null && annotations[String(a)].page == __CURRENT_PAGE) {
                var centerX = annotations[String(a)].x_coords;
                var centerY = annotations[String(a)].y_coords;
                var rect = __CANVAS.getBoundingClientRect();
                var scaleFactor = 2.192;

                __CANVAS_CTX.beginPath();
                __CANVAS_CTX.arc(centerX*scaleFactor, centerY*scaleFactor, 10, 0, 2 * Math.PI, false);
                __CANVAS_CTX.fillStyle = 'green';
                __CANVAS_CTX.fill();
                __CANVAS_CTX.lineWidth = 5;
                __CANVAS_CTX.strokeStyle = '#003300';
                __CANVAS_CTX.stroke();

            }
        }
    });
}

// update Firebase with annotation data
function addAnnotation(x_coord, y_coord, page, content) {
    var new_annotation = {
      content: content,
      page: __CURRENT_PAGE,
      user: '',
      x_coords: x_coord,
      y_coords: y_coord,
      deptID: deptID,
      noteID: noteID
    };

    $.ajax({
        url: '/api/annotate',
        method: 'POST',
        data: new_annotation,
    }).done(function(response){
        if (response === "") {
            alert("Annotation added :)")
        } else {
            alert("Error occurred :( Try again...")
        }
    })
    showPage(__CURRENT_PAGE);
}

function editAnnotation(id) {
    var edit_annotation = {
        content: content,
        annotationID: id,
        deptID: deptID,
        noteID: noteID
    };

    $.ajax({
        url: '/api/annotate/edit',
        method: 'POST',
        data: edit_annotation,
    }).done(function(response){
        if (response === "") {
            alert("Annotation edited :)")
        } else {
            alert("Error occurred :( Try again...")
        }
    })
    showPage(__CURRENT_PAGE);
}

function deleteAnnotation(id) {
    let deleted_annotation = {
        annotationID: id,
        deptID: deptID,
        noteID: noteID
    }

    $.ajax({
        url: '/api/annotate/delete',
        method: 'POST',
        data: deleted_annotation,
    }).done(function(response){
        if (response === "") {
            alert("Annotation deleted")
        } else {
            alert("Error occurred :( Try again...")
        }
    })
    showPage(__CURRENT_PAGE);
}

function isIntersect(point, circle) {
  return Math.sqrt((point.x-circle.x) ** 2 + (point.y - circle.y) ** 2) < circle.radius;
}
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
// var url = "https://s3.amazonaws.com/sinusoidalsuite-courseroots/18.06_1.pdf";
// var url = pdf_url;
showPDF(url);

//TODO: add comment bar that shows up with annotation layer - blocks for individual annotations and hovering over marker should go to specific comment
//TODO: add star checkbox (similar to show/hide annotation toggle) to add popularity to document - first figure out how to push data to firebase

/*
// change to annotations
__CANVAS.addEventListener('hover', (e) => {
  const pos = {
    x: e.clientX,
    y: e.clientY
  };
  circles.forEach(circle => {
    if (isIntersect(mousePoint, circle)) {
      alert('click on circle: ' + circle.id);
    }
  });
});

function isIntersect(point, circle) {
  return Math.sqrt((point.x-circle.x) ** 2 + (point.y - circle.y) ** 2) < circle.radius;
}*/
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

        var url_array = document.URL.split('/');
        var url_key = url_array[url_array.length-1]; // document ID
        dept_no = url_array[url_array.length-2]; // department number

        // var config = {};
        // firebase.initializeApp(config);

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
            $("#pdf-next, #pdf-prev").removeAttr('disabled');

            // Show the canvas and hide the page loader
            $("#pdf-canvas").show();
            $("#page-loader").hide();

            drawAnnotationLayer(page_no);
            /*
            __CANVAS.addEventListener('hover', (e) => {
                const pos = {
                    x: e.clientX,
                    y: e.clientY
                };

                const circle = {
                    x: centerX,
                    y: centerY,
                    radius: 10
                };

                if (isIntersect(mousePoint, circle)) {
                    alert('click on circle: ');
                }  
            });*/
            // console.log(__ANNOTATIONS);
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

$("#annotation-layer").on('click', function(evt) {
    annotation_coords = getMousePos(__CANVAS, evt);
    annotation_page = __CURRENT_PAGE;
    var content = prompt('Please enter your annotation: ');
    if (content == null || content == "") {
        alert('Cancelled');
    } else {
        addAnnotation(annotation_coords[0], annotation_coords[1], annotation_page, content);
    }
});

$('#annotation-layer-checkbox').change(function(){
    if($(this).is(':checked')) {
        showAnnotations();
    } else {
        hideAnnotations();
    }
});

$('#favorite-control').on('click', function(evt) {
    // TODO: modify firebase popularity field and user favorites field
    if(document.getElementById('favorite-control').innerHTML == '<i id="star" class="material-icons">star</i>') {
        document.getElementById('favorite-control').innerHTML = '<i class="material-icons">star_border</i>';
    } else {
        document.getElementById('favorite-control').innerHTML = '<i id="star" class="material-icons">star</i>';
    }
});

document.getElementById("pdf-current-page").addEventListener("input", function(evt){
    showPage(Number(this.value));
});

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}

function drawAnnotationLayer(page_no) {
    $.getJSON("/api/notes/" + deptID + "/" + noteID,function(data){
        let annotations = data.annotations;
        for (a in annotations) {
            if(annotations[String(a)] !== null && annotations[String(a)].page == __CURRENT_PAGE) {
                var centerX = annotations[String(a)].x_coords;
                var centerY = annotations[String(a)].y_coords;

                __CANVAS_CTX.beginPath();
                __CANVAS_CTX.arc(centerX, centerY, 10, 0, 2 * Math.PI, false);
                __CANVAS_CTX.fillStyle = 'green';
                __CANVAS_CTX.fill();
                __CANVAS_CTX.lineWidth = 5;
                __CANVAS_CTX.strokeStyle = '#003300';
                __CANVAS_CTX.stroke();

                //TODO: figure out why annotations updates one slide late
                __ANNOTATIONS.push(String(a));
            }
        }
    });
}

function showAnnotations() {
    $("#annotation-layer").show();
}

function hideAnnotations() {
    $("#annotation-layer").hide();
}

// TODO: update firebase with annotation data
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

    console.log(new_annotation)

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
}

function isIntersect(point, circle) {
  return Math.sqrt((point.x-circle.x) ** 2 + (point.y - circle.y) ** 2) < circle.radius;
}
var onlineMapping = false; // value is set by function initializeMap
if(!String.prototype.trim) {
  String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/, '')
  };
}
var map;
var drawingManager;
var capCircle = null;
var newCircle = null;
var circleCenterAndRadius;
var circleCenter;
var circleCenterLat;
var circleCenterLng;
var circleRadiusMeters;
var circleRadiusKilometers;
var capPolygon = null;
var polygonPathArray = [];
var polygonVertexLat;
var polygonVertexLng;

function verifyCircle(circleLatLngRadius) {
  // This function is used when the form text defines a capCircle
  // First we verify text values for the center lat,lng and for the radius
  circleCenterAndRadius = circleLatLngRadius.trim().split(" ");
  if(circleCenterAndRadius.length !== 2) { 
    alert("Error in checking circle: must have 'lat,lng' center and a radius, "+
        "with a space between: " + circleLatLngRadius);
    return(circleLatLngRadius);
  }
  circleCenter = circleCenterAndRadius[0];
  circleCenterLatLng = circleCenter.split(",");
  if(circleCenterLatLng.length !== 2) { 
    alert("Error in checking circle: 'lat,lng' center must have latitude and longitude "+
        " with a comma between: " + circleLatLngRadius);
    return(circleLatLngRadius);
  }
  if(isNaN(circleCenterLatLng[0])) { 
    alert("Error in checking circle: center latitude is not numeric: " + circleLatLngRadius);
    return(circleLatLngRadius);
  }
  if(isNaN(circleCenterLatLng[1])) { 
    alert("Error in checking circle: center longitude is not numeric: " + circleLatLngRadius);
    return(circleLatLngRadius);
  }
  circleCenterLat = parseFloat(circleCenterLatLng[0]);
  if(circleCenterLat < -90 || circleCenterLat > 90) { 
    alert("Error in checking circle: center latitude is out of range (-90 to 90): " + circleLatLngRadius);
    return(circleLatLngRadius);
  }
  circleCenterLng = parseFloat(circleCenterLatLng[1]);
  if(circleCenterLng < -180 || circleCenterLng > 180) { 
    alert("Error in checking circle: center longitude is out of range (-180 to 180): " + circleLatLngRadius);
    return(circleLatLngRadius);
  }
  if(isNaN(circleCenterAndRadius[1])) { 
    alert("Error in checking circle: radius is not numeric: " + circleLatLngRadius);
    return(circleLatLngRadius);
  }
    if(circleCenterAndRadius[1] < 0) { 
    alert("Error in checking circle: radius cannot be negative: " + circleLatLngRadius);
      return(circleLatLngRadius);
  }
  // Then we convert the radius from kilometers to meters
  circleRadiusKilometers = parseFloat(circleCenterAndRadius[1]);
  // Next we fix the precision of text values for the lat,lng and radius.
    // (Each degree of latitude is approximately 111 kilometers.)
    if(circleRadiusKilometers < .1) { 
      circleCenterLat = fixPrecision(circleCenterLat,5);
      circleCenterLng = fixPrecision(circleCenterLng,5);
      circleRadiusKilometers = fixPrecision(circleRadiusKilometers,3);
    } else if(circleRadiusKilometers < 1) { 
    circleCenterLat = fixPrecision(circleCenterLat,4);
      circleCenterLng = fixPrecision(circleCenterLng,4);
      circleRadiusKilometers = fixPrecision(circleRadiusKilometers,2);
    } else if(circleRadiusKilometers < 11) { 
    circleCenterLat = fixPrecision(circleCenterLat,3);
      circleCenterLng = fixPrecision(circleCenterLng,3);
      circleRadiusKilometers = fixPrecision(circleRadiusKilometers,1);
     } else if(circleRadiusKilometers < 111) { 
    circleCenterLat = fixPrecision(circleCenterLat,2);
      circleCenterLng = fixPrecision(circleCenterLng,2);
      circleRadiusKilometers = fixPrecision(circleRadiusKilometers,0);
    } else if(circleRadiusKilometers < 1111) { 
    circleCenterLat = fixPrecision(circleCenterLat,1);
      circleCenterLng = fixPrecision(circleCenterLng,1);
      circleRadiusKilometers = fixPrecision(circleRadiusKilometers,0);
  } else { 
    circleCenterLat = fixPrecision(circleCenterLat,0);
    circleCenterLng = fixPrecision(circleCenterLng,0);
    circleRadiusKilometers = fixPrecision(circleRadiusKilometers,0);
  }
  // Finally, return the center and radius with correct precision
  return(circleCenterLat+","+circleCenterLng+" "+circleRadiusKilometers);
}

function updateFormCircle(newCircle) {
  // Update form values for circle center and radius
  circleCenterLat = newCircle.getCenter().lat();
  circleCenterLng = newCircle.getCenter().lng();
  circleRadiusKilometers = newCircle.getRadius()/1000;
  document.capForm.capCircle.value = verifyCircle(circleCenterLat+","+circleCenterLng+" "+circleRadiusKilometers);
  document.capForm.capCircle.onchange();
}    

function drawCapCircle() {
    if (!onlineMapping) {
      return;
    }
    // Delete current capCircle if it exists
    deleteDrawnCircle();
    // Create and draw the new capCircle
    circleCenterLatLng = new google.maps.LatLng(circleCenterLat, circleCenterLng);
    circleRadiusMeters = circleRadiusKilometers * 1000;
    capCircle = new google.maps.Circle({
    fillColor: "#FF0000",
    fillOpacity: 0.1,
    strokeColor: "#F33F00",
    strokeOpacity: 0.8,
    strokeWeight: 2,
    map: map,
        clickable: true,
    editable: true,
    center: circleCenterLatLng,
    radius: circleRadiusMeters
  });
  // set event triggers for the circle center or radius being changed
  google.maps.event.addListener(capCircle, 'center_changed', function () {
    updateFormCircle(capCircle);
  });
  google.maps.event.addListener(capCircle, 'radius_changed', function () {
    updateFormCircle(capCircle);
  });
  // Disable drawing until client clicks draw button
  if(drawingManager.getMap()) {
        drawingManager.setMap(null);
  }
}

function deleteCapCircle() {
  if (!onlineMapping) {
    return;
  }
  deleteDrawnCircle();
}

function deleteDrawnCircle() {
  if(capCircle != null) {
    capCircle.setMap(null);
    capCircle = null;
  };
}

function verifyPolygon(polygonPath) {
  // This function works with the form text capPolygon.
  polygonPathArray = stringToArrayPolygon(polygonPath);
  var lastVertex = polygonPathArray.length - 1;
  // Assure that the last point is a repeat of the first
  if ((polygonPathArray[lastVertex].lat() != polygonPathArray[0].lat()) ||
     (polygonPathArray[lastVertex].lng() != polygonPathArray[0].lng())) {
    polygonPathArray.push(new google.maps.LatLng(polygonPathArray[0].lat(),polygonPathArray[0].lng()));
  }
  if (polygonPathArray.length < 3) {
    alert("Polygon is not valid because it has less than three points.");
    return(polygonPathArray);
  }
  // Assure that the winding order is counter-clockwise (polygon area is negative)
  // as per the Simple Feature Access standard (ISO 19125-1): A Polygon [...]  
  // exterior boundary appears to traverse the boundary in a counter clockwise direction.
  if (google.maps.geometry.spherical.computeSignedArea(polygonPathArray) < 0) {
    alert("Vertex order changed to counter-clockwise.");
    polygonPathArray = polygonPathArray.reverse();
  }
  drawCapPolygon();
  // Set precision of coordinates for each point in the polygon, 
  // based on the least span in degrees for latitude or longitude
  var leastSpan = capPolygonLeastSpan(); 
  var polygonPathPrecise = "";
  for (key in polygonPathArray) {
    polygonPathPrecise += " " + preciseCoordinates(polygonPathArray[key],leastSpan);
  }
  polygonPathPrecise = polygonPathPrecise.trim();
  // Finally, return the center and radius with correct precision
  polygonPathArray = stringToArrayPolygon(polygonPath);
  return(polygonPathPrecise);
}

function capPolygonLeastSpan () {
    var paths = capPolygon.getPath();
    // To determine the northernmost and southernmost latitudes, we just
    // need to look for the largest and smallest latitude values.
  var bboxNorth = -90; 
  var bboxSouth = 90;
    for (var i = 0; i < paths.getLength(); i++) {
      if (paths.getAt(i).lat() > bboxNorth) { 
        bboxNorth = paths.getAt(i).lat(); 
      }
      if (paths.getAt(i).lat() < bboxSouth) { 
        bboxSouth = paths.getAt(i).lat(); 
      }
    }
    var spanLatitude = bboxNorth - bboxSouth;
  // To determine the easternmost and westernmost longitudes, we must 
    // check whether the path between each vertex crosses the antimeridian.
  // Antimeridian crossing is assumed if path length exceeds 180 degrees.
    var bboxEast = -180;
    var bboxWest = 180;
    var spanLongitude = 0;
    var thisLongitude;
    var thisEast;
    var thisWest;
    for (var i = 0; i < paths.getLength(); i++) {
      thisLongitude = paths.getAt(i).lng();
        for (var ii = 0; ii < paths.getLength(); ii++) {
          if (paths.getAt(i).lng() !== paths.getAt(ii).lng()) {
          var thisPathSpan = paths.getAt(ii).lng() - thisLongitude;
          if (thisPathSpan < -180 || thisPathSpan > 180) { 
            // This path crosses the antimeridian, so adjust for that.
            if (thisLongitude < 0) { 
              // thisLongitude is the eastern end
              thisEast = thisLongitude;
              thisWest = paths.getAt(ii).lng();
            } else {
              // thisLongitude is the western end
              thisWest = thisLongitude;
              thisEast = paths.getAt(ii).lng();
            }
          thisPathSpan = thisEast + 360 - thisWest; 
           } else {
              // This path does not cross the antimeridian.
               if (thisLongitude > paths.getAt(ii).lng()) { 
              // thisLongitude is the eastern end
              thisEast = thisLongitude;
              thisWest = paths.getAt(ii).lng();
            } else {
              // thisLongitude is the western end
              thisWest = thisLongitude;
              thisEast = paths.getAt(ii).lng();
            }
          thisPathSpan = thisEast - thisWest; 
            }
          // Now check if thisPathSpan is the longest path so far. 
        if (thisPathSpan >= spanLongitude) { 
            spanLongitude = thisPathSpan;
            bboxWest = thisWest;
            bboxEast = thisEast;
          }
          } // end checking this path for antimeridian crossing
        }  // end for loop; all paths with this vertex have been checked
    } // end for loop; all paths between all vertices have been checked
  if (spanLatitude < spanLongitude) {
    return spanLatitude;
  } else {
    return spanLongitude;
  }
}

function updateFormPolygon(newPolygon) {
  polygonPath = arrayToStringPolygon(newPolygon.getPath().getArray());
  // verify vertices, fix precision and update form values for polygon
  document.capForm.capPolygon.value = verifyPolygon(polygonPath);
  document.capForm.capPolygon.onchange();
}

function deleteCapPolygon() {
  if (!onlineMapping) {
    return;
  }
  deleteDrawnPolygon();
}

function deleteDrawnPolygon() {
  if(capPolygon != null) {
    capPolygon.setMap(null);
    capPolygon = null;
  };
}

function drawCapPolygon() {  
  if (!onlineMapping) {
    return;
  }
  // Delete current capPolygon if it exists.
  deleteDrawnPolygon();
  // Create and draw the new capPolygon
  capPolygon = new google.maps.Polygon({
    fillColor: "#FF0000",
    fillOpacity: 0.1,
    strokeColor: "#F33F00",
    strokeOpacity: 0.8,
    strokeWeight: 2,
    map: map,
    clickable: true,
    editable: true,
    paths: polygonPathArray
    });
  // Set event triggers for changes to any part of the capPolygon
  capPolygon.getPaths().forEach(function(path, index){
    // 'insert_at' means a vertex was inserted in an edge
    google.maps.event.addListener(path, 'insert_at', function(){
      updateFormPolygon(capPolygon);
    });
    // 'remove_at' means a vertex was removed
    google.maps.event.addListener(path, 'remove_at', function(){
      updateFormPolygon(capPolygon);
    });
    // 'set_at' means a vertex was moved
    google.maps.event.addListener(path, 'set_at', function(){
      updateFormPolygon(capPolygon);
    });
  });
  // Disable drawing until client clicks draw button
  if(drawingManager.getMap()) { 
    drawingManager.setMap(null);
  }
}

function preciseCoordinates(thisVertex, leastSpan) {
  // One-thousandth degree of latitude is about 111 meters
  switch (true) {
    case (leastSpan < .001):
      polygonVertexLat = fixPrecision(thisVertex.lat(),5);
      polygonVertexLng = fixPrecision(thisVertex.lng(),5);
        return(polygonVertexLat+","+polygonVertexLng);
    case (leastSpan < .01):
      polygonVertexLat = fixPrecision(thisVertex.lat(),4);
      polygonVertexLng = fixPrecision(thisVertex.lng(),4);
        return(polygonVertexLat+","+polygonVertexLng);
    case (leastSpan < .1):
      polygonVertexLat = fixPrecision(thisVertex.lat(),3);
      polygonVertexLng = fixPrecision(thisVertex.lng(),3);
        return(polygonVertexLat+","+polygonVertexLng);
    case (leastSpan < 1):
      polygonVertexLat = fixPrecision(thisVertex.lat(),2);
      polygonVertexLng = fixPrecision(thisVertex.lng(),2);
        return(polygonVertexLat+","+polygonVertexLng);
    case (leastSpan < 10):
      polygonVertexLat = fixPrecision(thisVertex.lat(),1);
      polygonVertexLng = fixPrecision(thisVertex.lng(),1);
        return(polygonVertexLat+","+polygonVertexLng);
    default:
      polygonVertexLat = fixPrecision(thisVertex.lat(),0);
      polygonVertexLng = fixPrecision(thisVertex.lng(),0);
        return(polygonVertexLat+","+polygonVertexLng);
  }
}

function fixPrecision(number,precision) {
  var countDecimalDigits = 0;
  var char_array = number.toString().trim().split("");
  var not_decimal = char_array.lastIndexOf(".");
  if (not_decimal > 0) {
    countDecimalDigits = char_array.length - not_decimal;
  }
  if (countDecimalDigits > precision) {
    return(number.toFixed(precision));
  }
  return(number);
}

function stringToArrayPolygon (stringPolygon) {
  var arrayPolygon = [];
  var polygonVertices = stringPolygon.split(" ");
  var polygonVertexLatLng;
    for (var i=0; i < polygonVertices.length; i++) {
      polygonVertexLatLng = polygonVertices[i].split(",");
      polygonVertexLat = polygonVertexLatLng[0];
    polygonVertexLng = polygonVertexLatLng[1];
    arrayPolygon.push(new google.maps.LatLng(polygonVertexLat,polygonVertexLng));
  }
  return(arrayPolygon);
}

function arrayToStringPolygon (arrayPolygon) {
  var stringPolygon = "";
  for (key in arrayPolygon) {
    stringPolygon += " " + arrayPolygon[key].lat() + "," + arrayPolygon[key].lng();
  }
  return(stringPolygon.trim());
}

function enableDrawingCircle() {
  if (!onlineMapping) {
    return;
  }
  // Enable the drawing of a circle on client side. Then, the drawing 
    // or updating of a circle will trigger the circlecomplete event.
    if(drawingManager.getMap()) {
        drawingManager.setMap(null); 
    }
    drawingManager.setOptions({
        drawingMode : google.maps.drawing.OverlayType.CIRCLE,
        drawingControl : false,
        drawingControlOptions : {
            position : google.maps.ControlPosition.TOP_CENTER,
            drawingModes : [google.maps.drawing.OverlayType.CIRCLE]
        },
      circleOptions:  {
          clickable: true,
      editable: true,
      fillColor: "#FF0000",
      fillOpacity: 0.1,
      strokeColor: "#F33F00",
      strokeOpacity: 0.8,
      strokeWeight: 2
      }
   });
   drawingManager.setMap(map); 
}

function enableDrawingPolygon() {
  if (!onlineMapping) {
    return;
  }
  // Enable the drawing of a polygon on client side. Then, the drawing 
    // or updating of a polygon will trigger the polygoncomplete event.
    if(drawingManager.getMap()) {
        drawingManager.setMap(null); 
    }
    drawingManager.setOptions({
        drawingMode : google.maps.drawing.OverlayType.POLYGON,
        drawingControl : false,
        drawingControlOptions : {
            position : google.maps.ControlPosition.TOP_CENTER,
            drawingModes : [google.maps.drawing.OverlayType.POLYGON]
         },
       polygonOptions:  {
             clickable: true,
         editable: true,
         fillColor: "#FF0000",
         fillOpacity: 0.1,
         strokeColor: "#F33F00",
         strokeOpacity: 0.8,
         strokeWeight: 2
       }
    });
    drawingManager.setMap(map); 
}

function initializeMap(initLatLng,initZoom) {
  if ((typeof window.google === "undefined") || 
    (typeof google.maps === "undefined")) {
    onlineMapping = false;
    alert("Mapping functions not available without Internet access.");
    return;
  }  else {
    onlineMapping = true;
  }
  var latLngSplit = initLatLng.trim().split(","); 
  var mapCenterLat = parseFloat(latLngSplit[0]);
  var mapCenterLng  = parseFloat(latLngSplit[1]);
  var mapCenterLatLng = new google.maps.LatLng(mapCenterLat,mapCenterLng);
  var mapZoom = parseInt(initZoom.trim());
  var mapOptions = {
      zoom: mapZoom,
      center: mapCenterLatLng,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true,
      mapTypeControl: true,
      zoomControl: true
  }
  map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);
  drawingManager = new google.maps.drawing.DrawingManager();
    drawingManager.setOptions({
        drawingMode : null,
        drawingControl : false,
       circleOptions:  {
          clickable: true,
      editable: true,
      fillColor: "#FF0000",
      fillOpacity: 0.1,
      strokeColor: "#F33F00",
      strokeOpacity: 0.8,
      strokeWeight: 2
      },
    polygonOptions:  {
             clickable: true,
         editable: true,
         fillColor: "#FF0000",
         fillOpacity: 0.1,
         strokeColor: "#F33F00",
         strokeOpacity: 0.8,
         strokeWeight: 2
       }
    });
    drawingManager.setMap(map); 
  
  google.maps.event.addListener(drawingManager,'circlecomplete',function(circle) {
    // updateFormCircle updates form values for the capCircle
    updateFormCircle(circle);
    // Remove the drawn circle in favor of verified and precise capCircle
    circle.setMap(null);
    circle = null;
    // Draw verified and precise capCircle and set listeners for changes to it
    drawCapCircle();
  });
  google.maps.event.addListener(drawingManager,'polygoncomplete',function(polygon) {
    // plygonUpdateForm updates form values for the capPolygon
    updateFormPolygon(polygon);    
    // Remove the drawn polygon in favor of verified and precise capPolygon
    polygon.setMap(null);
    polygon = null;
    // Draw verified and precise capPolygon and set listeners for changes to it
    drawCapPolygon();
  });
}

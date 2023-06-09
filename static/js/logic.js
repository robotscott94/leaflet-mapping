
// Import tectonic plate geometries
const tectonicLines = d3.json("static/js/PB2002_boundaries.json");

// Creates legend and layers, plots map and tectonic data
function createMap(x) {

  // Import layers
  var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Create layer objects
  var baseMaps = {
    Street: street,
    Topography: topo
  };

  var overlayMaps = {
    Earthquakes: x,
  };

  // Initializes map
  var myMap = L.map("map", {
    center: [20, -100],
    zoom: 3,
    layers: [street, x]
    });

  // Initialize Legend
  const legend = L.control({ position:'bottomleft'});

  legend.onAdd = function (myMap) {
    const div = L.DomUtil.create("div", "info legend");
  
    // Define the labels and colors for the legend
    const labels = [">30 km Below Surface", "20-30 km Below Surface", "10-20 km Below Surface", "0-10 km Below Surface", "Above Sea Level"];
    const colors = ["maroon", "crimson", "indianred", "lightpink", "lightgreen"];
    div.innerHTML += "<h4>Legend</h4>";
    //Add the legend items to the container
    for (let i = 0; i < labels.length; i++) {
      div.innerHTML += `<i style="background: ${colors[i]}"></i><span>${labels[i]}</span><br>`;
    }
    return div;
  };
  legend.addTo(myMap);
  
  // Add tectonic boundary lines
  tectonicLines.then(function(promise) {
    var bounds = promise.features;
    for (i=0; i<bounds.length; i++) {
      var latlong = bounds[i].geometry.coordinates;
      for (let j = 0; j < latlong.length; j++) {
        [latlong[j][0], latlong[j][1]] = [latlong[j][1], latlong[j][0]];
      }
      L.polyline(latlong, {color: "yellow"}).addTo(myMap);
    };
    console.log(bounds[10].geometry.coordinates[0])
  })
  L.control.layers(baseMaps, overlayMaps).addTo(myMap);
}

// Creates and formats earthquake markers
function createMarkers(y) {
  quakes = y.features;
  var quakeMarkers = [];

  // Sets classes for earthquake depth
  for (let i = 0; i < quakes.length; i++) {

    if (quakes[i].geometry.coordinates[2] >= 30) {
      var depthcol =  "maroon";
    } else if (quakes[i].geometry.coordinates[2] >= 20) {
      var depthcol =  "crimson";
    } else if (quakes[i].geometry.coordinates[2] >= 10) {
      var depthcol =  "indianred";
    } else if (quakes[i].geometry.coordinates[2] >= 0) {
      var depthcol =  "lightpink";
    } else {
      var depthcol =  "lightgreen";
    }

    // Adds circle marker for each circle
    // Size is proportional to magnitude, Color shows range of depth
    var quakeMark = L.circle([quakes[i].geometry.coordinates[1], quakes[i].geometry.coordinates[0]], {
      fillOpacity: 0.75,
      color: "white",
      weight: 1,
      fillColor: depthcol,
      radius: (quakes[i].properties.mag)*30000
      }).bindPopup(`<h3>Magnitude: ${
        quakes[i].properties.mag
        }</h3>  <h3>Depth: ${
        quakes[i].geometry.coordinates[2]
        } km</h3> <h3>Location: ${
        quakes[i].properties.place
        }</h3><h3>Date & Time: ${
        Date(quakes[i].properties.time*1000)
        }</h3>`);

    quakeMarkers.push(quakeMark);
  }
return L.layerGroup(quakeMarkers);
}

// Pulls earthquake data from USGS and uses this as input to create map.
d3.json('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson').then(function(response) {
  createMap(createMarkers(response));
})
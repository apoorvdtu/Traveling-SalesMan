(function () {
  var map = L.map('map').setView([20.5937, 78.9629], 5);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  var latlngs = [];

  let run = document.querySelector('.run');

  const icon = L.icon({
    iconUrl: 'backpack.jpg',
    iconSize: [80, 60]
  });

  const marker = L.marker([15.5937, 78.9629], {
    icon
  })
  // marker.bindPopup('<h4>Travler</h4>')
  marker.addTo(map);
  map.addEventListener('click', addMarkerToMap);


  run.addEventListener('click', startActivity);
  function startActivity() {
    var graph = fill2dGraph();
    var visited = [];
    for (let i = 0; i < graph.length; i++) {

      visited.push(false);
    }
    let count = tsp(0, graph, 1, visited, "0", 0, 0);
    console.log(ans);
    console.log(count);
    paths = [];
    graph = [];
    ans = [];
    console.log("--------------");
    tsp_dp(graph);

  }
  var ans = [];
  function tsp(i, graph, csf, visited, psf, cost, msrc) {
    if (csf == graph.length) {
      psf = psf + " " + msrc;
      psf = psf.trim().split(" ");
      ans.push({
        psf: psf,
        cost: cost + graph[i][msrc]
      })
      return 1;
    }
    let count = 0;
    visited[i] = true;
    for (let j = 0; j < graph.length; j++) {
      if (visited[j] == false && j != i) {
        count += tsp(j, graph, csf + 1, visited, psf + " " + j, cost + graph[i][j], msrc);
      }
    }
    visited[i] = false;
    return count;
  }
  function addMarkerToMap(e) {

    var marker = L.marker([e.latlng.lat, e.latlng.lng], {
      icon
    })

    marker.addTo(map);

    latlngs.push([e.latlng.lat, e.latlng.lng]);
    var polyline = L.polyline(latlngs, { color: 'red' });
    polyline.addTo(map);
    // marker.addEventListener('click', function () {
    //   map.removeLayer(marker);

    //   for (let i = 0; i < latlngs.length; i++) {
    //     let latlng = latlngs[i];
    //     if (latlng[0] == e.latlng.lat && latlng[1] == e.latlng.lng) {
    //       latlngs.splice(i, 1);
    //       console.log(latlngs);

    //       break;
    //     }
    //   }
    // map.removeLayer(polyline);
    // })

  }
  function fill2dGraph() {
    var graph = [];
    for (let i = 0; i < latlngs.length; i++) {
      let ilatlng = latlngs[i];
      var ans = [];
      for (let j = 0; j < latlngs.length; j++) {
        let jlatlng = latlngs[j];
        if (i != j) {
          var distance = getDistance(ilatlng, jlatlng);
          ans.push(distance);
        }
        else {
          ans.push(0);
        }
      }
      graph.push(ans);
    }
    return graph;
  }
  function getDistance(origin, destination) {
    var lon1 = toRadian(origin[1]),
      lat1 = toRadian(origin[0]),
      lon2 = toRadian(destination[1]),
      lat2 = toRadian(destination[0]);

    var deltaLat = lat2 - lat1;
    var deltaLon = lon2 - lon1;

    var a = Math.pow(Math.sin(deltaLat / 2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(deltaLon / 2), 2);
    var c = 2 * Math.asin(Math.sqrt(a));
    var EARTH_RADIUS = 6371;
    return c * EARTH_RADIUS;
  }
  function toRadian(degree) {
    return degree * Math.PI / 180;
  }
  
})();
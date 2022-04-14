(function () {
  let run = document.querySelector('.run');
  let restart = document.querySelector('.restart');
  let overlay = document.querySelector('#overlay');
  let backtracking = document.querySelector('.backtracking');
  let dynamicAlgorithm = document.querySelector('.dynamic-programming');
  let algo = "back";
  dynamicAlgorithm.addEventListener('click', function () {
    algo = "dp";
  })
  let pathspeed = 5;
  let speed = document.querySelector('.speed');
  var map = L.map('map').setView([20.5937, 78.9629], 5);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  var ans = [];
  var polyarr = [];
  var latlngs = [];
  var polyarrow = [];
  map.addEventListener('click', addMarkerToMap);
  run.addEventListener('click', startActivity);
  speed.addEventListener('click', handlepathspeed);

  const icon = L.icon({
    iconUrl: 'rocket.png',
    iconSize: [45, 45]
  });
  function handlepathspeed() {
    let val = prompt('Enter Speed(Secs) At Which Probable Paths should be shown');
    if (val == null) {
      return;
    }
    val = val.trim();
    if (val.length == 0) {
      return;
    }
    if (run.getAttribute('pressed') == 'true') {
      return;
    }
    pathspeed = parseInt(val);
  }
  restart.addEventListener('click', function () {
    document.location.reload(true)
  });


  // const marker = L.marker([15.5937, 78.9629], {
  //   icon
  // })
  // // marker.bindPopup('<h4>Travler</h4>')
  // marker.addTo(map);

  function startActivity() {
    console.log(run.getAttribute('pressed'))
    if (run.getAttribute('pressed') == 'true') {
      return;
    }

    if (algo === "back") {
      let time1 = Date.now();
      console.time('Time to execute BackTracking');

      run.setAttribute('pressed', 'true');
      console.log(run.getAttribute('pressed'))

      overlay.style.display = "block";

      var graph = fill2dGraph();

      var visited = [];

      for (let i = 0; i < graph.length; i++) {
        visited.push(false);
      }
      let count = tsp(0, graph, 1, visited, "0", 0, 0);
      console.log(ans);

      console.log(count);

      let time2 = Date.now();
      console.timeEnd('Time to execute BackTracking');
      console.log(time2 - time1);
      let time = time2 - time1;
      tempAlert(' Time Taken for Calculating Best Possible Path: ' + time + " ms ", 10000);
      printAllPath(ans);


    }
    else {
      dp_1();
    }



  }
  function tempAlert(msg, duration) {
    var el = document.createElement("div");
    el.setAttribute("style", "position:absolute;top:94%;left:2%;font-size:x-large;font-family: 'Times New Roman', Times, serif;font-weight: 200;color: teal;z-index:1560;background-color: rgb(255, 238, 109);border: 3px solid rgb(113, 227, 0);border-radius: 5px;");
    el.innerHTML = msg;
    setTimeout(function () {
      el.parentNode.removeChild(el);
    }, duration);
    document.body.appendChild(el);
  }

  function printAllPath(ans) {
    let c = 0;
    overlay.style.display = "block";
    let cid = setInterval(function () {
      if (c >= ans.length - 1) {
        clearInterval(cid);
      }
      let obj = ans[c];
      let psf = obj.psf;
      var path = [];
      console.log(psf);
      for (let i = 0; i < psf.length; i++) {
        let markernum = parseInt(psf[i]);
        path.push(latlngs[markernum]);
      }
      let olatlngs = latlngs.map(function (latlng) {
        return latlng;
      })
      latlngs = path.map(function (p) {
        return p;
      })

      addPolyLineToGraph();
      latlngs = olatlngs.map(function (latlng) {
        return latlng;
      })


      c++;


    }, pathspeed * 1000);
    setTimeout(function () {
      minCostPath(ans);
      overlay.style.display = "none";
      run.setAttribute('pressed', 'false');
    }, ans.length * pathspeed * 1000 + pathspeed * 1000);


  }
  function minCostPath(ans) {
    let minCost = Infinity;
    let minpsf = "";
    for (let i = 0; i < ans.length; i++) {
      let cost = ans[i].cost;
      let psf = ans[i].psf;
      if (minCost > cost) {
        minCost = cost;
        minpsf = psf;
      }
    }

    var path = [];
    for (let i = 0; i < minpsf.length; i++) {
      let markernum = parseInt(minpsf[i]);
      path.push(latlngs[markernum]);
    }
    latlngs = [];
    latlngs = path.filter(() => {
      return true;
    });
    path = [];
    addPolyLineToGraph();
    console.log(minCost + "," + minpsf);

  }
  function tsp(i, graph, csf, visited, psf, cost, msrc) {
    if (csf == graph.length) {
      psf = psf + " " + msrc;
      psf = psf.trim().split(" ");

      var path = [];
      for (let i = 0; i < psf.length; i++) {
        let markernum = parseInt(psf[i]);
        path.push(latlngs[markernum]);
      }
      latlngs = path.filter(() => {
        return true;
      });
      path = [];
      addPolyLineToGraph();
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

    marker.addEventListener('click', function () {
      map.removeLayer(marker);

      let latidx = latlngs.findIndex((latlng) => {
        return latlng[0] == e.latlng.lat && latlng[1] == e.latlng.lng
      })
      latlngs.splice(latidx, 1);
      // for(let i = 0;i<polyarr.length;i++)
      // {
      //     polyarr[i].removeFrom(map);
      // }
      // polyarr =[];
      addPolyLineToGraph();
    })
    addPolyLineToGraph();
  }


  function addPolyLineToGraph() {
    for (let i = 0; i < polyarr.length; i++) {
      polyarr[i].removeFrom(map);
    }
    for (let i = 0; i < polyarrow.length; i++) {
      polyarrow[i].removeFrom(map);
    }
    polyarr = [];
    polyarrow = [];
    var polyline = L.polyline(latlngs, { color: 'orange' });
    polyline.addTo(map);
    let parrow = L.featureGroup(getArrows(latlngs, 'purple', 4, map));
    parrow.addTo(map)
    polyarrow.push(parrow);
    polyarr.push(polyline);
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
  function getArrows(arrLatlngs, color, arrowCount, mapObj) {

    if (typeof arrLatlngs === undefined || arrLatlngs == null ||
      (!arrLatlngs.length) || arrLatlngs.length < 2)
      return [];

    if (typeof arrowCount === 'undefined' || arrowCount == null)
      arrowCount = 1;

    if (typeof color === 'undefined' || color == null)
      color = '';
    else
      color = 'color:' + color;

    var result = [];
    for (var i = 1; i < arrLatlngs.length; i++) {
      var icon = L.divIcon({ className: 'arrow-icon', bgPos: [5, 5], html: '<div style="' + color + ';transform: rotate(' + getAngle(arrLatlngs[i - 1], arrLatlngs[i], -1).toString() + 'deg)">▶</div>' });
      for (var c = 1; c <= arrowCount; c++) {
        result.push(L.marker(myMidPoint(arrLatlngs[i], arrLatlngs[i - 1], (c / (arrowCount + 1)), mapObj), { icon: icon }));
      }
    }
    return result;
  }

  function getAngle(latLng1, latlng2, coef) {
    var dy = latlng2[0] - latLng1[0];
    var dx = Math.cos(Math.PI / 180 * latLng1[0]) * (latlng2[1] - latLng1[1]);
    var ang = ((Math.atan2(dy, dx) / Math.PI) * 180 * coef);
    return (ang).toFixed(2);
  }

  function myMidPoint(latlng1, latlng2, per, mapObj) {
    if (!mapObj)
      throw new Error('map is not defined');

    var halfDist, segDist, dist, p1, p2, ratio,
      points = [];

    p1 = mapObj.project(new L.latLng(latlng1));
    p2 = mapObj.project(new L.latLng(latlng2));

    halfDist = distanceTo(p1, p2) * per;

    if (halfDist === 0)
      return mapObj.unproject(p1);

    dist = distanceTo(p1, p2);

    if (dist > halfDist) {
      ratio = (dist - halfDist) / dist;
      var res = mapObj.unproject(new Point(p2.x - ratio * (p2.x - p1.x), p2.y - ratio * (p2.y - p1.y)));
      return [res.lat, res.lng];
    }

  }

  function distanceTo(p1, p2) {
    var x = p2.x - p1.x,
      y = p2.y - p1.y;

    return Math.sqrt(x * x + y * y);
  }

  function Point(x, y, round) {
    this.x = (round ? Math.round(x) : x);
    this.y = (round ? Math.round(y) : y);
  }
  function dp_1() {

    let INT_MAX = 999999;

    let dist = fill2dGraph();
    let n = dist.length;
    let VISITED_ALL = (1 << n) - 1;

    let dp = [];
    for (let i = 0; i < (1 << n); i++) {
      // dp[i].fill(0,0,n);
      dp[i] = [];
      for (let j = 0; j < n; j++) {
        dp[i].push(-1);
      }
    }
    var parent = [];
    // vector<vector<int> > parent(4,vector<int>(16,-1));
    for (let i = 0; i < n; i++) {
      parent[i] = [];

      for (let j = 0; j < (1<<n); j++) {
        parent[i].push(-1);
      }
    }

    function tsp(mask, pos) {

      if (mask == VISITED_ALL) {
        return dist[pos][0];
      }
      if (dp[mask][pos] != -1) {
        return dp[mask][pos];
      }


      var ans = INT_MAX;


      for (var city = 0; city < n; city++) {

        if ((mask & (1 << city)) == 0) {

          var newAns = dist[pos][city] + tsp(mask | (1 << city), city);
          if (newAns < ans) {
            parent[pos][mask] = city;
            ans = newAns;
          }
        }

      }

      return dp[mask][pos] = ans;
    }

    function main() {
      /* init the dp array */

      console.log(tsp(1, 0));

      for (var i = 0; i < n; i++) {
        for (var j = 0; j < n; j++) {
          console.log(parent[i][j]);
        }
      }
      var path = [];
      path.fill(-1, 0, n);
      var path_counter = 0;
      var cur_node = 0;
      var cur_mask = 1;

      do {
        path[path_counter] = cur_node;
        path_counter += 1;
        cur_node = parent[cur_node][cur_mask];
        cur_mask = cur_mask | (1 << cur_node);
      } while (cur_node != -1);

      for (var i = 0; i < n; i++) {
        console.log(path[i]);
      }

      // cout<<endl;
      // return 0;
    }
    main();
  }

})();
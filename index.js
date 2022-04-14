(function () {
  let run = document.querySelector('.run');
  let restart = document.querySelector('.restart');
  let overlay = document.querySelector('#overlay');
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
    if(val.length==0)
    {
      return;
    }
    pathspeed =parseInt(val);
  }
  restart.addEventListener('click', function () {
    for (let i = 0; i < polyarr.length; i++) {
      polyarr[i].removeFrom(map);
    }
    for (let i = 0; i < polyarrow.length; i++) {
      polyarrow[i].removeFrom(map);
    }
    polyarr = [];
    polyarrow = [];
    latlngs = [];
    map.eachLayer(function (layer) {
      map.removeLayer(layer);
      overlay.style.display = 'none';
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

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


    printAllPath(ans);


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


    }, pathspeed*1000);
    setTimeout(function () {
      minCostPath(ans);
      overlay.style.display = "none";
      run.setAttribute('pressed', 'false');
    }, ans.length * pathspeed*1000 + pathspeed*1000);


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

  function dp() {
    function heldKarp(cities, start) {
      var toHold = [];
      if (cities.length == 2) {
        return Math.max(...cities[0]);
      }
      else {
        for (var i = 0; i < cities.length; i++) {
          if (cities[start][i] == 0) {
            continue;
          }
          else {
            var tempMatrix = copyGraph(cities);
            reduceGraph(tempMatrix, start);
            toHold.push(cities[start][i] + heldKarp(tempMatrix, (i < 1 ? 0 : i - 1)));
          }
        }
        return Math.min(...toHold);
      }
    }

    function heldKarpAlt(cities, start) {
      if (cities.length < 2) {
        return 0;
      }
      // memoTable will be the way we hold distances that have already
      // been computed. For every index, there are three elements: in order,
      // the subset of cities already visited, the city we are going through
      // to reach that subset, and the minimum distance produced from that

      // this is some initial setup
      var memoTable = [];
      var validCities = [];
      for (var i = 0; i < cities.length; i++) {
        if (start == i) {
          continue;
        }
        validCities.push(i);
      }
      var subsets = generateSubsets(validCities);
      for (var i = 0; i < validCities.length; i++) {
        memoTable.push([[], validCities[i], 0]);
      }

      // this constructs the memo table with possible sets and cities
      for (var i = 1; i < validCities.length; i++) {
        var temp = [];
        var subsetsCopy = subsets.filter(set => set.length == i);
        for (var j = 0; j < subsetsCopy.length; j++) {
          for (var k = 0; k < validCities.length; k++) {
            if (subsetsCopy[j].includes(validCities[k])) {
              continue;
            }
            temp.push([subsetsCopy[j], validCities[k], -1]);
          }
        }
        for (var x = 0; x < temp.length; x++) {
          memoTable.push(temp[x]);
        }
      }
      memoTable.push([validCities, start, -1]);

      var minDist = [];
      var tempStuff = [];
      var accumulator = 0;

      for (var i = 0; i < memoTable.length; i++) {
        var currentLength = memoTable[i][0].length;
        if (memoTable[i][0] == 0) {
          continue;
        }
        var tempStuff = memoTable.filter(set => set[0].length == currentLength - 1);
        for (var k = 0; k < memoTable[i][0].length; k++) {
          var copyMemoLocation = [];
          copyMemoLocation.push(memoTable[i][0].slice());
          var oldCity = memoTable[i][0][k];
          var currentCity = memoTable[i][1];
          var lookupSet = copyMemoLocation.slice();
          lookupSet[0].splice(k, 1);
          for (var m = 0; m < tempStuff.length; m++) {
            var comparisonSet = tempStuff[m][0].slice();
            if (testEqualArrays(comparisonSet, lookupSet[0]) &&
              (tempStuff[m][1] == oldCity)) {
              accumulator = accumulator + tempStuff[m][2];
            }
          }
          minDist.push(accumulator + findRouteDist(cities, [currentCity, oldCity]));
          accumulator = 0;
        }
        memoTable[i][2] = Math.min(...minDist);
        minDist = [];
      }
      var x = memoTable.pop();
      var trueMin = x[2];
      return trueMin;
    }

    // generates an undirected graph - an adjacency matrix


    // removes a city from a graph, so an nxn graph becomes n-1 x n-1
    function reduceGraph(matrix, start) {
      if (start < 0) {
        return matrix;
      }
      else {
        for (var i = 0; i < matrix.length; i++) {
          if (i == start) {
            continue;
          }
          else {
            matrix[i].splice((start), 1);
          }
        }

        matrix.splice((start), 1);
        return matrix;
      }
    }

    // prints an adjacency matrix for ease of display, borrowed from labs
    function printMatrix(matrix) {
      for (var i = 0; i < matrix.length; i++) {
        console.log(matrix[i]);
      }
      return;
    }

    // function to make a "deep copy" of a graph
    // this is here because both slice() and concat()
    // both did not play nice with the algorithm
    // thanks for nothing, stack overflow
    function copyGraph(matrix) {
      var why = [];
      for (var i = 0; i < matrix.length; i++) {
        why[i] = [matrix.length]
        for (var j = 0; j < matrix.length; j++) {
          why[i][j] = matrix[i][j];
        }
      }
      return why;
    }

    // a function that generates all possible subsets of an array
    // and then sorts them in order of the length of the set
    function generateSubsets(array) {
      var collect = [];
      for (var i = 0; i < (Math.pow(2, array.length)); i++) {
        var temp = [];
        for (var j = 0; j < array.length; j++) {
          if ((i & (1 << j))) temp.push(array[j]);
        }
        collect.push(temp);
      }
      collect.sort(function (a, b) { return a.length - b.length });
      return collect;
    }

    // a function that takes a graph and returns a random route
    function generateRoute(cities) {
      var temp = [];
      while (temp.length < cities.length) {
        var rando = Math.floor(Math.random() * cities.length);
        if (temp.includes(rando)) {
          continue;
        }
        else {
          temp.push(rando);
        }
      }
      return temp;
    }

    // quick function to find the distance of a route
    function findRouteDist(cities, route) {
      var distance = 0;
      for (var i = 0; i < route.length - 1; i++) {
        distance = distance + cities[route[i]][route[i + 1]];
      }
      return distance;
    }

    // function to reverse a chunk of a given route
    function twoOptSwap(route, i, k) {
      if (i == k) { return route; }
      var temp = route.slice(i, k + 1);
      route.splice(i, (k + 1 - i));
      for (var j = 0; j < temp.length; j++) {
        route.splice(i, 0, temp[j]);
      }
    }

    // function to test if two arrays are equivalent, borrowed from labs
    function testEqualArrays(route1, route2) {
      var bool = true;
      for (var i = 0; i < route1.length; i++) {
        if (route1[i] != route2[i]) {
          bool = false;
        }
      }
      return bool;
    }


    console.log("-----------------------Testing Held-Karp!--------------------------");
    var myMatrix = fill2dGraph();
    console.time('Time to execute Held Karp')
    console.log("On a graph of size", myMatrix.length, "the shortest path I could find is of length",
      heldKarpAlt(myMatrix, 0));
    console.timeEnd('Time to execute Held Karp');
    console.log();
  }
})();
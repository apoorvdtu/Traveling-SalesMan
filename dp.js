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

    // this section calculates all the minimum distances
    // in the memo table
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
function generateGraph(n) {
    return graph;
}

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
console.log("-----------------------Testing Held-Karp!--------------------------");
var myMatrix = fill2dGraph();
console.time('Time to execute Held Karp')
console.log("On a graph of size", i, "the shortest path I could find is of length",
    heldKarpAlt(myMatrix, 0));
console.timeEnd('Time to execute Held Karp');
console.log();
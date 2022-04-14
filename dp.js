
let graph = fill2dGraph();
let VISITED_ALL = (1 << n) - 1;
let dplen = graph.length;
let dp = [[]];
for(let i = 0;i<(1<<n);i++)
{
    dp[i] = [];
    for(let j = 0;j<dplen;j++)
    {
        dp[i].push(0);
    }
}
let parent = [];
for(let i = 0;i<10000;i++)
{
    dp[i] = [];
    for(let j = 0;j<10000;j++)
    {
        dp[i].push(-1);
    }
}
function tsp(mask, pos) {

    if (mask == VISITED_ALL) {
        return graph[pos][0];
    }
    if (dp[mask][pos] != -1) {
        return dp[mask][pos];
    }


    ans = Infinity;


    for (let city = 0; city < n; city++) {

        if ((mask & (1 << city)) == 0) {

            let newAns = graph[pos][city] + tsp(mask | (1 << city), city);
            if (newAns < ans) {
                parent[pos][mask] = city;
                ans = newAns;
            }
        }

    }

    return dp[mask][pos] = ans;
}

    /* init the dp array */
    for (let i = 0; i < (1 << n); i++) {
        for (let j = 0; j < n; j++) {
            dp[i][j] = -1;
        }
    }
    let cost = tsp(1, 0);
    console.log("Travelling Saleman graphance is "+cost);
    // for (let i = 0; i < n; i++) {
    //     for (let j = 0; j < n; j++) {
    //         cout << parent[i][j] << " ";
    //     }
    //     cout << endl;
    // }
    var path = [];
    for(let i = 0;i<n;i++)
    {
        path.push(0);
    }
    let path_counter = 0;
    let cur_node = 0;
    let cur_mask = 1;

    do {
        path[path_counter] = cur_node;
        path_counter += 1;
        cur_node = parent[cur_node][cur_mask];
        cur_mask = cur_mask | (1 << cur_node);
    } while (cur_node != -1);
    var ans = [];
    for (let i = 0; i < n; i++) {
        ans.push(path[i]);
    }

    console.log(ans);

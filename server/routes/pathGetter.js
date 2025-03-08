const express = require("express");
const Logger=require('./../connect/logg');
const pathGetter = express.Router();
const { spawn } = require('child_process'); // using child_process to call a seprate file during execution



//fetch-shortest-path call the ShortestPath.py file which include the dijkstra algo for the shortest path
// the ShortestPath.py takes 2 arguments source and destination, then calculate the shortest path and return the desired result
pathGetter.post("/fetch-shortest-path", async (req, res) => {
    var start=req.body.start;
    var dest=req.body.dest;
    let data1;
    // check is created to fetch the shortest path for the specific source and destination
    const check= spawn('python',['ShortestPath.py',start,dest]);
    check.stderr.on('data',(data) => 
    {
        console.error(`stderr:${data}`);
    });
    check.stdout.on('data',function (data) 
    {
        console.log(data1=data);
    });

// res.send(check);
    // input is then read and send to the front-end for display
    check.on('close',(code)=>
    {
        res.send(data1)
    });
})

// // pathGetter.use(bodyParser.json());

// pathGetter.post('/fetch-shortest-path', (req, res) => {
//   const { start, dest } = req.body;

//   // Create a new directed graph
//   const graph = new Graph({ directed: true });

//   // Add edges and weights to the graph
//   graph.setEdge('Agra', 'Delhi', 40); // Example edge with weight 4
//   // Add more edges as needed based on your data

//   // Convert the graph to a format compatible with dijkstrajs
//   const nodes = graph.nodes();
//   const edges = graph.edges().map(edge => {
//     return { v: edge.v, w: edge.w, weight: graph.edge(edge) };
//   });

//   // Run Dijkstra's algorithm to find the shortest path
//   const shortestPathInfo = dijkstra({ nodes, edges }, start);

//   // Extract the shortest path from start to destination
//   const pathToDest = shortestPathInfo.path(dest);

//   // Calculate the total time for the shortest path
//   let totalTime = shortestPathInfo.distance(dest);

//   res.json(totalTime);
// });


module.exports = pathGetter


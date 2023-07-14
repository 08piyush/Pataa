const { PythonShell } = require("python-shell");
const queries = require("../model/queries.js");
const wkx = require('wkx');
var Buffer = require('buffer').Buffer;


//  FUNCTION TO RENDER SEARCH QUERY 
module.exports.allInOne3 = async function (req, res) {
  var keyword = req.query.q;
  if(typeof keyword === "string"){
  keyword = keyword.toLowerCase(); 
  }
  const options = {
    mode: "json",
    pythonOptions: ["-u"], // unbuffered stdout
    scriptPath: "rapidfuzz",
    args: [keyword],
  };
  const pyshell = new PythonShell("allInOne3.py", options);
  let result = "";
  pyshell.on("message", (message) => {
    result += message;
    // console.log("result : ", result);
  });
  pyshell.on("error", (error) => {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  });

  await pyshell.on("close", () => {
    try {
      const data = result;
      res.send(data);
    } catch (error) {
      console.error("JSON parsing error:", error);
      res.status(500).send("Internal Server Error");
    }
  });
};


//  FUNCTION TO RENDER LAT LONG COORDINATES 
module.exports.allInOne32 = async function (req, res) {
  const long = req.query.q1;
  const lat = req.query.q2;

  try {
    const results = await queries.getFromLL(long, lat);
    // console.log(results.rows);
    console.log("results", results.rows);
    return res.status(200).send(results.rows);
  } catch (err) {
    throw err;
  }
};


//  FUNCTION TO RENDER MAP WITH INSIDE OUTSIDE MARKERS 
module.exports.allInOneInsideOut = async function (req, res) {
  const markPoints = req.query.q; 
  try {
    // QUERY FETCHING RESULTS FOR MARKERS 
    const resultsMarkers = await queries.insideOut(markPoints);
    // QUERY FETCHING RESULTS FOR BOUNDARIES 
    const resultsBoundary = await queries.fetchBoundary();
    // QUERY FETCHING RESULTS FOR CENTROID 
    const resultsCentroid = await queries.fetchCentroid() ; 
    // CONVERTING INTO APPROAPRIATE FORMAT 
    var wkbBuffer = new Buffer.from(resultsCentroid.rows[0].centroid, 'hex');
    var geometry = wkx.Geometry.parse(wkbBuffer);

    var results = {
      results1 : resultsMarkers.rows ,                    // MARKERS 
      results2 : resultsBoundary.rows[0].st_asgeojson,    // BOUNDARY 
      results3 : [geometry.y , geometry.x]                // CENTROID 
    }
    return res.status(200).send(results);
  } catch (err) {
    throw err;
  }
};

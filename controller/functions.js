const { PythonShell } = require("python-shell");
const queries = require("../model/queries.js");

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

module.exports.allInOne32 = async function (req, res) {
  const long = req.query.q1;
  const lat = req.query.q2;
  values = [long, lat];
  console.log("values : ", values);
  try {
    const results = await queries.getFromLL(long, lat);
    // console.log(results.rows);
    console.log("results", results.rows);
    return res.status(200).send(results.rows);
  } catch (err) {
    throw err;
  }
};

module.exports.allInOneInsideOut = async function (req, res) {
  try {
    const results = await queries.insideOut();
    return res.status(200).send(results.rows);
  } catch (err) {
    throw err;
  }
};

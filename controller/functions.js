///////////////////////////////////////////////////////////////////////////////////////////
const queries = require("../model/queries.js");
const crypto = require("../middleware/crypto.js");
const { PythonShell } = require("python-shell");


// async function getUsers(req, res) {
//   const { encryptedRequest } = req.body;
//   const decryptedData = JSON.parse(crypto.decrypting(encryptedRequest));
//   // const dataInJson = JSON.parse(decryptedData);
//   val = [decryptedData.order_by];
//   console.log(encryptedRequest, decryptedData, val);
//   try {
//     const results = await queries.getAllStudentData(val);
//     const encryptData = crypto.encrypting(JSON.stringify(results.rows));
//     res.status(200).json({ encryptedResponse: encryptData });
//   } catch (error) {
//     throw error;
//   }
// }

// async function getUsers(req, res) {
//   const { order_by } = req.order_by;
//   console.log("order by : ", order_by);
//   // const decryptedData = JSON.parse(crypto.decrypting(encryptedRequest));
//   // const dataInJson = JSON.parse(decryptedData);
//   val = [order_by];
//   console.log(val);
//   try {
//     const results = await queries.getAllStudentData(val);
//     // const encryptData = crypto.encrypting(JSON.stringify(results.rows));
//     res.status(200).json({ "decrypted data ": results.rows });
//   } catch (error) {
//     throw error;
//   }
// }


async function getUsers(req, res) {
  const keyword = req.query.q;
  const options = {
    mode: "json",
    pythonOptions: ["-u"], // unbuffered stdout
    scriptPath: "rapidfuzz", 
    args: [keyword],
  };

  console.log("keyword : " , keyword) ; 
  const pyshell = new PythonShell("show_students.py", options);
  let result = "";

  pyshell.on("message", (message) => {
    result += message;
  });

  pyshell.on("error", (error) => {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  });

  await pyshell.on("close", () => {
    try {
      const data = result;
      console.log("data   : \n ", data);
      res.send(data);
    } catch (error) {
      console.error("JSON parsing error:", error);
      res.status(500).send("Internal Server Error");
    }
  });
};




// get student by ID async await
async function getUserById(req, res) {
  const studentid = parseInt(req.params.studentid);
  const val = [studentid];
  try {
    const results = await queries.getStudentData(val);
    return res.status(200).send(results.rows);
  } catch (err) {
    throw err;
  }
}

// adding a new student async await
async function createUser(req, res) {
  var { firstname, lastname, doj, program, contact, courseids } = req.body;
  // courseids = JSON.parse(courseids);
  const val = [firstname, lastname, doj, program, contact, courseids];
  try {
    const results = await queries.addStudent(val);
    return res
      .status(201)
      .send(`student added with ID: ${results.rows[0].studentid}`);
  } catch (error) {
    throw error;
  }
}

//updating a user async await
async function updateUser(req, res) {
  const studentid = parseInt(req.body.studentid);

  console.log("student id  :  ", studentid);
  const { firstname, lastname, doj, program, contact } = req.body;
  var { courseids } = req.body;
  // courseids = JSON.parse(courseids);
  const val = [
    firstname,
    lastname,
    doj,
    program,
    contact,
    courseids,
    studentid,
  ];
  try {
    const results = await queries.updateStudent(val);
    console.log("results :  ", results);
    return res.status(200).send(`student modified with ID: ${studentid}`);
  } catch (error) {
    throw error;
  }
}

// deleting a user async await
async function deleteUser(req, res) {
  console.log("res in deleteuser :  ",res)
  const studentid = parseInt(req.body.studentid);
  console.log(studentid);
  val = [studentid];
  console.log("fetched student id from body : ", studentid, val);
  try {
    queries.deleteStudent(val);
    // console.log("after executing query res is : ", res );

    res.status(200).send(`Student deleted with ID: ${studentid}`);
  } catch (error) {
    throw error;
  }
}

//deleting all student async await
async function deleteAll(req, res) {
  var val = 1;
  try {
    const results = await queries.deleteAllData(val);
    res.send({ status: 200, result: "table emptied " });
  } catch (error) {
    res.send({ status: 500 });
    return;
  }
}

//all student joined with subjects using callback
const getjoin = (req, res) => {
  const val = 1;
  queries.allStudentSubject(val, (error, results) => {
    if (error) {
      throw error;
    }
    res.status(200).json(results.rows);
  });
};

// getting a student's selected subjects using callback
const getsubjects = (req, res) => {
  const studentid = parseInt(req.params.studentid);
  const val = [studentid];
  queries.studentSubject(val, (error, results) => {
    if (error) {
      throw error;
    }
    res.status(200).send(results.rows);
  });
};

// exporting necessary modules
module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  deleteAll,
  getjoin,
  getsubjects,
};

//EOL

// const pool = require('../config/dbconnection.js').pool;
// const deleteAllData = 'TRUNCATE TABLE student RESTART IDENTITY';
// const pool = require('../config/dbconnection.js').pool;
// const queries = require('../model/queries.js');  //working1

//  IGNORE THIS SECTION working 1
//  const getUsers = (req, res) => {
//   const {order_by} = req.body;
//   const queryy =  'SELECT * FROM student ORDER BY '+ order_by +' ASC' ;
//   pool.query(queryy, (error, results) => {
//     if (error) {
//       throw error;
//     }
//     res.status(200).json(results.rows);
//   });
// };

// with CALLBACKS
// const getUsers = (req, res) => {
//     const {order_by} = req.body;
//     val = [order_by];
//     queries.getAllStudentData(val , (error, results)=>{
//             if(error){
//                 throw error ;
//             }
//             res.status(200).json(results.rows);
//     });
// };

// const getUserById = (req, res) => {
//   const studentid = parseInt(req.params.studentid);
//   pool.query('SELECT * FROM student WHERE studentid = $1', [studentid], (error, results) => {
//     if (error) {
//       throw error;
//     }
//     res.status(200).json(results.rows);
//   });
// };

// pool.query('INSERT INTO student ( firstname, lastname, doj,program, contact, courseids) VALUES ($1, $2, $3, $4,$5, $6) RETURNING studentid',
//  [ firstname, lastname, doj,program, contact, courseids], (error, results) => {
//   if (error) {
//     throw error;
//   }
//   res.status(201).send(`student added with ID: ${results.rows[0].studentid}`);
// });

// const updateUser = (req, res) => {
//   const studentid = parseInt(req.params.studentid);
//   const { firstname, lastname, doj,program, contact } = req.body;
//   var {courseids} = req.body;
//   courseids = JSON.parse(courseids);

//   pool.query(
//     'UPDATE student SET firstname = $1, lastname= $2, doj= $3,program= $4, contact= $5  , courseids = $6 WHERE studentid = $7',
//     [ firstname, lastname, doj,program, contact,courseids , studentid],
//     (error, results) => {
//       if (error) {
//         throw error;
//       }
//       res.status(200).send(`student modified with ID: ${studentid}`);
//     }
//   );
// };

// pool.query('DELETE FROM student WHERE studentid = $1', [studentid], (error, results) => {
//   if (error) {
//     throw error;
//   }
//   res.status(200).send(`Student deleted with ID: ${studentid}`);
// });

// IGNORE THIS PART working 1
// const deleteAll = (req,res)=> {
//   pool.query(queries.deleteAllData, (error, results)=> {
//     if(error){
//       throw error;
//     }
//     res.status(200).send('table has been emptied.');
//   });
// };

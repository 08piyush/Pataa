const Pool = require('pg').Pool;
const pool = new Pool({
  user: 'ec2-user',
  host: 'localhost',
  database: 'pataaDB',
  password: '',
  port: 5432,
});
console.log(" connections is fine ... ")
module.exports ={
    pool} ;

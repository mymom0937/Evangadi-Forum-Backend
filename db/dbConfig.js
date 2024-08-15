// const mysql2 = require("mysql2");

// const dbConnection = mysql2.createPool({
//   user: process.env.USER,
//   database: process.env.DATABASE,
//   host: "localhost",
//   password: process.env.PASSWORD,
//   connectionLimit: 10,
// });

// // dbConnection.execute("select'test'", (error, result) => {
// //   if (error) {
// //     console.log(error.message);
// //   } else {
// //     console.log(result);
// //   }
// // });

// module.exports = dbConnection.promise();

//  Yegara Configuration
const mysql2 = require("mysql2");
require("dotenv").config();
const dbConnection = mysql2.createPool({
  user: process.env.USER, // MySQL username from environment variables
  host: process.env.HOST || "109.70.148.48", // Default to the IP if HOST is not set in environment variables
  database: process.env.DATABASE, // MySQL database name from environment variables
  password: process.env.PASSWORD, // MySQL password from environment variables
  waitForConnections: true, // Wait for connections to be released before returning errors
  connectionLimit: 10, // Maximum number of connections to create at once
  queueLimit: 0, // Maximum number of connection requests the pool will queue before returning an error
});

// console.log(process.env.USER);
// console.log(process.env.DATABASE);
// console.log(process.env.HOST);
// console.log(process.env.PASSWORD);
// dbConnection.execute("select'test'", (error, result) => {
//   if (error) {
//     console.log(error.message);
//   } else {
//     console.log(result);
//   }
// });

module.exports = dbConnection.promise();

 require("dotenv").config();
const express = require("express");
const app = express();
// const PORT = 5000;
const cors = require("cors");

// Use the PORT environment variable or fallback to 5000
const PORT = process.env.PORT || 3306;
// console.log(process.env.PORT);

app.use(cors());
// db Connection
const dbConnection = require("./db/dbConfig.js");

// authentication middleware file
const authMiddleware = require("./middleware/authMiddleware.js");

// json middleware to extract json data
app.use(express.json());

// Middleware to parse JSON bodies
app.use(express.json());

// user routes middleware file
const userRoutes = require("./routes/userRoutes.js");
// user routes middleware
app.use("/api/user", userRoutes);

// question routes middleware file
const questionRoutes = require("./routes/questionRoutes.js");
// question routes middleware
app.use("/api/question", authMiddleware, questionRoutes);

// answer routes middleware file
const answerRoutes = require("./routes/answerRoutes.js");
// answer routes middleware
app.use("/api/answer", authMiddleware, answerRoutes);

//  To check successful backend deployed start here*********
app.get("/", (req, res) => {
  res.status(200).json({
    Message: "Successfully backend deployed!",
  });
}); 

// To check successful backend deployed end here*********
async function start() {
  try {
    const result = await dbConnection.execute("select 'test' ");
    await app.listen(PORT);
    console.log("Database connection established");
    console.log(`listening on ${PORT}`);
  } catch (error) {
    console.log(error.message);
  }
}
start();

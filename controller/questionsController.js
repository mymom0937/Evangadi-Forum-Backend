//Import  db Connection
const dbConnection = require("../db/dbConfig.js");
//Import  https-status-codes module
const { StatusCodes } = require("http-status-codes");

// Function to create a new (single) question
async function postNewQuestion(req, res) {
  const { title, description, tag } = req.body;
  const { userid } = req.user;

  if (!req.body.title || !req.body.description || !userid) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: "Bad Request",
      message: "Please provide all required fields",
    });
  }
  // try {
  //   // Check if a question with the same title and description already exists in the database of questions table
  //   await dbConnection.query(
  //     "SELECT title, description FROM questionTabel WHERE title = ? AND description = ?",
  //     [title, description]
  //   );

  //   // Generate a unique questionid using a combination of timestamp and a random number
  //   const timestamp = Date.now();
  //   const randomId = Math.floor(Math.random() * 1000);
  //   const questionid = `${timestamp}-${randomId}`;
  //   // console.log(questionid);

  //   await dbConnection.query(
  //     "INSERT INTO questionTabel (questionid,userid,title, description,tag) VALUES (?,?,?, ?, ?)",
  //     [questionid, userid, title, description, tag]
  //   );

  //   // Return a 201 created response if the question is successfully inserted
  //   return res.status(StatusCodes.CREATED).json({
  //     message: "Question created successfully",
  //     questionid: questionid,
  //   });
  // } catch (error) {
  //   // Log and return a 500 internal server error response if an error occurs
  //   console.log(error.message);
  //   res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
  //     error: "Internal Server Error",
  //     message: "An unexpected error occurred.",
  //   });
  // }
  try {
    // Check if a question with the same title and description already exists
    const [existingQuestions] = await dbConnection.query(
      "SELECT title, description FROM questionTable WHERE title = ? AND description = ?",
      [title, description]
    );

    if (existingQuestions.length > 0) {
      return res.status(StatusCodes.CONFLICT).json({
        error: "Conflict",
        message:
          "A question with the same title and description already exists.",
      });
    }

    // Generate a unique questionid
    const timestamp = Date.now();
    const randomId = Math.floor(Math.random() * 1000);
    const questionid = `${timestamp}-${randomId}`;

    // Insert the new question into the database
    await dbConnection.query(
      "INSERT INTO questionTable (questionid, userid, title, description, tag) VALUES (?, ?, ?, ?, ?)",
      [questionid, userid, title, description, tag]
    );

    // Return a 201 created response
    return res.status(StatusCodes.CREATED).json({
      message: "Question created successfully",
      questionid: questionid,
    });
  } catch (error) {
    console.error("Error creating question:", error.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred.",
    });
  }
}
// Function to get ALL questions from database
async function getAllQuestions(req, res) {
  try {
    // Query the database to select all questions
    const [questions] = await dbConnection.query(
      "SELECT questionTable.questionid as question_id, questionTable.title, questionTable.description as content, userTable.username as user_name,questionTable.created_at FROM questionTable JOIN userTable ON questionTable.userid = userTable.userid ORDER BY questionTable.created_at DESC "
    );
    // Check if no questions were found
    if (questions.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: "Not Found",
        message: "No questions found.",
      });
    }
    // Return a 200 OK response with the list of questions
    return res.status(StatusCodes.OK).json({ questions: questions });
  } catch (error) {
    // Log and return a 500 (OR) internal server error response if an error occurs
    console.log(error.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred.",
    });
  }
}

async function getSingleQuestion(req, res) {
  // Destructure the questionid from the request parameters
  const { question_id } = req.params;
  try {
    // Query the database to select the question with the specified questionid
    const [question] = await dbConnection.query(
      "SELECT questionTable.questionid as question_id, questionTable.title, questionTable.description as content, userTable.userid as user_id,questionTable.created_at FROM questionTable JOIN userTable ON questionTable.userid = userTable.userid WHERE questionid = ?",
      [question_id]
    );
    // Check if no question was found on the dataBase
    if (question.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: "Not Found",
        message: "The requested question could not be found.",
      });
    }
    // Return a 200 OK response with the question
    res.status(StatusCodes.OK).json({ question: question[0] }); // Assuming you return a single question
  } catch (error) {
    // Log the error
    console.error(error);
    // Return a 500 internal server error response with an error message
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred.",
    });
  }
}

// Export the functions so they can be used in other parts of the application
module.exports = { postNewQuestion, getAllQuestions, getSingleQuestion };

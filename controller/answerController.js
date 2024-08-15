// db Connection
const dbConnection = require("../db/dbConfig.js");
// https-status-codes module
const { StatusCodes } = require("http-status-codes");

/************************************************************************************** */
/******************************POST ANSWER*********************************************/
/**************************************************************************************/
async function postAnswer(req, res) {
  const { answer, questionid } = req.body;
  const { userid } = req.user;
  // const { questionid } = req.params;

  if (!answer || !questionid) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: "Bad Request",
      message: "Please provide answer",
    });
  }
  try {
    const [answerResponse] = await dbConnection.query(
      "INSERT INTO answerTable (answer, userid, questionid) VALUES (?,?,?)",
      [answer, userid, questionid]
    );
    const answerid = answerResponse.insertId; // Get the auto-generated questionid

    // await dbConnection.query(
    //   "INSERT INTO answerTable (answer, userid, questionid) VALUES (?,?,?)",
    //   [answer, userid, questionid]
    // );
    // // generate a random number for the answerid
    // const answerid = Math.floor(Math.random() * 1000000000);

    // Created (201) (successful) response if the question is successfully inserted
    return res.status(StatusCodes.CREATED).json({
      message: "Answer posted successfully",
      answerid: answerid,
    });
  } catch (error) {
    console.log(error.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred.",
    });
  }
}

/************************************************************************************** */
/******************************FETCH ANSWERS*********************************************/
/**************************************************************************************/
async function getAnswer(req, res) {
  const { question_id } = req.params;
  if (!question_id) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: "Not Found",
      message: "The requested question could not be found.",
    });
  }

  try {
    const [results] = await dbConnection.query(
      "SELECT answerTable.answerid as answer_id, answerTable.answer as content, userTable.username as user_name, answerTable.created_at FROM answerTable JOIN userTable ON answerTable.userid = userTable.userid  WHERE questionid = ? ORDER BY answerTable.created_at DESC",
      [question_id]
    );

    if (!results.length) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: "Not Found",
        message: "The requested question could not be found.",
      });
    }
    return res.status(StatusCodes.OK).json({ answers: results });
  } catch (error) {
    console.log(error.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred.",
    });
  }
}

module.exports = { postAnswer, getAnswer };

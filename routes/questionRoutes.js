const express = require("express");
const router = express.Router();

// Import the functions(Logics) which related to questions from the questionController module
const {
  postNewQuestion,
  getAllQuestions,
  getSingleQuestion,
} = require("../controller/questionsController.js");

// Route for creating a new question. 
router.post("/", postNewQuestion);

// Route for fetching all questions.
router.get("/", getAllQuestions);

// Route for fetching single question.
router.get("/:question_id", getSingleQuestion);

// Export the router to make it available for use in your Express application.
module.exports = router;

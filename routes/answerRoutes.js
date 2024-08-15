const express = require("express");
const router = express.Router();

const {
  postAnswer,
  getAnswer,
} = require("../controller/answerController.js");

router.post("/", postAnswer);

router.get("/:question_id", getAnswer);

module.exports = router;

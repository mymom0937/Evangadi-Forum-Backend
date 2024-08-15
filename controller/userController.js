// db Connection
const dbConnection = require("../db/dbConfig.js");
const bcrypt = require("bcrypt");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");


/************************************************************************************** */
/******************************UserRegister*********************************************/
/************************************************************************************** */
async function register(req, res) {
  const {
    username,
    first_name,
    last_name,
    email,
    password,
    resetToken,
    resetTokenExpiry,
  } = req.body;
  if (!username || !first_name || !last_name || !email || !password) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Please provide all required fields",
    });
  }
  try {
    const [user] = await dbConnection.query(
      "select username,userid from userTable where username=? or email=?",
      [username, email]
    );
    if (user.length > 0) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "User already existed" });
    }
    if (password.length <= 8) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Password must be at least 8 characters",
      });
    }
    //  encrypt the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await dbConnection.query(
      "INSERT INTO userTable(username, first_name, last_name, email, password,resetToken,resetTokenExpiry) VALUES(?,?,?,?,?,?,?)",
      [
        username,
        first_name,
        last_name,
        email,
        hashedPassword,
        resetToken,
        resetTokenExpiry,
      ]
    );
    return res
      .status(StatusCodes.CREATED)
      .json({ message: "User registered successfully" });
  } catch (error) {
    console.log(error.message);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "An unexpected error occurred." });
  }
}

/************************************************************************************** */
/******************************Login user*********************************************/
/************************************************************************************** */
async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Please provide all required fields" });
  }
  try {
    const [user] = await dbConnection.query(
      "SELECT username,userid,password FROM userTable WHERE email=?",
      [email]
    );
    console.log(user);
    if (user.length === 0) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Please provide all required fields" });
    }
    // Compare password
    const isMatch = await bcrypt.compare(password, user[0].password);
    if (!isMatch) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "invalid credential!" });
    }

    const username = user[0].username;
    const userid = user[0].userid;
    const token = jwt.sign({ username, userid }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    return res
      .status(StatusCodes.OK)
      .json({ message: "User login successfully", token, username });
  } catch (error) {
    console.log(error.message);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "An unexpected error occurred." });
  }
}

/************************************************************************************** */
/******************************check user's authentication*******************************/
/************************************************************************************** */
async function checkUser(req, res) {
  try {
    const username = req.user.username;
    const userid = req.user.userid;
    // const { username, userid } = req.user;
    return res
      .status(StatusCodes.OK)
      .json({ message: "Valid user", username, userid });
  } catch (error) {
    console.log(error.message);
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Authentication invalid" });
  }
}

/************************************************************************************** */
/******************************resetPassword*********************************************/
/************************************************************************************** */
async function resetPassword(req, res) {
  const { email } = req.body;
  if (!email) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Please provide an email address" });
  }

  try {
    // Check if the user exists
    const [user] = await dbConnection.query(
      "SELECT userid, username FROM userTable WHERE email=?",
      [email]
    );

    if (user.length === 0) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "No account found with this email" });
    }

    const { userid, username } = user[0];

    // Generate a token
    const token = jwt.sign({ username, userid }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Set the expiration timestamp (1 hour from now)
    const expiration = Date.now() + 3600000; // 1 hour in milliseconds

    // Store the token and expiration in the database
    await dbConnection.query(
      "UPDATE userTable SET resetToken=?, resetTokenExpiry=? WHERE email=?",
      [token, expiration, email]
    );

    // Create a transporter for sending emails
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.APP_PASSWORD,
      },
      logger: true, // Enable logging
      debug: true,
    });

    // Create the reset link
    const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;

    // Send the reset email
    await transporter.sendMail({
      to: email,
      subject: "Password Reset Request",
      html: `<p>You requested a password reset. Click <a href="${resetLink}">here</a> to reset your password. The link will expire in 1 hour.</p>`,
    });

    res
      .status(StatusCodes.OK)
      .json({ message: "Password reset instructions sent to your email" });
  } catch (error) {
    console.log(error.message);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Something went wrong, try again later!" });
  }
}

module.exports = { register, login, checkUser, resetPassword };

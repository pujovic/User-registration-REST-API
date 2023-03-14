const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const {
  isValidName,
  isValidUserName,
  isValidPassword,
  isValidEmail,
} = require("../util/validation");
const { issueJWT, verifyJWT } = require("../util/authentication");

// Getting a single user account
router.get("/:id", verifyJWT, getUser, (req, res) => {
  res.json(res.user);
});

// Creating a new user account
router.post("/", async (req, res) => {
  let errors = {};

  if (!isValidEmail(req.body.email)) {
    errors.email = "Invalid email.";
  } else {
    try {
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) {
        errors.email = "User with this email address already exists.";
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  if (!isValidUserName(req.body.userName)) {
    errors.username = "Invalid username.";
  } else {
    try {
      const existingUser = await User.findOne({ userName: req.body.userName });
      if (existingUser) {
        errors.username = "Username not available.";
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  if (!isValidName(req.body.name)) {
    errors.name = "Invalid name.";
  }

  if (!isValidPassword(req.body.password)) {
    errors.pasword = "Invalid password.";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(422).json({
      message: "Adding the user failed due to validation errors.",
      errors,
    });
  }

  //Password hashing
  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash(req.body.password, salt);

  const user = new User({
    name: req.body.name,
    email: req.body.email,
    userName: req.body.userName,
    password: password,
  });

  try {
    const newUser = await user.save();
    res.status(201).json({ message: "User created." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Updating a single user account
router.patch("/:id", verifyJWT, getUser, async (req, res) => {
  let errors = {};

  if (req.body.name != null) {
    if (!isValidName(req.body.name)) {
      errors.title = "Invalid name.";
    }
    res.user.name = req.body.name;
  }
  if (req.body.email != null) {
    if (!isValidEmail(req.body.email)) {
      errors.title = "Invalid email.";
    }
    res.user.email = req.body.email;
  }
  if (req.body.userName != null) {
    if (!isValidUserName(req.body.userName)) {
      errors.title = "Invalid username.";
    }
    res.user.userName = req.body.userName;
  }
  if (req.body.password != null) {
    if (!isValidPassword(req.body.password)) {
      errors.title = "Invalid password.";
    }
    res.user.password = req.body.password;
  }

  if (Object.keys(errors).length > 0) {
    return res.status(422).json({
      message: "Updating the user failed due to validation errors.",
      errors,
    });
  }

  try {
    const updatedUser = await res.user.save();
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Deleting a single user's account
router.delete("/:id", verifyJWT, getUser, async (req, res) => {
  try {
    await res.user.deleteOne();
    res.json({ message: "Account successfully deleted." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//Login
router.post("/login", async (req, res) => {
  const isUsername = isValidUserName(req.body.loginName)
    ? req.body.loginName
    : null;
  //Users can provide their username or email
  try {
    let user = isUsername
      ? await User.findOne({ userName: req.body.loginName })
      : await User.findOne({ email: req.body.loginName });

    if (!user) {
      return res.status(400).json({
        message: "Cannot find user with the provided username/e-mail address",
      });
    } else {
      //compare the provided password with the one hased and stored in the database
      if (await bcrypt.compare(req.body.password, user.password)) {
        const tokenObj = issueJWT(user); //issue a jsonwebtoken based on the user's email address
        res
          .status(200)
          .json({ token: tokenObj.token, expiresIn: tokenObj.expires });
      } else {
        res.status.apply(401).json({ message: "Wrong password!" });
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//Middleware for searching the database for a single user by id
async function getUser(req, res, next) {
  let user;
  try {
    user = await User.findById(req.params.id);

    if (user == null) {
      return res.status(404).json({ message: "Cannot find user" });
    }
  } catch (error) {
    if (user == null) {
      return res.status(404).json({ message: "Cannot find user" });
    }
    return res.status(500).json({ message: error.message });
  }

  res.user = user;
  next();
}

module.exports = router;

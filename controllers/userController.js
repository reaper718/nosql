const Users = require("../models/users");
const jwt = require('jsonwebtoken');

const addUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const newUser = new Users({
      name: name,
      email: email,
      password: password,
      cart: [],
    });

    await newUser.save();

    return res.status(201).json({
      success: true,
      message: "User created successfully!!!",
      user: newUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error: error,
    });
  }
};

const getUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Users.findOne({
      email: email,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User does not exist"
      });
    }

    const isValidPassword = user.password === password;

    if (!isValidPassword) {
      return res.status(403).json({
        success: false,
        message: "Incorrect password",
      });
    }

    const token = jwt.sign({id: user._id}, 'secretKey');

    return res.status(200).json({
      success: true,
      message: "User logged in successfully!!!",
      token: token
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error: error,
    });
  }
};

module.exports = {
  addUser,
  getUser,
};
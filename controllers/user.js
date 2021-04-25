const bcrypt = require('bcrypt'),
  fs = require('fs'),
  jwt = require('jsonwebtoken'),
  mongoose = require('mongoose'),
  path = require('path'),
  secret = require('../config').secret;

const uploadFile = require("../middlewares/upload")
const UserModel = require('../models/user')

const createUser = async (req, res) => {
  const { username, password, firstName, lastName } = req.body.user

  if (!username || !password || !firstName || !lastName) {
    return res.sendStatus(400)
  }

  const usernameRegex = new RegExp("^[A-Za-z0-9_]{6,12}$");
  const passwordRegex = new RegExp("^(?=.*[a-zA-Z])(?=.*[0-9])(?=.{6,})");
  if (!usernameRegex.test(username) || !passwordRegex.test(password)) {
    return res.sendStatus(400)
  }

  try {
    const user = new UserModel(req.body.user)

    user.hash = bcrypt.hashSync(password, 10)
    user.hashRecords.unshift(user.hash)

    await user.save()

    const today = new Date();
    const exp = new Date(today);
    exp.setDate(today.getDate() + 60)

    token = await jwt.sign({
      id: user._id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      exp: parseInt(exp.getTime() / 1000),
    }, secret)

    return res.status(201).json({
      user: {
        _id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        token: token,
      }
    })
  } catch (error) {
    switch (true) {
      case error.code && error.code === 11000:
        return res.sendStatus(409);
      default:
        return res.sendStatus(500);
    }
  }
}

const getUser = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.sendStatus(400)
  }

  try {
    const user = await UserModel.findById(req.params.id).select("-hash -hashRecords")
    if (!user) {
      return res.sendStatus(404)
    }

    return res.json({ user: user })
  } catch (error) {
    return res.sendStatus(500);
  }
}

const getUserProfile = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.sendStatus(400)
  }

  try {
    const user = await UserModel.findById(req.params.id)

    fs.readFile(path.resolve(path.dirname('')) + `/public/profiles/${user.profile}`, (err, file) => {
      if (err) {
        res.status(500)
      }

      return res.writeHead(200, { 'Content-Type': 'image/jpeg' }).end(file)
    });
  } catch (error) {
    return res.sendStatus(500)
  }
}

const updateUser = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.sendStatus(400)
  }

  try {
    const { username, firstName, lastName } = req.body.user

    if (!username || !firstName || !lastName) {
      return res.sendStatus(400)
    }

    await UserModel.findByIdAndUpdate(req.params.id, { $set: req.body.user })

    return res.sendStatus(200)
  } catch (error) {
    switch (true) {
      case error.code && error.code === 11000:
        return res.sendStatus(409);
      default:
        return res.sendStatus(500);
    }
  }
}

const updateUserPassword = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.sendStatus(400)
  }

  try {
    const { password } = req.body

    if (!password) {
      return res.sendStatus(400)
    }

    const passwordRegex = new RegExp("^(?=.*[a-zA-Z])(?=.*[0-9])(?=.{6,})");
    if (!passwordRegex.test(password)) {
      return res.sendStatus(400)
    }

    const user = await UserModel.findById(req.params.id)
    if (!user) {
      return res.sendStatus(404)
    }

    const isUsed = await user.hashRecords.some(hash => {
      if (bcrypt.compareSync(password, hash)) return true
      else return false
    })

    if (isUsed) {
      return res.sendStatus(409)
    }

    let newHash = bcrypt.hashSync(password, 10)
    await user.hashRecords.unshift(newHash)

    if (user.hashRecords.length > 5) {
      user.hashRecords.pop()
    }

    await UserModel.findByIdAndUpdate(req.params.id, { hash: newHash, hashRecords: user.hashRecords })

    return res.sendStatus(200)
  } catch (error) {
    return res.sendStatus(500)
  }
}

const updateUserProfile = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.sendStatus(400)
  }

  try {
    await uploadFile(req, res);

    if (req.file == undefined) {
      return res.sendStatus(400);
    }

    await UserModel.findByIdAndUpdate(req.params.id, { profile: req.file.filename })

    return res.sendStatus(200);
  } catch (err) {
    return res.sendStatus(500);
  }
}

const deleteUser = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.sendStatus(400)
  }

  try {
    await UserModel.findByIdAndDelete(req.params.id)

    return res.sendStatus(200)
  } catch (error) {
    return res.sendStatus(500)
  }
}

const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.sendStatus(400)
    }

    const user = await UserModel.findOne({ username })

    if (!user) {
      return res.sendStatus(404)
    }

    const isCorrect = bcrypt.compareSync(password, user.hash)
    if (!isCorrect) {
      return res.sendStatus(401)
    }

    const today = new Date();
    const exp = new Date(today);
    exp.setDate(today.getDate() + 60)

    const token = await jwt.sign({
      _id: user._id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      exp: parseInt(exp.getTime() / 1000),
    }, secret)

    return res.json({
      user: {
        _id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        token: token,
      }
    })
  } catch (error) {
    return res.sendStatus(500)
  }
}

module.exports = {
  createUser,
  getUser,
  getUserProfile,
  updateUser,
  updateUserPassword,
  updateUserProfile,
  deleteUser,
  loginUser
};
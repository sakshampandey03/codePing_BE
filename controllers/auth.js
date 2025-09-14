import { User } from "../models/userModel.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const login = async (req, res) => {
  try {
    const { name, email, avatar } = req.body;
    console.log(req.body);
    let user;
    user = await User.findOne({ email });
    if (!user) {
      const newUser = new User({
        name,
        email,
        avatar,
      });
      await newUser.save();
      user = newUser;
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name, avatar: user.avatar },
      process.env.JWT_SECRET
    );
    res.cookie("access-token", token, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });

    res.status(200).json({
      success: true,
      message: "login successful",
      user,
    });
  } catch (error) {
    console.log("error in login ", error);
    res.status(500).json({
      success: false,
      error,
    });
  }
};
const logout = async (req, res) => {
  try {
    res.clearCookie("access-token", {
      httpOnly: true,
    });
    return res.status(200).json({
      success: true,
      message: "logged out successfully",
    });
  } catch (error) {
    console.log("error in logout controller ", error);
    return res.status(500).json({
      success: false,
      message: "error in logout backend",
    });
  }
};

const getUser = async (req, res) => {
  try {
    const token = req.cookies["access-token"];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "unauthorized access",
      });
    }
    const user = jwt.verify(token, process.env.JWT_SECRET);
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log("error in getting user ", error);
    res.status(500).json({
      success: false,
      error,
    });
  }
};

export { getUser, login, logout };

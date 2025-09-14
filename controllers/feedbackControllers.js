

import {Feedback}  from "../models/feedback.js";


export const submitFeedback = async (req, res) =>{
  try {
    const {name, email, subject, message} = req.body;
    if(!name || !message || !email){
      return res.status(400).json({
        success:false,
        message:"incomplete data at feedback"
      })
    }
    await Feedback.create({
      name, email, subject, message
    })
    return res.status(200).json({
      success:true,
      message:"feedback saved successfully"
    })
  } catch (error) {
    console.log("error in submitting feedback", error);
    return res.status(500).json({
      success: false,
      message: "could not send submit Feedback",
    });
  }
}

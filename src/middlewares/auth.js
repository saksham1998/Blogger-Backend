const jwt = require("jsonwebtoken");
const User = require("../../db/models/User");
require("dotenv").config();

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const data = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: data.id, "tokens.token": token });

    if (!user) {
      throw new Error("Please Give a valid token for accessing this route");
    } else {
      req.user = user;
      req.token = token;
      next();
    }
  }
  catch(e){
    res.status(404).send({message:e.message,user:null,token:null})
  }
};

module.exports = auth;

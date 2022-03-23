const USER = require("../user/user.model");
const DP_USER = require("../user/dp-user.model");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
var {OAUTH_SECRET} = require("../../config");

// Normal Login for the Application/Admin panel
exports.login = async (req, res) => {
  try {
    let body = req.body;

    if (body.email && body.password) {
      
      // Find user to see if it exists
      let user = await fetchUser(body.email);       
      console.log("User found", user);  
      // return false;               
      if (user) {        
        if (bcrypt.compareSync(body.password, user['password'])) {
          // If exists , createe token for the user
          let token = await createAndSaveToken(user);
          // Send token and other things to FE.
          return res.json({ success: true,
                            message: "user logged in!",
                            data: { token: token,
                                    email: user.email,
                                    firstName: user.firstName,
                                    lastName: user.lastName,
                                    isSU: user.type == 'root' ? true : false,
                                    loginType: user.loginType,
                                    organization: user.organization}});
        } else {
          // Incorrect password
          return res.json({success: false, data: "", message: "Incorrect password"});
        }
      } else {
        // No user found
        return res.json({success: false, data: "", message: "Not able to login. Please try again later"});
      }
    } else {
      return res.json({success:false, data:"", message: "Email and Password required"});
    }
  } catch (err) {
    return res.json({success: false, message: err, data: ""});
  }
}

// Login for the Call logs
exports.loginForCallLogspepperstone = async (req, res) => {
  try {
    let body = req.body;

    if (body.username && body.password) {
      let user = await fetchCallLogUserPepper(body.username);

      if (user) {
        if (bcrypt.compareSync(body.password, user['password'])) {
          let token = await createAndSaveTokenForDPUserPepper(user);

          // Send token and other things to FE.
          return res.json({ success: true,
                            message: "user logged in!",
                            data: {"authToken": token}});
        } else {
          // Incorrect password
          return res.json({success: false, data: "", message: "Incorrect password"});
        }
      } else {
        // No user found
        return res.json({success: false, data: "", message: "Not able to login. Please try again later"});
      }
    } else {
      return res.json({success:false, data:"", message: "Email and Password required"});
    }
  } catch (err) {
    return res.json({success: false, message: err, data: ""});
  }
}

exports.loginForCallLogs = async (req, res) => {
  try {
    let body = req.body;

    if (body.username && body.password) {
      let user = await fetchCallLogUser(body.username);

      if (user) {
        if (bcrypt.compareSync(body.password, user['password'])) {
          let token = await createAndSaveTokenForDPUser(user);

          // Send token and other things to FE.
          return res.json({ success: true,
                            message: "user logged in!",
                            data: {"authToken": token}});
        } else {
          // Incorrect password
          return res.json({success: false, data: "", message: "Incorrect password"});
        }
      } else {
        // No user found
        return res.json({success: false, data: "", message: "Not able to login. Please try again later"});
      }
    } else {
      return res.json({success:false, data:"", message: "Email and Password required"});
    }
  } catch (err) {
    return res.json({success: false, message: err, data: ""});
  }
}

async function fetchCallLogUser(email) {
  let userQuery = {email: email, softDelete: false, enableLogin: true};

  let user  = await DP_USER.findOne(userQuery, "firstName lastName email token password");
  return user;
}

async function fetchCallLogUserPepper(email) {
  let userQuery = {email: email, softDelete: false, enableLogin: true};

  let user  = await USER.findOne(userQuery, "firstName lastName email token password");
  return user;
}

async function createAndSaveTokenForDPUser(user) {
  var token = jwt.sign({_id: user['_id'], email: user.email}, OAUTH_SECRET);
  var tokenArray = [token];
   
  await DP_USER.findByIdAndUpdate({_id: user['_id'], softDelete: false}, {"$set": {token: tokenArray}});
  return token;
}
async function createAndSaveTokenForDPUserPepper(user) {
  var token = jwt.sign({_id: user['_id'], email: user.email}, OAUTH_SECRET);
  var tokenArray = [token];
   
  await USER.findByIdAndUpdate({_id: user['_id'], softDelete: false}, {"$set": {token: tokenArray}});
  return token;
}

async function fetchUser(email) {
  let userQuery = {email: email, softDelete: false, enableLogin: true};

  let user  = await USER.findOne(userQuery, 
                                  "firstName lastName email token role organization branch password type loginType")
                        .populate("organization")

  return user;
}

async function createAndSaveToken(user) {
  var token = jwt.sign({_id: user['_id'], email: user.email}, OAUTH_SECRET);
  var tokenArray = [];

  if (user.token && user.token.length) {
    tokenArray = user.token;
  }
  tokenArray.push(token);    
  await USER.findByIdAndUpdate({_id: user['_id'], softDelete: false}, {"$set": {token: tokenArray}});

  return token;
}


// Logout from the Admin Panel
exports.logout = async (req, res) => {
  try {
    let user = req.user;
    if (user && user._id) {
      let retDoc = await USER.update({_id: user._id, softDelete: false}, {"$pull" : {token: user.token}});

      if (retDoc && retDoc.nModified) {
        return res.json({success: true, data:"", message:"Logged out"});
      } else {
        return res.json({success: false, data:"", message: "Something went wrong. Please try again later"});
      }
    } else {
      return res.json({success: false, data:"", message: "User doesn't exist"});
    }
  } catch (err) {
    console.log("Error while logging out", err);
    return res.json({success: false, data: "", message: err});
  }
}

exports.logoutpepperstone = async (req, res) => {
  try {
    let user = req.user;
    if (user && user._id) {
      let retDoc = await USER.update({_id: user._id, softDelete: false}, {"$pull" : {token: user.token}});

      if (retDoc && retDoc.nModified) {
        return res.json({success: true, data:"", message:"Logged out"});
      } else {
        return res.json({success: false, data:"", message: "Something went wrong. Please try again later"});
      }
    } else {
      return res.json({success: false, data:"", message: "User doesn't exist"});
    }
  } catch (err) {
    console.log("Error while logging out", err);
    return res.json({success: false, data: "", message: err});
  }
}
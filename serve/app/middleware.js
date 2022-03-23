const USER = require("./user/user.model");
const DP_USER = require("./user/dp-user.model");
const ROLE = require("./role/role.model");
var {OAUTH_SECRET} = require("../config");
var jwt = require("jsonwebtoken");

let middleware = {
  // Check the token for the user
  checkAuth : (req, res, next) => {
      var token = req.body.token || req.query.token || req.headers.token;
      // decode token
      if (token) {
        // verifies secret and checks exp
        jwt.verify(token, OAUTH_SECRET, async function(err, decoded) {
          if (err) {
            return res.status(401).send({ message: "Authentication Failed. Please login again." });
          } else {
            // if everything is good, save to request for use in other routes
            req.user = decoded;

            if (decoded['email']) {
              let user = await USER.findOne({ _id: decoded['_id'], 
                                              email: decoded['email'], enableLogin: true,
                                              token: token, softDelete: false}, "email role organization branch type department subdepartment token");

              if (user) {
                req.user['_id'] = user['_id'];
                req.user['email'] = user['email'];
                req.user['role'] = user['role'];
                req.user['organization'] = user['organization'];   
                req.user['branch'] = user['branch'];
                req.user['department'] = user['department'];   
                req.user['token'] = token;       
                req.user['type'] = user['type'];      
                next();
              } else {
                return res.status(401).send({ message: "Authentication Failed. Please login again" });
              }
            } else {
              return res.status(401).send({ message: "Authentication Failed. Please login again" });
            } 
          }
        });
      } else {
        return res.status(401).send({ message: "Authentication Failed. Please login again" });
      }
  },
  checkAuthForCallLogspepper : (req, res, next) => {
    var token = req.body.token || req.query.token || req.headers['x-auth-token'];

    if (token) {
      // verifies secret and checks exp
      jwt.verify(token, OAUTH_SECRET, async function(err, decoded) {
        if (err) {
          return res.status(401).send({ message: "Authentication Failed. Please login again." });
        } else {

          // if everything is good, save to request for use in other routes
          req.user = decoded;

         

          if (decoded['email']) {
            let user = await USER.findOne({ _id: decoded['_id'], 
                                              email: decoded['email'],
                                              token: token, softDelete: false}, "email type organization token branch");

            if (user) {
              req.user['_id'] = user['_id'];
              req.user['email'] = user['email'];
              req.user['organization'] = user['organization'];  
              req.user['branch'] = user['branch'];  
              req.user['token'] = token;       
              req.user['type'] = user['type'];      
              next();
            } else {
              return res.status(401).send({ message: "Authentication Failed. Please login again" });
            }
          } else {
            return res.status(401).send({ message: "Authentication Failed. Please login again" });
          } 
        }
      });
    } else {
      return res.status(401).send({ message: "Authentication Failed. Please login again" });
    }
  },
  checkAuthForCallLogs : (req, res, next) => {
    var token = req.body.token || req.query.token || req.headers['x-auth-token'];

    if (token) {
      // verifies secret and checks exp
      jwt.verify(token, OAUTH_SECRET, async function(err, decoded) {
        if (err) {
          return res.status(401).send({ message: "Authentication Failed. Please login again." });
        } else {

          // if everything is good, save to request for use in other routes
          req.user = decoded;

         

          if (decoded['email']) {
            let user = await DP_USER.findOne({ _id: decoded['_id'], 
                                              email: decoded['email'],
                                              token: token, softDelete: false}, "email type organization token branch");

            if (user) {
              req.user['_id'] = user['_id'];
              req.user['email'] = user['email'];
              req.user['organization'] = user['organization'];  
              req.user['branch'] = user['branch'];  
              req.user['token'] = token;       
              req.user['type'] = user['type'];      
              next();
            } else {
              return res.status(401).send({ message: "Authentication Failed. Please login again" });
            }
          } else {
            return res.status(401).send({ message: "Authentication Failed. Please login again" });
          } 
        }
      });
    } else {
      return res.status(401).send({ message: "Authentication Failed. Please login again" });
    }
  },
  checkRole: async (roleId, roleName) => {
    try {
      if (roleName) {
        let roleDoc = await ROLE.findOne({_id: roleId, list: roleName});
        
        return (roleDoc ? true : false);
      } else {
        return false;
      } 
    } catch (err) {
      console.log("Error in fetching role", err);
      return false;
    }
  }
}

module.exports =  middleware;
const User = require("../models/user");
const jwt = require("jsonwebtoken"); // to generate signed token
const expressJwt = require("express-jwt"); // for authorization check
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.signUp = (req, res) => {

  const user = new User(req.body);

  user.save((error, user) => {
    if (error) {
      return res.status(400).json({
        error: {
          message: errorHandler(error)
        },
      });
    }

    // Ocultamos los datos sensibles de la respuesta
    user.salt = undefined;
    user.hashed_password = undefined;

    res.json({ user });
  });
};

exports.signIn = (req, res) => {

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      error: {
        message: "Debe ingresar su usuario y contraseña"
      },
    });
  }
  
  // find user by username
  User.findOne({ username }, (error, user) => {
    if (error || !user) {
      return res.status(400).json({
        error: {
          message: "Las credenciales ingresadas son incorrectas"
        },
      });
    }
    // if user is found we check password
    if (!user.authenticate(password)) {
        return res.status(401).json({
          error: {
            message: "Las credenciales ingresadas son incorrectas"
          }
        })
    }

    // generate signed token with user id and secret
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    // persist token as 't' in cookie with expirance date
    res.cookie("t", token, { expire: new Date() + 9999 });
    // return response with user and token to client
    const { _id, username, email, name, surname, role, discount } = user;
    return res.json({ token, user: { _id, username, email, name, surname, role, discount } });
  });
};

exports.signOut = (req, res) => {
    res.clearCookie('t');
    res.json({ message: "Se cerró la sesión" });
};

exports.requireSignIn = expressJwt({
    secret: process.env.JWT_SECRET,
    userProperty: "auth",
});

exports.isAuth = (req, res, next) => {

  // si es el usuario logueado
  let user = req.profile && req.auth && req.profile._id == req.auth._id;

  if (!user) {
    return res.status(403).json({
      error: {
        message: "Acceso denegado"
      },
    });
  } 

  next();
};

exports.isAdmin = (req, res, next) => {

  if (req.profile.role === 0) {
    return res.status(403).json({
      error: {
        message: "Recurso de administrador, acceso denegado"
      },
    });
  }
  
  next();
};

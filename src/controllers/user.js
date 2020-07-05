const { errorHandler } = require("../helpers/dbErrorHandler");
const User = require("../models/user");
const Sale = require("../models/sale");

exports.userById = (req, res, next, id) => {
  User.findById(id).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: {
          message: "User not found"
        },
      });
    }
    req.profile = user;
    next();
  });
};

exports.read = (req, res) => {
  req.profile.hashed_password = undefined;
  req.profile.salt = undefined;

  return res.json(req.profile);
};

// Devuelve el historial de compras del usuario y la deuda acumulada
exports.getHistory = (req, res) => {

  Sale.find({_id_user: req.profile._id})
  .exec((error, sales) => {
    if (error) {
      return res.status(400).json({
        error: {
          message: errorHandler(error)
        },
      });
    }
    res.json({
      history: sales,
      debt: req.profile.debt
    })
  });
};

exports.getOne = (req, res) => {

  const _id = req.query.id;

  if (!_id) {
    return res.status(400).json({
      error: {
        message: "User not found"
      },
    });
  }

  User.findById(_id)
  .exec((error, user) => {
    if (error) {
      return res.status(400).json({
        error: {
          message: errorHandler(error)
        },
      });
    }
    res.json(user);
  });
};

exports.list = (req, res) => {

  // EJEMPLO: /users?sortBy=username&role=0&order=asc&limit=10

  // Orden y limite de la busqueda
  const sortBy = req.query.sortBy ? req.query.sortBy : 'username';
  const order = req.query.order ? req.query.order : 'asc';
  const limit = req.query.limit ? parseInt(req.query.limit) : 0;

  // Filtros
  const filter = {};
  const role = req.query.role ? req.query.role : null;

  // Se agregan los filtros si fueron recibidos por parametro
  if (role) filter.role = role;

  User.find(filter)
  .sort([[sortBy, order]])
  .limit(limit)
  .exec((error, users) => {
    if (error) {
      return res.status(400).json({
        error: {
          message: errorHandler(error)
        },
      });
    }
    res.json(users);
  });
};

exports.remove = (req, res) => {

  const _id = req.query.id;

  if (!_id) {
    return res.status(400).json({
      error: {
        message: "User not found"
      },
    });
  }

  User.findById(_id)
  .exec((error, user) => {
    if (error) {
      return res.status(400).json({
        error: {
          message: errorHandler(error)
        },
      });
    }
    user.remove((error, deletedUser) => {
      if (error) {
        return res.status(400).json({
          error: {
            message: errorHandler(error)
          },
        });
      }
      res.json({
        message: `User '${deletedUser.username}' was successfully removed`,
        deletedUser,
      });
    });
  });
};

exports.update = (req, res) => {
  User.findOneAndUpdate(
    { _id: req.profile._id },
    { $set: req.body },
    { new: true },
    (err, user) => {
      if (err) {
        return res.status(400).json({
          error: {
            message: "Unauthorized action"
          },
        });
      }

      user.hashed_password = undefined;
      user.salt = undefined;

      res.json(user);
    }
  );
};

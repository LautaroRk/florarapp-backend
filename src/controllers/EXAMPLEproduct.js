const formidable = require('formidable');
const _ = require('lodash');
const fs = require('fs');

const Product = require("../models/EXAMPLEproduct");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.productById = (req, res, next, id) => {

  Product.findById(id).exec((error, product) => {

    if (error || !product) {
      return res.status(400).json({
        error: "Product not found",
      });
    }

    req.product = product;

    next();
  });
};

exports.read = (req, res) => {
  // No se envia la imagen para mejorar la performance
  req.product.image = undefined;

  return res.json(req.sale);
}

exports.create = (req, res) => {

  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (error, fields, files) => {

    if (error) {
      return res.status(400).json({
        error: "Image could not be uploaded",
      });
    }

    const { name } = fields;

    if (!name) {
      return res.status(400).json({
        error: "Name is required",
      });
    }

    let product = new Product(fields);

    if (files.image) {

      // si la imagen pesa mas de 1mb
      if (files.image.size > 1000000) {
        return res.status(400).json({
          error: "Image size cannot be greater than 1mb",
        });
      }

      product.image.data = fs.readFileSync(files.image.path);
      product.image.contentType = files.image.type;
    }

    product.save((error, result) => {

      if (error) {
        return res.status(400).json({
          error: errorHandler(error),
        });
      }

      res.json(result);
    });
  });
};

exports.remove = (req, res) => {
  
  const product = req.product;

  product.remove((error, deletedProduct) => {

    if (error) {
      return res.status(400).json({
        error: errorHandler(error),
      });
    }

    res.json({
      message: `'${deletedProduct.name}' was successfully removed`,
    });
  });
};

exports.update = (req, res) => {

  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (error, fields, files) => {

    if (error) {
      return res.status(400).json({
        error: "Image could not be uploaded",
      });
    }

    const { name } = fields;

    if (!name) {
      return res.status(400).json({
        error: "Name is required",
      });
    }

    let product = req.product;
    product = _.extend(product, fields);

    if (files.image) {

      // si la imagen pesa mas de 1mb
      if (files.image.size > 1000000) {
        return res.status(400).json({
          error: "Image size cannot be greater than 1mb",
        });
      }

      product.image.data = fs.readFileSync(files.image.path);
      product.image.contentType = files.image.type;
    }

    product.save((error, product) => {

      if (error) {
        return res.status(400).json({
          error: errorHandler(error),
        });
      }

      res.json(product);
    });
  });
};
const formidable = require('formidable');
const _ = require('lodash');

const Auction = require("../models/auction");
const Sale = require("../models/sale");
const { errorHandler } = require("../helpers/dbErrorHandler");
const { formatForNode } = require("../helpers/dates");

exports.auctionById = (req, res, next, id) => {

  Auction.findById(id).exec((error, auction) => {

    if (error || !auction) {
      return res.status(400).json({
        error: {
          message: "No se encontró la subasta"
        },
      });
    }

    req.auction = auction;

    next();
  });
};

exports.read = (req, res) => {
  req.auction.sales = undefined;
  return res.json(req.auction);
};

exports.list = (req, res) => {

  // const _today = new Date();
  // const today = new Date(_today.setHours(0,0,0)).toISOString();
  // const tomorrow = new Date(_today.setDate(_today.getDate() + 1)).toISOString();

  // EJEMPLO: /api/auctions?from=05-13-2020&upTo=05-14-2020&sortBy=end_date&order=desc&limit=10

  // Orden y limite de la busqueda
  const sortBy = req.query.sortBy ? req.query.sortBy : 'end_date';
  const order = req.query.order ? req.query.order : 'desc';
  const limit = req.query.limit ? parseInt(req.query.limit) : 0;

  // Filtros
  const filter = { end_date: {} };

  // Fecha de comienzo desde
  const from = req.query.from ? new Date(req.query.from).toISOString() : null;
  // Fecha de comienzo hasta
  const upTo = req.query.upTo ? new Date(req.query.upTo).toISOString() : null;
  // Incluir subastas terminadas (true / false). Por defecto, solo se traen las subastas no terminadas
  const all = req.query.all ? true : false;

  // Se agregan los filtros si fueron recibidos por parametro
  if (from || upTo) filter.start_date = {};
  if (from) filter.start_date["$gte"] = from;
  if (upTo) filter.start_date["$lte"] = upTo;
  if (!all) filter.end_date["$gte"] = new Date().toISOString();

  Auction.find(filter)
  .sort([[sortBy, order]])
  .limit(limit)
  .exec((error, auctions) => {
    if (error) {
      return res.status(400).json({
        error: {
          message: errorHandler(error)
        },
      });
    }
    res.json(auctions);
  });
};

exports.create = (req, res) => {

  let {initial_stock, start_date, duration, initial_price, min_price, discount_freq, discount_rate} = req.body;
  
  // @TODO:
  // // Invertimos el dia y el mes para que quede con el formato "MM/DD/AAAA hh:mm"
  
  // const ms_start = formatForNode(start_date).valueOf();
  // const ms_end = ms_start + (duration  * 60 * 1000);
  // const ms_now = new Date().valueOf();
  
  // const active = ms_start >= ms_now && ms_now <= ms_end;

  const stock_left = initial_stock;
  const ms_duration = duration * 60000;
  const end_date = new Date(new Date(start_date).valueOf() + ms_duration);

  const ms_freq = discount_freq * 60000;
  const stages = parseInt(ms_duration / ms_freq);

  // Añadimos un array con el precio segun tiempo restante, para simplificar los calculos en el front
  const price_stages = [initial_price];

  for (let i = 1; i < stages; i++) {
    //const time_left = ms_duration - (i * ms_freq);
    const price = parseInt(initial_price * ((1 - discount_rate / 100) ** i));
  
    // Agregamos el stage
    if (!(price < min_price)) {
      price_stages.push(price);
    }
    // Añadimos el ultimo stage (precio minimo)
    if (price < min_price) {
      if (price_stages[price_stages.length - 1] !== min_price) {
        price_stages.push(min_price);
      }
    }
  }

  const auction = new Auction({ 
    ...req.body, 
    stock_left, 
    end_date, 
    price_stages, 
    duration: ms_duration,
    discount_freq: ms_freq,
  });

  auction.save((error, data) => {

    if (error) {
      return res.status(400).json({
        error: {
          message: errorHandler(error)
        },
      });
    }

    res.json({ data });
  });
};

exports.update = (req, res) => {

  const auction = req.auction;

  //@TODO: actualizar o hacer dinamico
  auction.description = req.body.description;
  auction.stock = req.body.stock;
  auction.initial_price = req.body.initial_price;
  auction.min_price = req.body.min_price;
  auction.discount_frequency = req.body.discount_frequency;
  auction.discount_rate = req.body.discount_rate;

  auction.save((error, data) => {
    if (error) {
      return res.status(400).json({
        error: {
          message: errorHandler(error)
        },
      });
    }
    res.json(data);
  });
};

exports.remove = (req, res) => {

  const auction = req.auction;

  auction.remove((error, deletedAuction) => {
    if (error) {
      return res.status(400).json({
        error: {
          message: errorHandler(error)
        },
      });
    }
    res.json({
      message: `Se eliminó la subasta con ID: ${deletedAuction.auction_id}`,
      deletedAuction,
    });
  });
};

// exports.listSales = (req, res) => {

//   Sale.find().sort({ date: 'descending' })
//   .exec((error, sales) => {
//     if (error) {
//       return res.status(400).json({
//         error: {
//           message: errorHandler(error)
//         },
//       });
//     }
//     res.json(sales);
//   });
// };

exports.getSalesByAuction = (req, res) => {
  return res.json(req.auction.sales);
};

// Agrega una venta a la subasta pasada por query param
exports.addSale = (req, res) => {

  const auction = req.auction;
  const user = req.profile;

  const { auction_id, order_id, article_id, description, description0C, color, variety } = auction;
  const { client_id } = user;
  const { unit_price, quantity, discount = 0 } = req.body;

  const subtotal = quantity * unit_price;
  const total = parseInt((subtotal * 100 ) / (100 - discount));

  auction.stock_left = auction.stock_left - quantity;

  if (auction.stock_left < 0) {
    return res.status(409).json({
      error: {
        message: "Stock insuficiente. Parece que alguien se te adelantó..."
      },
    });
  }

  // Armamos descripcion compuesta del articulo
  let compDesc = '';
  if (article_id === '0C') {
    compDesc = description0C;
  } else {
    compDesc += description;
    if (variety) compDesc += ` ${variety}`;
    if (color) compDesc += ` ${color}`;
    //if (stems > 0) compDesc += ' (' + stems + ')';
  }
  console.log(compDesc, color, auction)

  const sale = new Sale({
    ...req.body,
    order_id,
    _id_auction: auction._id, 
    _id_user: user._id,
    auction_id, // Id excel
    client_id, // Id Cliente (del sistema)
    total,
    description: compDesc,
  });

  auction.save((error, auction) => {

    if (error) {
      return res.status(400).json({
        error: {
          message: errorHandler(error)
        },
      });
    }

    sale.save();
    user.debt += total;
    user.save();

    res.json(auction);
  });

};
// @TODO: markAsPaid & markAsDelivered

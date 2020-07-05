const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const saleSchema = new mongoose.Schema(
  {
    // _id de la subasta
    _id_auction: {
      type: ObjectId,
      required: true,
    },
    // _id del usuario
    _id_user: {
      type: ObjectId,
      required: true,
    },
    //Id de la subasta
    auction_id: {
      type: Number,
      required: true,
      min: -2147483648,
      max: 2147483647,
    },
    //IdPedido
    order_id: {
      type: Number,
      min: -2147483648,
      max: 2147483647,
      required: true,
    },
    //HoraCompra
    date: {
      type: Date,
      default: Date.now,
    },
    //IdCliente
    client_id: {
      type: Number,
      min: -2147483648,
      max: 2147483647,
      required: true,
    },
    //Cant
    quantity: {
      type: Number,
      required: true,
      min: 1,
      max: 9999,
      required: true,
    },
    //PrecioUnidad
    unit_price: {
      type: Number,
      min: 0,
      max: 99999,
      required: true,
    },
    //Bon-1 (% descuento especial cliente)
    discount: {
      type: Number,
      default: 0,
    },
    //Total
    total: {
      type: Number,
    },

    //Datos del producto para mostrar en el listado @TODO: pasar a virtual field
    description: {
      type: String,
      maxlength: 200,
    },

    //Fue entregado? @TODO: completar metodos para cambio de estado
    delivered: {
      type: Boolean,
      default: false,
    },
    //Fue pagado? @TODO: completar metodos para cambio de estado
    paid: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true }
);

saleSchema.index({date: 1, client_id: 1, auction_id: 1});

module.exports = mongoose.model("Sale", saleSchema);

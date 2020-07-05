const mongoose = require("mongoose");

const auctionSchema = new mongoose.Schema(
  {
    //Id     (id del detalle. viene del excel. el id unico interno es _id)
    auction_id: {
      type: Number,
      required: true,
      index: true,
      unique: true,
      min: -2147483648,
      max: 2147483647,
    },
    //IdPedido   (viene del excel)
    order_id: {
      type: Number,
      required: true,
      min: -2147483648,
      max: 2147483647,
    },
    //Cant
    initial_stock: {
      type: Number,
      required: true,
      min: 1,
      max: 9999,
    },
    stock_left: {
      type: Number,
      min: 0,
      max: 9999,
    },
    //Foto
    image_url: {
      type: String,
      //default: "https://tinyurl.com/yarz4dss",
    },
    //IdArticulo
    article_id: {
      type: String,
      uppercase: true,
      minlength: 2,
      maxlength: 2,
      required: true,
    },
    //Descripcion (de articulo)
    description: {
      type: String,
      maxlength: 60,
    },
    //0C (descripcion de articulo no registrado)
    description0C: {
      type: String,
      maxlength: 200,
    }, 
    //IdRubro
    category_id: {
      type: Number,
      min: 0,
      max: 255,
      default: 1,
    },
    //IdColor
    color_id: {
      type: Number,
      min: 0,
      max: 255,
    },
    //Color
    color: {
      type: String,
      maxlength: 20,
    },
    //IdVariedad
    variety_id: {
      type: Number,
      min: -32768,
      max: 32767,
    },
    //Variedad
    variety: {
      type: String,
      maxlength: 15,
    },
    //IdCalidad
    quality_id: {
      type: Number,
      min: -32768,
      max: 32767,
    },
    //Calidad
    quality: {
      type: String,
      maxlength: 11,
    },
    //IdLargoTallo
    stem_length_id: {
      type: Number,
      min: -32768,
      max: 32767,
    },
    //LargoTallo
    stem_length: {
      type: String,
      maxlength: 11,
    },
    //Varas (cantidad de tallos por paquete)
    stems: {
      type: Number,
      min: 0,
      max: 100,
    },
    //IdOrigen
    source_id: {
      type: Number,
      min: -32768,
      max: 32767,
    },
    //Origen
    source: {
      type: String,
      maxlength: 20,
    },
    //Precio (precio inicial para subasta)
    initial_price: {
      type: Number,
      required: true,
      max: 99999,
    },
    //IdOP (id proveedor)
    provider_id: {
      type: Number,
      min: -2147483648,
      max: 2147483647,
    },
    //Proveedor
    provider: {
      type: String,
      maxlength: 30,
    },
    //IdApertura
    opening_id: {
      type: Number,
      min: 0,
      max: 255,
    },
    //Apertura
    opening: {
      type: String,
      maxlength: 15,
    },
    //Observaciones
    observations: {
      type: String,
      maxlength: 200,
    },
    //PrecioMin
    min_price: {
      type: Number,
      min: 1,
      max: 9999,
      required: true,
    },
    //CantMin (cantidad minima de compra)
    min_quantity: {
      type: Number,
      default: 1,
    },
    //Inicio
    start_date: {
      type: Date,
      required: true,
    },
    //(duracion de la subasta convertida a milisegundos)
    duration: {
      type: Number,
      min: 60000,
      max: 7200000,
      default: 3600000,
    },
    end_date: {
      type: Date,
    },
    //FrecDesc (frecuencia de descuento convertida a milisegundos)
    discount_freq: {
      type: Number,
      min: 10000,
      max: 1800000,
      default: 60000,
    },
    //PorcDesc (porcentaje de descuento en cada ronda)
    discount_rate: {
      type: Number,
      min: 0,
      max: 100,
      default: 1,
    },
    // subasta destacada
    fixed: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: false,
    },
    price_stages: {
      type: [Number],
      default: [],
    },
  },
  { 
    timestamps: true,
  }
);

auctionSchema.index({end_date: 1, start_date: 1});
// @TODO: sacar price_stages del schema y añadirlo como virtual
// auctionSchema.virtual('price_stages').get(() => {
//   const stages = parseInt(this.duration / this.freq);
//   const price_stages = [this.initial_price];
//   // -----------------------------------------------------------------
//   for (let i = 1; i < stages; i++) {
//     const price = parseInt(this.initial_price * ((1 - this.discount_rate / 100) ** i));

//     // Agregamos el stage
//     if (!(price < this.min_price)) {
//       price_stages.push(price);
//     }
//     // Añadimos el ultimo stage (precio minimo)
//     if (price < this.min_price) {
//       // Chequeamos que no se haya agregado antes
//       if (price_stages[price_stages.length - 1] !== this.min_price) {
//         price_stages.push(this.min_price);
//       }
//     }
//   }
// });

//auctionSchema.set('toObject', { getters: true })

module.exports = mongoose.model("Auction", auctionSchema);

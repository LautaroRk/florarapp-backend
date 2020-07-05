const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      maxlength: 200,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    image: {
      data: Buffer,
      contentType: String,
    },
    history: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);

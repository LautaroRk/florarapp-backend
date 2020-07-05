const mongoose = require("mongoose");
const crypto = require("crypto");
const { v1: uuidv1 } = require("uuid");
const { ObjectId } = mongoose.Schema;

const Sale = require('./sale');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      maxlength: 15,
      required: true,
      unique: true,
      index: true,
    },
    business_name: {
      type: String,
      maxlength: 50,
    },
    // como esta en el sistema
    client_id: {
      type: Number,
      min: -2147483648,
      max: 2147483647,
      unique: true,
      required: true,
    },
    // descuento especial cliente
    discount: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    name: {
      type: String,
      trim: true,
      maxlength: 32,
    },
    surname: {
      type: String,
      trim: true,
      maxlength: 32,
    },
    email: {
      type: String,
      trim: true,
      unique: 32,
    },
    phone: {
      type: String,
      maxlength: 30,
    },
    address: {
      type: String,
      maxlength: 200,
    },
    hashed_password: {
      type: String,
      required: true,
    },
    about: {
      type: String,
      trim: true,
    },
    salt: {
      type: String
    },
    // 0 = cliente, 1 = admin
    role: {
      type: Number,
      default: 0,
    },
    debt: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// virtual field
userSchema
  .virtual("password")
  .set(function (password) {
    this._password = password;
    this.salt = uuidv1();
    this.hashed_password = this.encryptPassword(password);
  })
  .get(() => {
    return this._password;
  });

userSchema.methods = {
  authenticate: function (plainText) {
    return this.encryptPassword(plainText) === this.hashed_password;
  },

  encryptPassword: function (password) {
    if (!password) return "";

    try {
      return crypto
        .createHmac("sha1", this.salt)
        .update(password)
        .digest("hex");
    } catch (err) {
      return "";
    }
  },
};

module.exports = mongoose.model("User", userSchema);

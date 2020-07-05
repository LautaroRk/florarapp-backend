const express = require("express");
const router = express.Router();

const { auctionById, create, read, update, remove, list, getSalesByAuction, addSale } = require("../controllers/auction");
const { requireSignIn, isAuth, isAdmin } = require("../controllers/auth");
const { userById } = require("../controllers/user");
const { auctionValidator } = require('../validator');

// Subastas
router.get("/auction/:auctionId", read);
router.get("/auctions", list);
router.post("/auction/create/:userId", auctionValidator, requireSignIn, isAuth, isAdmin, create);
router.put("/auction/:auctionId/:userId", auctionValidator, requireSignIn, isAuth, isAdmin, update);
router.delete("/auction/:auctionId/:userId", requireSignIn, isAuth, isAdmin, remove);

// Ventas
router.get("/sales/:auctionId", isAuth, isAdmin, getSalesByAuction);
router.post("/sale/:auctionId/:userId", requireSignIn, isAuth, addSale);

router.param("auctionId", auctionById);
router.param("userId", userById);

module.exports = router;

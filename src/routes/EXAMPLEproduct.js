const express = require("express");
const router = express.Router();

const { productById, create, read, remove, update } = require("../controllers/EXAMPLEproduct");
const { requireSignIn, isAuth, isAdmin } = require("../controllers/auth");
const { userById } = require("../controllers/user");

// Rutas
router.get("/product/:productId", read);
router.post("/product/create/:userId", requireSignIn, isAuth, isAdmin, create);
router.delete("/product/:productId/:userId", requireSignIn, isAuth, isAdmin, remove);
router.put("/product/:productId/:userId", requireSignIn, isAuth, isAdmin, update);

// Middlewares para los parametros
router.param("userId", userById);
router.param("productId", productById);

module.exports = router;

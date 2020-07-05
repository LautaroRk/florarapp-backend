const express = require("express");
const router = express.Router();

const { requireSignIn, isAuth, isAdmin } = require("../controllers/auth");
const { userById, read, list, getOne, remove, update, getHistory } = require("../controllers/user");

router.get("/secret/:userId", requireSignIn, isAuth, isAdmin, (req, res) => {
  res.json({
    user: req.profile,
  });
});

router.get("/users/:userId", requireSignIn, isAuth, isAdmin, list);
router.get("/user/data/:userId", requireSignIn, isAuth, isAdmin, getOne);
router.delete("/user/:userId", requireSignIn, isAuth, isAdmin, remove);

router.get("/user/:userId", requireSignIn, isAuth, read);
router.get("/user/history/:userId", requireSignIn, isAuth, getHistory);
router.put("/user/:userId", requireSignIn, isAuth, update);

router.param("userId", userById);

module.exports = router;

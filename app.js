const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const expressValidator = require("express-validator");

require("dotenv").config();

// import routes
const authRoutes = require("./src/routes/auth");
const userRoutes = require("./src/routes/user");
const productRoutes = require("./src/routes/EXAMPLEproduct");
const auctionRoutes = require("./src/routes/auction");

// app
const app = express();
// server
const server = require("http").createServer(app);
const io = require("socket.io").listen(server);

// Models for socket responses
const Auction = require('./src/models/auction');

// DB CONNECTION (replace with process.env.DATABASE for localstorage)
// @TODO: usuario y pass de DB deberian ser variables de entorno en heroku
mongoose
  .connect(process.env.DB_CONNECTION, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB Connected"))
  .catch(error => console.log(error));

// middlewares
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(expressValidator());
app.use(cors());

// routes middleware
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", productRoutes);
app.use("/api", auctionRoutes);

const port = process.env.PORT || 8000;

server.listen(port, () => console.log(`Server listening on port: ${port}`));

io.on("connection", (socket) => {
  console.log("User connected", socket.id);
  // cuando recibe por socket nueva compra
  socket.on("stock update", async (sale) => {
    const auction = await Auction.findById(sale._id).select('_id stock_left').exec();
    // devuelve la actualizacion a todos los clientes
    console.log('stock update', auction);
    io.emit("stock update", auction);
  });
  socket.on('disconnect', (socket) => console.log("User disconnected", socket.id));
});
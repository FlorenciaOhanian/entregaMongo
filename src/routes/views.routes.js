import express from "express";
import { userModel } from "../models/user.models.js";
import { cartModel } from "../models/cart.models.js";

const viewsRouter = express.Router();

viewsRouter.get("/static/chat", (req, res) => {
  res.render("chat", {
    css: "style.css",
    title: "Chat",
    js: "script.js",
  });
});
viewsRouter.get("/static/home", async (req, res) => {
  // console.log('req.session: ', req.session.passport.user);
const user = await userModel.findById(req.session.passport.user);
const cartIdUser = user.cart.toString();

  // console.log('user----------> ', user);
  // console.log('USERCART: ', cartUser);
const cart = await cartModel.findById(cartIdUser);
  // console.log('cart: ', cart);
res.render("home", {
    css: "home.css",
    title: "Home",
    js: "home.js",
    login: req.session.user,
    existeProductosEnCarrito: cart.productos.length,
    cartId: cartIdUser,
});
});
viewsRouter.get("/static/ticket", (req, res) => {
res.render("ticket", {
    css: "ticket.css",
    title: "Ticket page",
    js: "crearTicket.js",
});
});

viewsRouter.get("/static/crearProd", (req, res) => {
res.render("realTimeProducts", {
    css: "real.css",
    title: "Form",
    js: "realTimeProducts.js",
});
});

viewsRouter.get("/static/login", (req, res) => {
  res.render("session", {
    css: "session.css",
    title: "Session",
    js: "logIn.js",
  });
});

viewsRouter.get("/static/logOut", (req, res) => {
  res.render("logOut", {
    css: "session.css",
    title: "LogOut",
    js: "logOut.js",
  });
});


export default viewsRouter
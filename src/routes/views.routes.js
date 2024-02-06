import { Router } from 'express';
import { cartModel } from '../models/cart.models.js';
import { userModel } from '../models/user.models.js';
const viewsApp = Router();


viewsApp.get('/', (req, res) => {
    res.render('session', {
      css: 'session.css',
      title: 'Session',
      js: 'logIn.js',
    });
  });
viewsApp.get('/chat', (req, res) => {
  res.render('chat', {
    css: 'style.css',
    title: 'Chat',
    js: 'script.js',
  });
});
viewsApp.get('/home', async (req, res) => {
  // console.log('req.session: ', req.session.passport.user);
  const user = await userModel.findById(req.session.passport.user);
  const cartIdUser = user.cart.toString();

  // console.log('user----------> ', user);
  // console.log('USERCART: ', cartUser);
  const carts = await cartModel.find();
  console.log('CARTS---------------------->: ', carts);
  const carritoID = carts[0]._id.toString();
  const cart = await cartModel.findById(carts[0]._id);

  // const cart = await cartModel.findById(cartIdUser);
  // console.log('cart: ', cart);
  res.render('home', {
    css: 'home.css',
    title: 'Home',
    js: 'home.js',
    login: req.session.user,
    existeProductosEnCarrito: cart.productos.length,
    cartId: carritoID,
  });
});

viewsApp.get('/ticket', (req, res) => {
  res.render('ticket', {
    css: 'ticket.css',
    title: 'Ticket page',
    js: 'crearTicket.js',
  });
});

viewsApp.get('/crearProd', (req, res) => {
  res.render('realTimeProducts', {
    css: 'real.css',
    title: 'Form',
    js: 'realTimeProducts.js',
  });
});



viewsApp.get('/logOut', (req, res) => {
  res.render('logOut', {
    css: 'session.css',
    title: 'LogOut',
    js: 'logOut.js',
  });
});

export default viewsApp;
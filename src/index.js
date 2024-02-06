import express from 'express';
import session from 'express-session';
import mongoose from 'mongoose';
import MongoStore from 'connect-mongo';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import inicializacionPassport from './config/passport.js';
import { engine } from 'express-handlebars';
import { __dirname } from './path.js';
import path from 'path';
import { Server } from 'socket.io';
import { messageModel } from './models/message.models.js';
import { cartModel } from './models/cart.models.js';
import { userModel } from './models/user.models.js';
import { productoModel } from './models/producto.models.js';
import router from './routes/index.routes.js';
import 'dotenv/config';
import { addLogger } from './config/logger.js';
import fs from 'fs';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUiExpress from 'swagger-ui-express';

const app = express();
const PORT = 8080;

//Swagger - Documentación
const swaggerOptions = {
  definition: {
    openapi: '3.1.0',
    info: {
      title: 'Documentación del curso Backend-CorderHouse',
      description: 'Api Backend CoderHouse ',
    },
  },
  apis: [`${__dirname}/docs/**/*.yaml`], // ** indica subcarpeta, no importa el nombre pero si la extension yaml.
};

//Documentacion con Swagger
const spects = swaggerJSDoc(swaggerOptions);
app.use('/apidocs', swaggerUiExpress.serve, swaggerUiExpress.setup(spects));

//Conexion a la base de datos
mongoose
  .connect(process.env.MONGO_URL)
  .then(async () => {
    console.log('BDD conectada');
  })
  .catch(() => console.log('Error de conexion a la BDD'));

//Middlewares
app.use(express.json());
app.use(cookieParser(process.env.SIGNED_COOKIE));

//Conexion base de datos
app.use(
  session({
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URL,
      mongoOptions: {
        useNewUrlParser: true, //Establezco que la conexion es mediante URL
        useUnifiedTopology: true,
      },
      ttl: 60,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false, //Se guarda pese a no tener modificaciones
    saveUninitialized: false, //Guarda la sesion pese a no tener datos
  })
);

//Middlewear passport
inicializacionPassport();
app.use(passport.initialize());
app.use(passport.session());

//Ruotes de Logger
app.use(addLogger);
app.get('/fatal', (req, res) => {
  req.logger.fatal('<span style= "color:red"> Texto fatal</span><br/>');
  res.send('Fatal');
});
app.get('/error', (req, res) => {
  req.logger.error('<span style= "color:yellow"> Texto error</span><br/>');
  res.send('Error');
});
app.get('/warn', (req, res) => {
  req.logger.warn('<span style= "color:cyan"> Texto warn</span><br/>');
  res.send('Warn');
});
app.get('/info', (req, res) => {
  req.logger.info(
    '<span style= "color:blue"> Texto informativo de Info</span><br/>'
  );
  res.send('Info');
});
app.get('/debug', (req, res) => {
  req.logger.debug('Debug');
  res.send('Debug');
});

//Ruta para ver todos los errores
app.get('/loggerTest', (req, res) => {
  req.logger.error('Loggers de mi app');
  fs.readFile('logger.html', 'utf8', (error, data) => {
    if (error) {
      console.error(errorr);
      return res.status(500).send('Error al leer el archivo');
    }
    res.setHeader('Content-Type', 'text/html');
    res.send('Registro de errores: ' + data);
  });
});

//Router
app.use('/', router);
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.use('/static', express.static(path.join(__dirname, '/public')));

app.get('/setcookie', (req, res) => {
  res
    .cookie('cookieCookie', 'Mi cookie', { maxAge: 50000, signed: true })
    .send('Cookie Generada');
});
app.get('/getcookie', (req, res) => {
  res.cookie('cookieCookie', 'Mi cookie').send('Cookie Modificada');
});

app.get('/getcookie', (req, res) => {
  req.send(req.signedCookies);
});

const serverExpress = app.listen(PORT, () => {
  console.log(`Server on port ${PORT}`);
});

const io = new Server(serverExpress);

const mensajes = [];

io.on('connection', (socket) => {
  console.log('Servidor Socket.io conectado');

  // chat view
  socket.on('mensaje', async (infoMensaje) => {
    await messageModel.create({
      email: infoMensaje.email,
      message: infoMensaje.message,
    });
    const mensajes = await messageModel.find();
    socket.emit('messages', mensajes);
  });

  // Mostrar todos los productos en home.js (y en home handlebars)
  socket.on('cargarProductos', async () => {
    const productos = await productoModel.find();
    socket.emit('mostrarProductos', productos);
  });

  //Se utiliza en realTime
  socket.on('nuevoProducto', async (prod) => {
    await productoModel.create({
      codigo: prod.codigo,
      nombre: prod.nombre,
      descripcion: prod.descripcion,
      cantidad: prod.cantidad,
      precio: prod.precio,
      stock: prod.stock,
      categoria: prod.categoria,
    });
    socket.emit('productoCreado', prod);
  });

  //Se utiliza en realTime
  socket.on('eliminarProducto', async (id) => {
    try {
      await productoModel.deleteOne({ _id: id });
      const productos = await productoModel.find();
      socket.emit('mostrarProductos', productos);
    } catch (error) {
      console.log(error);
    }
  });
  //Se utiliza en home
  socket.on('mostrarProductosCarrito', async () => {
    const carts = await cartModel.find();
    const cart = await cartModel.findById(carts[0]._id);
    socket.emit('productosEnCarrito', cart.productos);
  });
  socket.on('agregarAlCarrito', async (id) => {
    try {
      const producto = await productoModel.findById(id);
      const carts = await cartModel.find();
      const cart = await cartModel.findById(carts[0]._id);
      const indice = cart.productos.findIndex((prod) => prod.id_prod._id == id);
      console.log('Indice del producto a agregar: ', indice);
      if (indice != -1) {
        cart.productos[indice].cantidad = cart.productos[indice].cantidad + 1;
      } else {
        // console.log('agregando producto al carrito')
        cart.productos.push({
          id_prod: id,
          cantidad: 1,
        });
      }

      const respuesta = await cartModel.findByIdAndUpdate(carts[0]._id, cart);
      // Luego de actualizar el carrito con el producto nuevo,
      //  vuelvo a llamar al carrito para tener el cart actualizado
      const cartActualizado = await cartModel.findById(carts[0]._id);
      socket.emit('carritoActualizado', cartActualizado);
    } catch (error) {
      console.log(error);
    }
  });
  socket.on('eliminarDelCarrito', async (productoId) => {
    const carts = await cartModel.find();
    const cart = await cartModel.findById(carts[0]._id);
    const indice = cart.productos.findIndex(
      (prod) => prod.id_prod._id == productoId
    );
    if (indice != -1) {
      // console.log('cantidad del producto en el carrito: ', cart.productos[indice].cantidad)
      if (cart.productos[indice].cantidad > 1) {
        cart.productos[indice].cantidad = cart.productos[indice].cantidad - 1;
      } else {
        console.log('producto con cantidad 0');
        cart.productos.splice(indice, 1);
      }
    } else {
      console.log('el producto fue eliminado por completo');
    }
    const respuesta = await cartModel.findByIdAndUpdate(carts[0]._id, cart);
    socket.emit('carritoActualizado', cart);
  });

  //Se utiliza en logIn
  socket.on('credenciales', async (datos) => {
    const user = await userModel.findOne({ email: datos.email });
    // console.log(user);
    if (user) {
      user.password === datos.password
        ? socket.emit('usuarioValido')
        : socket.emit('contraseñaInvalida');
    } else {
      socket.emit('usuarioInexistente');
    }
  });
});

app.get('/static/chat', (req, res) => {
  res.render('chat', {
    css: 'style.css',
    title: 'Chat',
    js: 'script.js',
  });
});
app.get('/static/home', async (req, res) => {
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

app.get('/static/ticket', (req, res) => {
  res.render('ticket', {
    css: 'ticket.css',
    title: 'Ticket page',
    js: 'crearTicket.js',
  });
});

app.get('/static/crearProd', (req, res) => {
  res.render('realTimeProducts', {
    css: 'real.css',
    title: 'Form',
    js: 'realTimeProducts.js',
  });
});

app.get('/static/login', (req, res) => {
  res.render('session', {
    css: 'session.css',
    title: 'Session',
    js: 'logIn.js',
  });
});

app.get('/static/logOut', (req, res) => {
  res.render('logOut', {
    css: 'session.css',
    title: 'LogOut',
    js: 'logOut.js',
  });
});
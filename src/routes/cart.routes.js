import { Router } from 'express';
import { cartModel } from '../models/cart.models.js';
import { productoModel } from '../models/producto.models.js';
import { passportError, autorizacion } from '../util/messagesError.js';
import { ticketModel } from '../models/ticket.model.js';

const carritoRouter = Router();

carritoRouter.post('/', async (req, res) => {
  try {
    const cart = await cartModel.create({});
    res.status(200).send({
      respuesta: 'ok',
      mensaje: cart,
    });
  } catch (error) {
    res.status(400).send({
      respuesta: 'Error en crear carrito',
      mensaje: error,
    });
  }
});

carritoRouter.get('/', async (req, res) => {
  try {
    const cart = await cartModel.find();
    if (cart) res.status(200).send({ respuesta: 'OK', mensaje: cart });
    else
      res.status(404).send({
        respuesta: 'Error en consultar carrito',
        mensaje: 'Not Found',
      });
  } catch (error) {
    res.status(400).send({
      respuesta: 'Error',
      mensaje: 'Carrito no encontrado',
    });
  }
});

carritoRouter.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const cart = await cartModel.findById(id);
    if (cart)
      res.status(200).send({
        respuesta: 'OK',
        mensaje: cart,
      });
    else
      res.status(404).send({
        respuesta: 'Error en consultar carrito',
        mensaje: 'Not Found',
      });
  } catch (error) {
    res.status(400).send({
      respuesta: 'Error',
      mensaje: 'Carrito no encontrado',
    });
  }
});

carritoRouter.post(
  '/:cid/productos/:pid',
  autorizacion('basico'),
  async (req, res) => {
    const { cid, pid } = req.params;
    const { cantidad } = req.body;
    try {
      const cart = await cartModel.findById(cid);
      if (cart) {
        const prod = await productoModel.findById(pid);
        if (prod) {
          const indice = cart.productos.findIndex(
            (prod) => prod.id_prod == pid
          );
          console.log(indice);
          if (indice != -1) {
            cart.productos[indice].cantidad = cantidad;
          } else {
            cart.productos.push({
              id_prod: pid,
              cantidad: cantidad,
            });
          }
          const respuesta = await cartModel.findByIdAndUpdate(cid, cart);
          res.status(200).send({
            respuesta: 'OK',
            mensaje: respuesta,
          });
        } else {
          res.status(404).send({
            respuesta: 'Error en agregar producto a carrito',
            mensaje: respuesta,
          });
        }
      } else {
        res.status(400).send({
          respuesta: 'Error en agregar producto a carrito',
          mensaje: 'Carrito no encontrado',
        });
      }
    } catch (error) {
      res.status(400).send({
        respuesta: 'Error en agregar producto a carrito',
        mensaje: error,
      });
    }
  }
);

carritoRouter.delete('/:cid', autorizacion('user'), async (req, res) => {
  const { cid } = req.params;
  try {
    await cartModel.findByIdAndUpdate(cid, { products: [] });
    res.status(200).send({ respuesta: 'ok', mensaje: 'Carrito vacio' });
  } catch (error) {
    res
      .status(400)
      .send({ respuesta: 'Error al encontrar carrito', mensaje: error });
  }
});

carritoRouter.delete(
  '/:cid/productos/:pid',
  autorizacion('basico'),
  async (req, res) => {
    const { cid, pid } = req.params;
    try {
      const cart = await cartModel.findById(cid);
      if (cart) {
        const prod = await productoModel.findById(pid);
        if (prod) {
          const indice = cart.productos.findIndex(
            (item) => item.id_prod._id.toString() == pid
          );
          if (indice !== -1) {
            cart.productos.splice(indice, 1);
          }
        }
      }
      const respuesta = await cartModel.findByIdAndUpdate(cid, cart);
      res.status(200).send({ respuesta: 'OK', mensaje: respuesta });
    } catch (error) {
      res
        .status(400)
        .send({ respuesta: 'Error al encontrar carrito', mensaje: error });
    }
  }
);

carritoRouter.post('/:cid/purchase', async (req, res) => {
  let { cid } = req.params;
  console.log('session', req.session);
  try {
    let cart = await cartModel.findById(cid); //Veo si existe carrito
    if (cart) {
      let montoFinal = 0;
      let prooductosAEliminar = [];

      for (const prod of cart.productos) {
        let idPro = prod.id_prod;
        let productBD = await productoModel.findById(idPro); // Traigo el producto de la BD
        if (prod.cantidad <= productBD.stock) {
          //Comparo stock del carrito con el de la BD
          montoFinal += prod.cantidad * productBD.precio;
          productBD.stock -= prod.cantidad;
          await productoModel.findByIdAndUpdate(idPro, productBD);
        } else {
          prooductosAEliminar.push(prod);
        }
      }

      if (prooductosAEliminar.length > 0) {
        //Actualizo array sin los prod a eliminar
        cart.productos = cart.productos.filter(
          (prod) => !prooductosAEliminar.includes(prod)
        );
        await cartModel.findByIdAndUpdate(cid, cart); //Actualiza el carrito
      }
      if (req.session.user.rol === 'premium') {
        const descuento = montoFinal * 0.15;
        montoFinal = montoFinal - descuento;
      }

      const ticket = await ticketModel.create({
        amount: montoFinal,
        purchaser: req.session.user.email,
      });
      console.log('Ticket creado correctamente', ticket);

      if (ticket) {
        cart.productos = [];
        await cartModel.findByIdAndUpdate(cid, cart); //Vacia carrito
        return res.status(200).send({ ticket: ticket });
      } else {
        res
          .status(400)
          .send({ respuesta: 'Error al crear ticket', mensaje: error });
      }
    }
    return res.status(404).send({ mensaje: 'No se encuentra' });
  } catch (error) {
    res.status(500).send({ response: 'error', message: error });
  }
});

export default carritoRouter;
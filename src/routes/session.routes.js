import { Router } from 'express';
import passport from 'passport';
import { generarToken } from '../util/jwt.js';
import { passportError, autorizacion } from '../util/messagesError.js';
import { userModel } from '../models/user.models.js';

const sessionRouter = Router();

//Middlewares

function mayor6Horas(ultimaConexion) {
  if (!ultimaConexion) {
    return false;
  }
  const hoy = new Date();
  const tiempoTranscurrido = hoy - new Date(ultimaConexion);
  const horasTranscurridas = tiempoTranscurrido / (5 * 60 * 60); // Convierto a horas
  return horasTranscurridas > 0;
}

// Elimina la cuenta
async function eliminarCuenta(user) {
  console.log(user);
  await userModel.findByIdAndDelete(user._id);
  return console.log('usuario eliminado');
}
sessionRouter.post(
  '/login',
  passport.authenticate('login'),
  async (req, res) => {
    try {
      // Calcula el tiempo transcurrido desde la última conexión
      function tiempoDesconectado(ultimaConexion) {
        // Verifica si la última conexión es válida
        if (!ultimaConexion) {
          return null;
        }
        // Obtengo fecha actual
        const hoy = new Date();
        // Calcula la diferencia en milisegundos
        const tiempoTranscurrido = hoy - ultimaConexion;
        // Convierte la diferencia a segundos
        const minutosTranscurridos = Math.floor(
          tiempoTranscurrido / (1000 * 60)
        );

        return minutosTranscurridos;
      }
      if (!req.user) {
        return res.status(401).send({ mensaje: `Usuario invalido` });
      }
      req.session.user = {
        nombre: req.user.nombre,
        apellido: req.user.apellido,
        edad: req.user.edad,
        email: req.user.email,
        rol: req.user.rol,
        ultima_conexion: req.user.ultima_conexion,
      };
      const ultimaConexion = req.session.user.ultima_conexion;
      const tiempoDesconectado21 = tiempoDesconectado(ultimaConexion);
      if (tiempoDesconectado21 !== null) {
        console.log(
          `El usuario ha estado desconectado durante ${tiempoDesconectado21} segundos.`
        );
      } else {
        console.log('La última conexión no es válida.');
      }

      // Actualizar ultima conexion al iniciar sesión
      req.session.user.ultima_conexion = Date.now();
      // await req.user.save();
      const token = generarToken(req.user);
      res.cookie('jwtCookie', token, {
        maxAge: 72000000, // 20hs
      });
      res.status(200).send({ payload: req.user });
    } catch (error) {
      res.status(500).send({ mensaje: `Error al iniciar sesion ${error}` });
    }
  }
);
sessionRouter.post('/deleteUser', async (req, res) => {
  if (
    req.session &&
    req.session.user &&
    mayor6Horas(req.session.user.ultima_conexion)
  ) {
    // Eliminar la cuenta
    await eliminarCuenta(req.session.user);
    req.session.destroy();
    res
      .status(200)
      .send({ resultado: 'Sesión y cuenta eliminadas debido a inactividad' });
  } else {
    res.status(400).send({ message: 'Error al eliminar usuario' });
  }
});

sessionRouter.post(
  '/registro',
  passport.authenticate('registro'),
  async (req, res) => {
    try {
      if (!req.user) {
        return res.status(400).send({ mensaje: `Usuario existente` });
      }
      res.status(200).send({ mensaje: 'Usuario creado' });
    } catch (error) {
      res.status(500).send({ mensaje: `Error al registrar usuario ${error}` });
    }
  }
);

sessionRouter.get(
  '/github',
  passport.authenticate('github', { scope: ['user:email'] }),
  async (req, res) => {
    res.status(200).send({ mensaje: 'Usuario registrado' });
  }
);

sessionRouter.get(
  '/githubCallback',
  passport.authenticate('github'),
  async (req, res) => {
    req.session.user = req.user;
    res.status(200).send({ mensaje: 'Usuario logueado' });
  }
);
sessionRouter.get('/logout', (req, res) => {
  if (req.session.login) {
    req.session.destroy();
  }
  res.clearCookie('jwtCookie');
  res.status(200).send({ resultado: 'Sesion cerrada' });
});

//Verifica si el token es valido
sessionRouter.get(
  '/testJWT',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.send(req.user);
  }
);

sessionRouter.get(
  '/current',

  autorizacion('basico'),
  (req, res, next) => {
    res.send(req.session.user);
  }
);

export default sessionRouter;
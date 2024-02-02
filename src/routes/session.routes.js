import { Router } from "express";
import passport from "passport";
import {generarToken} from "../util/jwt.js"
import {passportError, autorizacion} from "../util/messagesError.js"

const sessionRouter = Router()

//Middlewares

// Calcula el tiempo transcurrido desde la última conexión
function tiempoDesconectado(ultimaConexion) {
  // Verifica si la última conexión es válida
  if (!ultimaConexion) {
      return null; 
  }
  // Obtengo fecha actual
  const hoy = new Date();

  // Calcula la diferencia en milisegundos
  const tiempoTranscurrido = hoy - new Date(ultimaConexion);

  // Convierte la diferencia a segundos
  const segundosTranscurridos = tiempoTranscurrido / 1000;
  return segundosTranscurridos;
}

function esMayorDe144Horas(ultimaConexion) {
  if (!lastConnection) {
      return false; 
  }
    const hoy = new Date();
  const tiempoTranscurrido = hoy - new Date(ultimaConexion);
  const horasTranscurridas = tiempoTranscurrido / (1000 * 60 * 60); // Convierto a horas
  return horasTranscurridas > 144;
}

// Elimina la cuenta
async function eliminarCuenta(user) {
  await userModel.findByIdAndDelete(user._id);
  return console.log("usuario eliminado")
}
sessionRouter.post('/login', passport.authenticate('login'), async (req,res) => {
try{
  if(!req.user){
        return res.status(401).send({mensaje:`Usuario invalido`})
  }
  req.session.user = {
    nombre: req.user.nombre,
    apellido: req.user.apellido,
    edad: req.user.edad,
    email: req.user.email,
    rol: req.user.rol,
  }
  const ultimaConexion = req.user.ultimaConexion;
        const tiempoDesconectado = tiempoDesconectado(ultimaConexion);
        if (tiempoDesconectado !== null) {
            console.log(`El usuario ha estado desconectado durante ${tiempoDesconectado} segundos.`);
        } else {
            console.log("La última conexión no es válida.");
        }

        // Actualizar ultima conexion al iniciar sesión
        req.user.ultimaConexion = Date.now();
        await req.user.save();
        const token = generarToken(req.user)
        res.cookie('jwtCookie', token, {
        maxAge: 72000000 // 20hs
        });
        res.status(200).send({payload: req.user})
  } catch(error){
res.status(500).send({mensaje: `Error al iniciar sesion ${error}`})
}
})

sessionRouter.post('/registro', passport.authenticate('registro'), async (req,res) => {
  try{
    if(!req.user){
            return res.status(400).send({mensaje:`Usuario existente`})
    }
      res.status(200).send({mensaje: 'Usuario creado'})

  } catch(error){
  res.status(500).send({mensaje: `Error al registrar usuario ${error}`})
  }
  })



sessionRouter.get('/github', passport.authenticate('github', {scope: ['user:email']}), async(req,res) => {
  res.status(200).send({mensaje: 'Usuario registrado'})
})

sessionRouter.get('/githubCallback', passport.authenticate('github'), async(req,res) => {
  req.session.user = req.user
  res.status(200).send({mensaje: 'Usuario logueado'})
})
sessionRouter.get("/logout", (req, res) => {
  if (req.session.login) {
    req.session.destroy()
  }
res.clearCookie('jwtCookie')
  res.status(200).send({resultado: "Sesion cerrada" });
});

//Verifica si el token es valido
sessionRouter.get('/testJWT', passport.authenticate('jwt', {session:false}), (req,res)=>{
  res.send(req.user)
})

sessionRouter.get('/current', passportError('jwt'), autorizacion('basico'), (req, res, next) =>{
  res.send(req.user.user)
})

export default sessionRouter

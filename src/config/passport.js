import local from "passport-local"; //Estrategia
import passport from "passport";
import GithubStrategy from "passport-github2"
import jwt from "passport-jwt"
import { createHash, validatePassword } from "../util/bcrypt.js";
import { userModel } from "../models/user.models.js";

//Estrategias
const LocalStrategy = local.Strategy
const JWTStrategy = jwt.Strategy
const ExtractJWT = jwt.ExtractJwt //Extrae las cookies

//Registrar usuario
const inicializacionPassport = () => {
  const cookieExtractor = (req) => {
    const token = req.headers.authorization ? req.headers.authorization : {}
    return token;
}


  passport.use('jwt', new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
        secretOrKey: process.env.JWT_SECRET
      }, async (jwt_payload, done) => {
        try {
          // console.log('JWT', jwt_payload)
          return done(null, jwt_payload)
        } catch (error) {
          return done(error)
        }
      }))

  passport.use("registro",  new LocalStrategy(
      { passReqToCallback: true, usernameField: "email" },
      async (req, username, password, done) => {
        const { nombre, apellido, email, edad, rol } = req.body
        try {
          const user = await userModel.findOne({ email: email });
          if (user) {
            return done(null, false, { message: "El usuario ya existe" });
          }
          //Creando usuario
          const passwordHash = createHash(password)
          const nuevoUsuario = await userModel.create({
            nombre: nombre,
            apellido: apellido,
            edad: edad,
            email: email,
            password: passwordHash,
            rol: rol,
          })
          return done(null, nuevoUsuario)
        } catch (error) {
          return done(error);
        }
      }));

  passport.use("login", new LocalStrategy(
      { usernameField: "email" },
      async (username, password, done) => {
        try {
          const user = await userModel.findOne({ email: username })
          if (!user) {
            return done(null, false);
          }
          if (validatePassword(password, user.password)) {
            console.log('password validation correct')
            return done(null, user)
          }
          // console.log('no hizo validaciones')

          return done(null, false)
        } catch (error) {
          return done(error)
        }
      }))

  passport.use( "github",  new GithubStrategy(
      {
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.SECRET_CLIENT,
        callbackURL: process.env.CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await userModel.findOne({ email: profile._json.email });
          if (user) {
            done(null, false);
          } else {
            const nuevoUsuario = await userModel.create({
              nombre: profile._json.nombre,
              email: profile._json.email,
              edad: 18,
              password: createHash(profile._json.email)
            })
            done(null, nuevoUsuario);
          }
        } catch (error) {
          done(error)
        }
      }))

  // Iniciar sesion
  passport.serializeUser((user, done) => {
    done(null, user._id)
  })

  //Eliminar sesion usuario
  passport.deserializeUser(async (id, done) => {
    const user = await userModel.findById(id)
    done(null, user)
  })}
  


export default inicializacionPassport
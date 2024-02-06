import passport from "passport"

//Retorno de errores en estrategias de passport
export const passportError = (strategy) => {
return async (req, res, next) => {
    passport.authenticate(strategy, (error, user, info) => {
        if (error){
            return next(error) //Next porque depende que estrategia use
        }
        if(!user){
            return res.status(401).send({error: info.messages ? info.messages : info.toString()})
        }
        req.session.user = user
        next()
    }) (req, res, next) //LLama un middleware
}
}
//Recibo un rol y establezco la capacidad de ese usuario, lo hago dinamico
// export const autorizacion = (rol) => {   
//     return async (req, res, next) =>{
//         if(!req.session.user) {
//         return res.status(401).send({error: 'Usuario no autorizado'})//veo si el token esta activo
// }
//         if(req.session.user.rol != rol){
//             return res.status(403).send({error: 'Usuario sin permisos necesarios'})
//         }
//     next()
//     }
export const autorizacion = (rol) => {   
    return async (req, res, next) =>{
        console.log("user", req.session.user)
        if(!req.session.user) {
        return res.status(401).send({error: 'Usuario no autorizado'})//veo si el token esta activo
}
        if(req.session.user.rol != rol){ return res.status(403).send({error: 'Usuario sin permisos necesarios'})
        }
    next()
    }
} 
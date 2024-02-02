import { Schema, model} from "mongoose"
import { cartModel} from './cart.models.js'
import paginate from "mongoose-paginate-v2"

const userSchema = new Schema({
    nombre: {
        type: String,
        required: true,
    }, 
    apellido: {
        type: String,
        index: true,
        required: true,
    }, 
    edad: {
        type: Number,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    }, 
    rol: {
        type: String,
        default: 'basico',
        enum: ['basico', 'premium']
    },
    ultima_conexion: {
        type : Date,
        default: Date.now
    },
    cart : {
    type: Schema.Types.ObjectId,
    ref: 'carts'
}
}) 

userSchema.plugin(paginate) 
userSchema.pre('save', async function(next){
    try{
        const newCart = await cartModel.create({})
        this.cart = newCart._id
    }catch(error){
        next(error)
    }
})


export const userModel = model('users', userSchema)
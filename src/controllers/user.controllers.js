import EErrors from '../services/error/enums.js'
import CustomError from "../services/error/customError.js";
import {generateUserErrorInfo} from "../services/error/message/info.js"
import { userModel } from "../models/user.models.js";

export const getUsers = async (req, res) => {
        const users = await userModel.find()
    console.log('users: ', users)
        try {
            const users = await userModel.find({}, 'nombre, apellido')
            res.status(200).send({ respuesta: 'OK', mensaje: users })
        } catch (error) {
            console.log(error)
            res.status(400).send({ respuesta: 'Error en consultar usuarios', mensaje: error })
        }
    }

    export const getUserbyId = async (req, res) => {
        const { id } = req.params
        try {
            const user = await userModel.findById(id)
            if (user) {
                res.status(200).send({ respuesta: 'OK', mensaje: user })
            } else {
                res.status(404).send({ respuesta: 'Error en consultar usuario', mensaje: 'User not Found' })
            }
        } catch (error) {
            res.status(400).send({ respuesta: 'Error en consultar usuario', mensaje: error })
        }
    }

    export const modifyUser =  async (req, res) => {
        const { id } = req.params
        const { nombre, apellido, edad, email, password} = req.body
        try {
            if(!nombre||!apellido || !email){
                CustomError.createError({
                    nombre: "Campo/s incompleto/s",
                    cause: generateUserErrorInfo({nombre, apellido, email}),
                    message: "Error al modificar usuario",
                    code: EErrors.INVALID_TYPES_ERROR
                })
            }
            const user = await userModel.findByIdAndUpdate(id, { nombre, apellido, edad, email, password })
            if (user) {
                res.status(200).send({ respuesta: 'OK', mensaje: req.body })
            } else {
                res.status(404).send({ respuesta: 'Error en actualizar usuario', mensaje: 'User not Found' })
            }
        } catch (error) {
            res.status(400).send({ error: error.code, mensaje: error.message})
        }
        }


    export const deleteUser =  async (req, res) => {
        try {
            const { id } = req.params
            const user = await userModel.findByIdAndDelete(id)
            if (user) {
                res.status(200).send({ respuesta: 'OK', mensaje: user })
            } else {
                res.status(404).send({ respuesta: 'Error en eliminar usuario', mensaje: 'Usuario no encontrado' })
            }
        } catch (error) {
            res.status(400).send({ respuesta: 'Error en eliminar usuario', mensaje: error })
        }
    }
import { Router } from "express";
import { userModel } from "../models/user.models.js";


const userRouter = Router()

userRouter.get('/', async (req, res) => {
    const users = await userModel.find()
console.log('users: ', users)
    try {
        const users = await userModel.find()
        res.status(200).send({ respuesta: 'OK', mensaje: users })
    } catch (error) {
        res.status(400).send({ respuesta: 'Error en consultar usuarios', mensaje: error })
    }
})

userRouter.get('/:id', async (req, res) => {
    const { id } = req.params
    try {
        const user = await userModel.findById(id)
        if (user) {
            console.log('MILEI2023')

            res.status(200).send({ respuesta: 'OK', mensaje: user })
        } else {
            console.log('kakita')
            res.status(404).send({ respuesta: 'KAKITA Error en consultar usuario', mensaje: 'User not Found' })
        }
    } catch (error) {
        res.status(400).send({ respuesta: 'Error en consultar usuario', mensaje: error })
    }
})


userRouter.put('/:id', async (req, res) => {
    const { id } = req.params
    const { nombre, apellido, edad, email, password} = req.body
    try {
        const user = await userModel.findByIdAndUpdate(id, { nombre, apellido, edad, email, password })
        if (user) {
            res.status(200).send({ respuesta: 'OK', mensaje: user })
        } else {
            res.status(404).send({ respuesta: 'Error en actualizar usuario', mensaje: 'User not Found' })
        }
    } catch (error) {
        res.status(400).send({ respuesta: 'Error en actualizar usuario', mensaje: error })
    }
})

userRouter.delete('/:id', async (req, res) => {
    const { id } = req.params
    try {
        const user = await userModel.findByIdAndDelete(id)
        if (user) {
            res.status(200).send({ respuesta: 'OK', mensaje: user })
        } else {
            res.status(404).send({ respuesta: 'Error en eliminar usuario', mensaje: 'User not Found' })
        }
    } catch (error) {
        res.status(400).send({ respuesta: 'Error en eliminar usuario', mensaje: error })
    }
})

export default userRouter

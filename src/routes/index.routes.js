import { Router } from "express";
import carritoRouter from "./cart.routes.js";
import productoRouter from "./producto.routes.js";
import sessionRouter from "./session.routes.js";
import messageRouter from "./message.routes.js";
import userRouter from "./user.routes.js";
import mockFakerRouter from './mockFaker.routes.js';

const router = Router()

router.use("/users", userRouter)
router.use("/productos", productoRouter);
router.use("/cart", carritoRouter);
router.use("/mensajes", messageRouter);
router.use("/sessions", sessionRouter);
router.use('/mockingproductos', mockFakerRouter)


export default router
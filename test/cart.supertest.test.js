import "dotenv/config";
import { expect } from "chai";
import mongoose from "mongoose";
import supertest from "supertest";

await mongoose.connect(process.env.MONGO_URL);

const requester = supertest('http://localhost:8080')

let newCartId = null;
let idProducto = '651c088c7e9e111a88d6c96a';
let cookie = {};

describe('Test CRUD supertest en ruta api/cart', function(){
    it('Iniciar sesion con POST a traves de /login', async function() { 
        this.timeout(5000)
        const user = {
            email: "pepe@gmail.com",
            password : "pepe1234"
        };
        const result = await requester.post('/api/sessions/login').send(user);
        const cookieResult = result.headers['set-cookie'][0]
        //Extraer valor de cookie
        const tokenValue = cookieResult.split("=")[1].split(";")[0];
        cookie = {
            name: cookieResult.split("=")[0],
            value: tokenValue
        }
        expect(cookie.name).to.be.ok.and.equal('jwtCookie');
        expect(cookieResult).to.be.ok;

})
it('Crear un cart mediante POST ', async function() { 
    this.timeout(5000);
    const result = await requester.post('/api/cart')
    console.log('Result', result.body.mensaje)
    newCartId = result.body.mensaje._id;
    expect(newCartId).to.be.ok;
    
});

it('Agregar producto a un cart mediante POST en /cart/:cid/productos/:pid', async function() {
    this.timeout(5000);
    const {statusCode, _body} = await requester.post(`/api/cart/${newCartId}/productos/${idProducto}`).set("authorization",`${cookie.value}`).send({cantidad:1});
    expect(_body).to.be.ok
    expect(statusCode).to.be.equal(200)
})
})
const contenedorProductos = document.getElementById("contenedorProductos");
const contenedorCarrito = document.getElementById("contenedorCarrito");
const botonAgregar = document.getElementsByClassName("agregar");
const socket = io();

socket.on("mostrarProductos", (productos) => {
  productos.forEach((producto) => {
    contenedorProductos.innerHTML += `
        <div id=${producto._id} class="containerItem">
            <h2>${producto.nombre}</h2>
            <p><b>Codigo:</b> ${producto.codigo}</p>
            <p><b>Descripcion:</b> ${producto.descripcion}</p>
            <p><b>Cantidad:</b> ${producto.cantidad}</p>
            <p><b>Precio: $</b>${producto.precio}</p>
            <p><b>Stock:</b> ${producto.stock}</p>
            <p><b>Categoria:</b> ${producto.categoria}</p>
            <button id=${producto._id} class='agregar'> Agregar al carrito </button>
            <p>(Al hacer click en agregar/eliminar solo se añade o elimina una unidad por click)</p>
            
        </div>
        `;
  });
});

const agregarAlCarrito = (e) => {
  socket.emit("agregarAlCarrito", e.target.id);
};

const eliminarDelCarrito = (e) => {
  socket.emit('eliminarDelCarrito', e.target.id)
}

socket.on('productosEnCarrito', (carritoViejo)=>{
  // console.log(carritoViejo)
  contenedorCarrito.innerHTML = '';
  carritoViejo.forEach((cartItem) => {
      // console.log(cartItem.id_prod)
        contenedorCarrito.innerHTML += `
            <div id=${cartItem.id_prod._id} class="cartItem">
            <p><span>Producto: </span>${cartItem.id_prod.nombre}</p>
            <p>Cantidad: ${cartItem.cantidad}</p>
            <button id=${cartItem.id_prod._id} class='eliminar'> Eliminar del carrito </button>
            </div>
            `;
      });
})

socket.on("carritoActualizado", (cart) => {
    // contenedorCarrito.innerHTML =`
    // <div class="containerCarritoProds">
    //    El carrito posee ${cart.productos.length} productos
    // </div>
    // `;
    contenedorCarrito.innerHTML = '';
    cart.productos.forEach((cartItem) => {
        contenedorCarrito.innerHTML += `
            <div id=${cartItem.id_prod._id} class="cartItem">
            <p>Producto: ${cartItem.id_prod.nombre}</p>
            <p>Cantidad: ${cartItem.cantidad}</p>
            <button id=${cartItem.id_prod._id} class='eliminar'> Eliminar del carrito </button>
            </div>
            `;
      });
});

document.addEventListener("click", (e) => e.target.matches(".agregar") && agregarAlCarrito(e));
document.addEventListener("click", (e) => e.target.matches(".eliminar") && eliminarDelCarrito(e));
socket.emit("cargarProductos");
socket.emit("mostrarProductosCarrito");

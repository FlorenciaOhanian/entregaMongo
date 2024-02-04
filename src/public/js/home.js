const contenedorProductos = document.getElementById('contenedorProductos');
const contenedorCarrito = document.getElementById('contenedorCarrito');
const botonAgregar = document.getElementsByClassName('agregar');
const finalizarCompra = document.getElementById('finalizarCompra');
const volverAlogin = document.getElementById('irLogin');
const mostrarMontoTotal = document.getElementById('mostrarMontoTotal');

const socket = io();

socket.on('mostrarProductos', (productos) => {
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
  socket.emit('agregarAlCarrito', e.target.id);
};

const eliminarDelCarrito = (e) => {
  socket.emit('eliminarDelCarrito', e.target.id);
};

socket.on('productosEnCarrito', (carritoViejo) => {
  console.log("carro", carritoViejo)
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
});

socket.on('carritoActualizado', (cart) => {
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

document.addEventListener(
  'click',
  (e) => e.target.matches('.agregar') && agregarAlCarrito(e)
);
document.addEventListener(
  'click',
  (e) => e.target.matches('.eliminar') && eliminarDelCarrito(e)
);
socket.emit('cargarProductos');
socket.emit('mostrarProductosCarrito');

finalizarCompra.addEventListener('click', handleOnclick);

let responseStatus;
async function handleOnclick() {
  try {
    await fetch(`/api/cart/${this.value}/purchase`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (response.ok) {
          responseStatus = true;
        }
        return response.json();
      })
      .then((data) => {
        // console.log('RESPONSE: ', data);
        localStorage.setItem('ticket', JSON.stringify(data));
        if (responseStatus) {
          responseStatus = false;
          window.location.href = '/static/ticket';
        }
      })
      .catch((error) => {
        throw error;
      });
  } catch (error) {
    console.error(error);
  }
}
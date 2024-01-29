const loginForm = document.getElementById('formLogin')
// const socket = io();

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const datForm = new FormData(e.target)
  const login = Object.fromEntries(datForm)
  try {
    await fetch('/api/sessions/login', {
        method: 'POST',
        redirect: 'follow',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(login)
    })
    .then(response =>{
        console.log('RESPONSE: ', response)
        if (response.ok)window.location.href = '/static/home'
    })
    .catch(error=>{
        throw(error)
    })
} catch (error) {
    console.error(error);
}
})



  // socket.emit('credenciales', {email : email, password: password})
  // socket.on('usuarioValido', ()=>{
  //   console.log('Logeando al usuario y redireccionando al Home')
  //   loginForm.submit();
  // })
  // socket.on('contraseñaInvalida', ()=>{
  //   console.log('PASSWORD INCORRECTA')
  //   alert('PASSWORD INCORRECTA')

  // })
  // socket.on('usuarioInexistente', ()=>{
  //   console.log('NO EXISTE USUARIO CON ESTE EMAIL')
  //   alert('NO EXISTE USUARIO CON ESTE EMAIL')
  // })
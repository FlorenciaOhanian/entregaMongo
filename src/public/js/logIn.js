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
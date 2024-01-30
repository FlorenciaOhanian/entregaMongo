const logout = document.getElementById("logout")

logout.addEventListener("click", async ()=>{
    try {
        await fetch('/api/sessions/logout', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response =>{
            if (response.ok){
                window.location.href = '/static/login'
            }
        })
        .catch(error=>{
            throw(error)
        })

    } catch (error) {
        console.error(error);
    }
})
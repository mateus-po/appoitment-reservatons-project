const error_box = document.getElementById("Errors");
const form = document.querySelector('form')
const Container = document.getElementById("Container")

form.addEventListener('submit', async (e) => {
    e.preventDefault()
    error_box.innerHTML = '<img src="/img/loading.gif">'

    const email = form.email.value

    try {
        const res = await fetch('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({email}),
            headers: {'Content-type': 'application/json'}
        })
        if (res.status != 201) {
            const data = await res.json()
            error_box.innerHTML = data.error;
        }
        else {
            Container.innerHTML = "<h1>Everything went smoothly<h1/><h3>Check your mailbox - we sent you an email:))</h3>"
        }

    } catch (err) {
        console.log(err)
    }
})
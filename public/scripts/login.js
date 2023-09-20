const form = document.querySelector("form");
const error_box = document.getElementById("Errors");

// validates given form input and sends data to the server
form.addEventListener("submit", async (e) => {
    // prevents the form from submitting
    e.preventDefault()

    // getting the values
    const email = form.email.value
    const password = form.password.value;


    // sending a requiest to a server and awaiting a response
    try {
        error_box.innerHTML = '<img src="/img/loading.gif">'
        const res = await fetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({email, password}),
            headers: {'Content-type': 'application/json'}
        })
        if (res.status != 201) {
            const data = await res.json()
            error_box.innerHTML = data.error;
        }
        else {
            const data = await res.json()
            location.assign(`/users/profile/${data.user}`)
        }

    } catch (err) {
        console.log(err)
    }

    
})
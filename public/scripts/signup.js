const form = document.querySelector("form");
const error_box = document.getElementById("Errors");

// validates given form input and sends data to the server
form.addEventListener("submit", async (e) => {
    // prevents the form from submitting
    e.preventDefault()

    // getting the values
    const email = form.email.value
    const nickname = form.nickname.value
    const password = form.password.value;
    const password_again = form.passwordAgain.value;

    // checking if nickname contains only allowed characters
    if (!/^[a-zA-Z0-9_-]*$/.test(nickname)) {
        form.nickname.classList.add("invalid")
        error_box.innerHTML = "Nickname consists of forbidden characters"
        return
    }
    else {
        form.nickname.classList.remove("invalid")
        error_box.innerHTML = ""
    }
    // chcecking if the given password isn't strong
    // take notice that the whole condition is negated
    if (!(/[a-z]/.test(password)    // at least one lowercase character
    && /[A-Z]/.test(password)       // at least one uppercase character
    && /[!@#$%^&*]/.test(password)  // at least one special character
    && /\d/.test(password)          // at least one digit
    && password.length >= 8         // at least eight characters long
    && password.length <= 50))      // maximum 50 characters
    {
        form.password.classList.add("invalid")
        error_box.innerHTML = `Given password isn't strong. To meet requirements for a strong password, it has to have:
        <ul>
        <li>Length ranging from 8 through 50 characters</li>
        <li>At least one lowercase character</li>
        <li>At least one uppercase character</li>
        <li>At least one digit</li>
        <li>At least one special character (! @ # $ % ^ & *)</li>
        </ul>`
        return
    }
    else {
        form.password.classList.remove("invalid")
        error_box.innerHTML = ""
    }

    // checking if both given passwords are the same
    if (password !== password_again) {
        form.password.classList.add("invalid")
        form.passwordAgain.classList.add("invalid")
        error_box.innerHTML = "Given passwords aren't the same"
        return
    }
    else {
        form.password.classList.remove("invalid")
        form.passwordAgain.classList.remove("invalid")
        error_box.innerHTML = ""
    }
    // sending a requiest to a server and awaiting a response
    try {
        error_box.innerHTML = ""
        const res = await fetch('/auth/signup', {
            method: 'POST',
            body: JSON.stringify({email, nickname, password}),
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
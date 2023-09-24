const error_box = document.getElementById("Errors");
const form = document.querySelector('form')
const Container = document.getElementById("Container")
const passwordInput = document.getElementById('Password')
const passwordAgainInput = document.getElementById('PasswordAgain')

form.addEventListener('submit', async (e) => {
    e.preventDefault()

     const password = passwordInput.value;
     const password_again = passwordAgainInput.value;
 
     // chcecking if the given password isn't strong
     // take notice that the whole condition is negated
     if (!(/[a-z]/.test(password)    // at least one lowercase character
     && /[A-Z]/.test(password)       // at least one uppercase character
     && /[!@#$%^&*]/.test(password)  // at least one special character
     && /\d/.test(password)          // at least one digit
     && password.length >= 8         // at least eight characters long
     && password.length <= 50))      // maximum 50 characters
     {
         passwordInput.classList.add("invalid")
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
         passwordInput.classList.remove("invalid")
         error_box.innerHTML = ""
     }
 
     if (password !== password_again) {
         passwordInput.classList.add("invalid")
         passwordAgainInput.classList.add("invalid")
         error_box.innerHTML = "Given passwords aren't the same"
         return
     }
     else {
         passwordInput.classList.remove("invalid")
         passwordAgainInput.classList.remove("invalid")
         error_box.innerHTML = ""
     }

    error_box.innerHTML = '<img src="/img/loading.gif">'

    try {
        const res = await fetch(location.href, {
            method: 'POST',
            body: JSON.stringify({password}),
            headers: {'Content-type': 'application/json'}
        })
        if (res.status != 201) {
            const data = await res.json()
            error_box.innerHTML = data.error;
        }
        else {
            Container.innerHTML = "<h1>Password has been changed successfully<h1/><h3>You can log in now using your new password:></h3>"
        }

    } catch (err) {
        console.log(err)
        error_box.innerHTML = 'Unknown Error'

    }
})
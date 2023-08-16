const EmailField = document.getElementById("Email")
const EmailInput = EmailField.querySelector('input')
const EmailErrorBox = document.getElementById('EmailErrorBox')
const SaveEmailButton = document.getElementById('SaveEmail')

const NicknameField = document.getElementById("Nickname")
const NicknameInput = NicknameField.querySelector('input')
const NicknameErrorBox = document.getElementById('NicknameErrorBox')
const SaveNicknameButton = document.getElementById('SaveNickname')

const DescriptionField = document.getElementById("Description")
const DescriptionInput = DescriptionField.querySelector("textarea")
const DescriptionErrorBox = document.getElementById('DescriptionErrorBox')
const SaveDescriptionButton = document.getElementById('SaveDescription')

const CurrentPasswordInput = document.getElementById("CurrentPassword")
const NewPasswordInput = document.getElementById("NewPassword")
const NewPasswordAgainInput = document.getElementById("NewPasswordAgain")
const SavePasswordButton = document.getElementById("SavePassword")

function inputOn(me) {
    clearAll()
    me.querySelector('span').style = "display: none;";
    me.querySelector('img').style = "display: none;";
    if (me.querySelector('input')) me.querySelector('input').style = "display: inline;";
    else me.querySelector('textarea').style = "display: block;";
    me.querySelectorAll('button')[0].style = "display: inline;";
    me.querySelectorAll('button')[1].style = "display: inline;";
}
function inputOff(me) {
    me.querySelector('div').innerHTML = "";
    me.querySelector('span').style = "display: inline;";
    me.querySelector('img').style = "display: inline;";
    if (me.querySelector('input')) me.querySelector('input').style = "display: none;";
    else me.querySelector('textarea').style = "display: none;";
    me.querySelectorAll('button')[0].style = "display: none;";
    me.querySelectorAll('button')[1].style = "display: none;";
}
function passwordInputOn() {
    clearAll()
    const Field = document.getElementById("Password")
    for (node of Field.childNodes) {
        node.style = "display: inline;";
    }
}
function passwordInputOff() {
    const Field = document.getElementById("Password")
    for (node of Field.childNodes) {
        node.style = "display: none;";
    }
}
function clearAll() {
    inputOff(EmailField);
    inputOff(NicknameField);
    inputOff(DescriptionField);
    passwordInputOff();
}
async function submit(type, value, error_box, validate) {
    error_box.innerHTML = ""
    let validation_message = validate(value)
    if (validation_message) {
        error_box.innerHTML = validation_message
        return
    }
    let data_to_send = {}
    data_to_send[type] = value
    if (type == "newPassword") {
        data_to_send['oldPassword'] = CurrentPasswordInput.value;
    }
    // sending a requiest to a server and awaiting a response
    try {
        const res = await fetch('/users/edit', {
            method: 'POST',
            body: JSON.stringify(data_to_send),
            headers: {'Content-type': 'application/json'}
        })
        if (res.status != 201) {
            const data = await res.json()
            error_box.innerHTML = data.error
            return
        }
        else {
            alert("Account information has been updated successfully")
            location.reload()
        }

    } catch (err) {
        console.log(err)
    }
}

const validateEmail = (email) => {
    if (!email.match(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
        return `${email} is not a correct e-mail`
    }
  };

const validateNickname = (nickname) => {
    if (!nickname.match(/^[a-zA-Z0-9_-]*$/)) {
        return `Given nickname consists of forbidden characters`
    }
}
const validateDescription = (description) => {
    
}
const validatePassword = (password) => {
    // chcecking if the given password isn't strong
    // take notice that the whole condition is negated
    if (!(/[a-z]/.test(password)    // at least one lowercase character
    && /[A-Z]/.test(password)       // at least one uppercase character
    && /[!@#$%^&*]/.test(password)  // at least one special character
    && /\d/.test(password)          // at least one digit
    && password.length >= 8         // at least eight characters long
    && password.length <= 50))      // maximum 50 characters
    {
        return `Given password isn't strong. To meet requirements for a strong password, it has to have:
        <ul>
        <li>Length ranging from 8 through 50 characters</li>
        <li>At least one lowercase character</li>
        <li>At least one uppercase character</li>
        <li>At least one digit</li>
        <li>At least one special character (! @ # $ % ^ & *)</li>
        </ul>`
    }
    if (NewPasswordInput.value != NewPasswordAgainInput.value) {
        return "Given passwords aren't the same"
    }
}

SaveEmailButton.addEventListener('click', () => submit("email", EmailInput.value, EmailErrorBox, validateEmail))
SaveNicknameButton.addEventListener('click', () => submit("nickname", NicknameInput.value, NicknameErrorBox, validateNickname))
SaveDescriptionButton.addEventListener('click', () => submit("description", DescriptionInput.value, DescriptionErrorBox, validateDescription))
SavePasswordButton.addEventListener('click', () => submit("newPassword", NewPasswordInput.value, PasswordErrorBox, validatePassword))
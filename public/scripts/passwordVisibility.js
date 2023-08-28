
function togglePasswordVisibility(wrapper) {
    const input = wrapper.querySelector('input')
    const img = wrapper.querySelector('img')

    if (input.type === "password") {
        input.type = 'text'
        img.src = '/img/icon-eye-open.svg'
    }
    else {
        input.type = 'password'
        img.src = '/img/icon-eye-closed.svg'
    }
}
function passwordOnFocus(wrapper) {
    const input = wrapper.querySelector('input')
    const img = wrapper.querySelector('img')
    input.type = 'password'
    img.src = '/img/icon-eye-closed.svg'
}
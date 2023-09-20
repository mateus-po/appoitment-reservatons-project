const SearchInput = document.getElementById('Search-Input')
const SearchIcon = document.getElementById('Search-Icon')

function redirectSearch(e) {
    // doesn't do anything if there is no search phrase in the input
    if (SearchInput.value == "") return

    // if there is a key for event (corresponding for key on the keyboard that was pressed) and its value isn't "Enter", the page doesn't do anything
    if (e.key && e.key != "Enter") return

    location.href = `/article/search/${SearchInput.value}`
}

SearchIcon.addEventListener('click', redirectSearch)
SearchInput.addEventListener('keydown', redirectSearch)
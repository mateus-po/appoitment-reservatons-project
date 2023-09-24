const SearchInput = document.getElementById('Search-Input')
const SearchIcon = document.getElementById('Search-Icon')

function redirectSearch(e) {
    
    if (SearchInput.value == "") return

    if (e.key && e.key != "Enter") return

    location.href = `/article/search/${SearchInput.value}`
}

SearchIcon.addEventListener('click', redirectSearch)
SearchInput.addEventListener('keydown', redirectSearch)
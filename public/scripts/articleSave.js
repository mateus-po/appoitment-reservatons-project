const ArticleNameInput = document.getElementById("ArticleNameInput")
const ArticleNameErrorBox = document.getElementById("ArticleNameErrorBox")
const SaveButton = document.getElementById('save-button');
const ValidateTitleButton = document.getElementById('ValidateTitle')

SaveButton.addEventListener('click', async () => {
  ArticleNameErrorBox.innerHTML = ""

  if (!ArticleNameInput.value) {
    ArticleNameErrorBox.innerHTML = "Article name is required"
    return
  }

  let sanitazedArticleName = ArticleNameInput.value
  sanitazedArticleName = sanitazedArticleName.replaceAll('<', '&lt;')
  sanitazedArticleName = sanitazedArticleName.replaceAll('>', '&gt;')

 const savedMainData = await main_editor.save()
 const savedSideData = await side_editor.save()

 const res = await fetch( "/article/new", {
  method: 'POST',
  body: JSON.stringify({
    title: sanitazedArticleName,
    articleData: savedMainData,
    sideBody: savedSideData
  }),
  headers: {'Content-type': 'application/json'}
 })
 if (res.status === 201) {
    alert('The acticle has been successfully created')
    location.assign(await res.text())
 }
 else {
    alert(await res.text())
 }
})

ValidateTitleButton.addEventListener('click', async () => {
    ArticleNameErrorBox.innerHTML = ""

    if (!ArticleNameInput.value) {
      ArticleNameErrorBox.innerHTML = "Article name is required"
      return
    }
    let sanitazedArticleName = ArticleNameInput.value
    sanitazedArticleName = sanitazedArticleName.replaceAll('<', '&lt;')
    sanitazedArticleName = sanitazedArticleName.replaceAll('>', '&gt;')

    const res = await fetch('/article/new/check-title', {
      method: 'POST',
      body: JSON.stringify({title: sanitazedArticleName}),
      headers: {'Content-type': 'application/json'}
    })
    if (res.status === 201) {
      alert('Article name is valid')
   }
   else {
    ArticleNameErrorBox.innerHTML = await res.text()
   }
})
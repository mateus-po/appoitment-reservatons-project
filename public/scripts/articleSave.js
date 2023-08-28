const ArticleNameInput = document.getElementById("ArticleNameInput")
const ArticleNameErrorBox = document.getElementById("ArticleNameErrorBox")
const saveButton = document.getElementById('save-button');

saveButton.addEventListener('click', async () => {
  // clearing errorbox for article name
  ArticleNameErrorBox.innerHTML = ""
  // if no article name is given
  if (!ArticleNameInput.value) {
    ArticleNameErrorBox.innerHTML = "Article name is required"
    return
  }
  // sanitizing given name
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
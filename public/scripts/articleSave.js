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
  sanitazedArticleName = sanitazedArticleName.replace('<', '&lt;')
  sanitazedArticleName = sanitazedArticleName.replace('>', '&gt;')

 const savedMainData = await main_editor.save()
 const savedSideData = await side_editor.save()
  console.log(savedMainData)

 main_editor.render('{"body":{"time":1692949946650,"blocks":[{"id":"CNDgjH4aFX","type":"paragraph","data":{"text":"1111231"}},{"id":"IHXUdd11Y5","type":"image","data":{"file":{"url":"/img/article/9f171d79e1489d0da617fccffc5df36c"},"caption":"234234234234","withBorder":false,"stretched":false,"withBackground":false}}],"version":"2.27.2"}}')
  main_editor.readOnly.toggle()

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
import { json } from "stream/consumers"

var Img = require('../models/Image')
var Article = require('../models/Article')
var User = require('../models/User')
var fs = require('fs')
var jwt = require('jsonwebtoken')
var { absolutePath, secretString } = require('../globalVariables')
// allows uploading photos via Editor.js editor
// it saves photos in public/img/tmp
// the photos will be moved to public/img/article folder if the article will be saved
// otherwise the photos will disappear form the tmp polder after a day
module.exports.uploadFile_post = async (req:any, res:any) => {
  // req.file is the name of your file in the form above, here 'uploaded_file'
  // req.body will hold the text fields, if there were any 
  let now = new Date()
  try {
    await Img.create({
      path: `/img/article/${req.file.filename}`,
      hasArticle: false,
      uploadTime: now.getTime()
    })
    let response = {
      success : 1,
      file: {
          url : `/img/article/${req.file.filename}`
      }
    }
    res.status(200).json(response)
}
catch (err) { console.log(err) }

}
// it deletes photos from server if user deletes it from the article during editing it
module.exports.deleteFile_delete = async (req:any, res:any) => {
  try {
    let path = req.body.path
    fs.unlinkSync(absolutePath + "/public" + path)
    res.status(201).send("success")
  } catch (err:any) {
    res.status(424).send(err.message)
  }
}
// allows checking if there is already an article with given title
module.exports.checkTitle_post = (req:any, res:any) => {
}
// creates a new article and saves it on the database
module.exports.newArticle_post = async (req:any, res:any) => {

  let title = req.body.title

  if (!title) {
    res.status(424).send('Article title is required')
    return
  }

  // sanitazing the title
  title = title.replace('<', '&lt;')
  title = title.replace('>', '&gt;')

  // url name is the same as title, but with spaces replaced with hyphens
  let url = title.replace(' ', '-')

  let lastEdited = req.body.articleData.time

  let body = JSON.stringify(req.body.articleData)
  let sideBody = JSON.stringify(req.body.sideBody)

  const token = req.cookies.jwt

  if (!token) 
  {
    res.redirect('/auth/login')
  }
  jwt.verify(token, secretString, async (err:any, decodedToken:any): Promise<void> => {
    if (err) {
      res.redirect('/auth/login')
    }
    try {
      const user = await User.findById(decodedToken.id)

      let lastAuthor = user.nickname

      const article = await Article.create({
        title,
        url,
        lastAuthor,
        lastEdited, 
        body,
        sideBody,
      })

      console.log('/article/' + article.url)
      res.status(201).send('/article/' + article.url)

    }
    catch (err:any) {
      if (err.code == 11000) {
        res.status(424).send("Given article title was not unique")

      }
        console.log(err)
        res.status(424).send("Unknown error")
        return
    }   
    


})
  
}
module.exports.viewArticle_get = async (req:any, res:any) => {
    let url = req.params.articleUrl
    
    if (!url) res.status(404).redirect('/error404')

    const article = await Article.findOne({url})

    if (!article) res.status(404).redirect('/error404')


    // article.body = JSON.parse(article.body)
    // article.sideBody = JSON.parse(article.sideBody)

    // article.sideBody = await article.sideBody
    // const article_to_send = await JSON.parse(article)

    res.render('article/articleView', {article})
}

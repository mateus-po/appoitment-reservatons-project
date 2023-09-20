var Img = require('../models/Image')
var Article = require('../models/Article')
var User = require('../models/User')
var fs = require('fs')
var jwt = require('jsonwebtoken')
var { absolutePath, secretString, rememberedRecentlyEditedArticles } = require('../globalVariables')
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
    await Img.findOneAndDelete({path})
    res.status(201).send("success")
  } catch (err:any) {
    res.status(424).send(err.message)
  }
}
//renders index page with data about ten newest created articles
module.exports.viewIndex_get = async (req:any, res:any) => {
  // getting ten newest articles

  const newest_articles = await Article.find({}, 'title url lastAuthor lastEdited').sort({ lastEdited: -1 }).limit(10)

  res.render('index', {newest_articles})
}
// allows checking if there is already an article with given title
module.exports.checkTitle_post = async (req:any, res:any) => {
  const article = await Article.findOne({title: req.body.title})

  if (!article) {
    res.status(201).send('success')
    return
  }
  res.status(400).send('There already exists an article with given name')
}
// creates a new article and saves it on the database
module.exports.newArticle_post = async (req:any, res:any) => {
  // to delete all articles before saving any data
  // Article.collection.deleteMany({})

  let title = req.body.title

  if (!title) {
    res.status(424).send('Article title is required')
    return
  }

  // sanitazing the title
  title = title.replace(/</g, '&lt;')
  title = title.replace(/>/g, '&gt;')

  // url name is the same as title, but with spaces replaced with hyphens
  let url = title.replace(/ /g, '-')

  let lastEdited = req.body.articleData.time
  let body = req.body.articleData
  let sideBody = req.body.sideBody
  // adding some data into body and sideBody objects
  // it prevents the Editor.js form bugging when rendering an empty editor
  if (body.blocks.length == 0) {
    body.blocks = [{id:"dvSFGiwGIy",type:"paragraph",data:{text:""}}]
  }
  if (sideBody.blocks.length == 0) {
    sideBody.blocks = [{id:"dvSFGiwGIy",type:"paragraph",data:{text:""}}]
  }

  // assigning true to the all images hasArticle property
  // used for avoiding deletion of images that are assigned to some articles
  // images having hasArticle === false will be periodically deleted as a means of garbage collecting
  try {
    for (let block of body.blocks) {
      if (block.type == 'image') {
        let path = block.data.file.url
        await Img.findOneAndUpdate({path}, {hasArticle: true})
      }
    }
  } catch (err:any) {
    console.log(err.message)
    res.redirect('/error500')
    return
  }


  body = JSON.stringify(body)
  sideBody = JSON.stringify(sideBody)

  const token = req.cookies.jwt

  if (!token) 
  {
    res.redirect('/auth/login')
    return
  }
  jwt.verify(token, secretString, async (err:any, decodedToken:any): Promise<void> => {
    if (err) {
      res.redirect('/auth/login')
      return
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
        views: 0,
        edits: 1,
      })

      user.recentlyEditedArticles = updateRecentlyEdited(user.recentlyEditedArticles, article.title, article.url, article.lastEdited)
      user.save()
      res.status(201).send('/article/url/' + article.url)
    }
    catch (err:any) {
      if (err.code == 11000) {
        res.status(424).send("Given article title was not unique")
        return
      }
        console.log(err)
        res.status(424).send("Unknown error")
        return
    }   
})
  
}
// loads a page with some data
// after successfully loading Editor.js module the site will query for the
// rest of the data via POST request
module.exports.viewArticle_get = async (req:any, res:any) => {
    const url = decodeURI(req.params.articleUrl)
    
    if (!url) {
      res.status(404).redirect('/error404')
      return
    }

    const article = await Article.findOne({url}, 'title lastEdited lastAuthor url views edits')

    if (!article) {
      res.status(404).redirect('/error404')
      return
    }

    // incrementing article views parameter
    if (!article.views) article.views = 0

    article.views = article.views + 1;
    await article.save() 

    res.render('article/articleView', {article})
}

module.exports.viewArticle_post = async (req:any, res:any) => {

  const url = decodeURI(req.params.articleUrl)
  
  if (!url) {
    res.status(404).json({error: 'there was a problem'})
    return
  }

  const article = await Article.findOne({url}, 'body sideBody')

  if (!article) {
    res.status(404).json({error: 'there was a problem'})
    return
  }

  res.status(201).json(article)
}
// does virtually the same as viewArticle_get, but renders different page
module.exports.editArticle_get = async (req:any, res:any) => {
  const url = decodeURI(req.params.articleUrl)
  
  if (!url) {
    res.status(404).redirect('/error404')
    return
  }

  const article = await Article.findOne({url}, 'title lastEdited lastAuthor url')

  if (!article) {
    res.status(404).redirect('/error404')
    return
  }

  res.render('article/articleEdit', {article})
}
module.exports.editArticle_post = async (req:any, res:any) => {
  const url = decodeURI(req.params.articleUrl)

  const lastEdited = req.body.lastEdited
  const token = req.cookies.jwt

  let body = req.body.articleData
  let sideBody = req.body.sideBody
  // adding some data into body and sideBody objects
  // it prevents the Editor.js form bugging when rendering an empty editor
  if (body.blocks.length == 0) {
    body.blocks = [{id:"dvSFGiwGIy",type:"paragraph",data:{text:""}}]
  }
  if (sideBody.blocks.length == 0) {
    sideBody.blocks = [{id:"dvSFGiwGIy",type:"paragraph",data:{text:""}}]
  }

  body = JSON.stringify(body)
  sideBody = JSON.stringify(sideBody)

  if (!url || !token) {
    res.status(404).json({error: 'There has been an error'})
    return
  }

  jwt.verify(token, secretString, async (err:any, decodedToken:any): Promise<void> => {
    if (err) {
      res.status(404).json({error: 'There has been an error'})
      return
    }
    try {
      const user = await User.findById(decodedToken.id)

      let lastAuthor = user.nickname

      // Article.findOneAndUpdate({url}, {body, sideBody, lastEdited, lastAuthor})
      // console.log(url)
      // res.status(201).send('success')

      const article = await Article.findOne({url})
      article.body = body
      article.sideBody = sideBody
      article.lastEdited = lastEdited
      article.lastAuthor = lastAuthor
      if (!article.edits) article.edits = 0;
      article.edits ++
      user.recentlyEditedArticles = updateRecentlyEdited(user.recentlyEditedArticles, article.title, article.url, article.lastEdited)
      article.save()
      user.save()
      res.status(201).send('success')

    }
    catch (err:any) {
        console.log(err)
        res.status(424).json({error: 'There has been an error'})
    }   
})
}
module.exports.randomArticle_get = async (req:any, res:any) => {
  const articles_count = await Article.countDocuments({})

  if (articles_count == 0) {
    res.status(404).render('404')
    return
  }

  const articles_to_skip = Math.floor(Math.random() * articles_count)

  const random_article = await Article.findOne({}).skip(articles_to_skip)

  res.redirect('/article/url/' + random_article.url)
}
module.exports.searchArticle_get = async (req:any, res:any) => {

  const searchPhrase = req.params.searchPhrase

  try {
    const matchingArticles = await Article.find({ $text: {$search: searchPhrase }}, 'title url lastAuthor lastEdited edits').limit(20)
  
    res.status(200).render('article/articleSearch', {searchPhrase, matchingArticles})
  } catch (err: any) {

    console.log(err.message)
    res.status(500).render('500')
  }


}
module.exports.mostPopularArticles_get = async (req:any, res:any) => {
  try {
    const most_viewed_articles = await Article.find({}, 'title url lastAuthor lastEdited views edits').sort({views: -1}).limit(10)
    const most_edited_articles = await Article.find({}, 'title url lastAuthor lastEdited views edits').sort({edits: -1}).limit(10)

    res.status(201).render('article/articleMostPopular', {most_viewed_articles, most_edited_articles})
  }
  catch (err:any) {
    res.status(500).redirect('/error500')
  }
}

// this function takes care of adding articles to the recently edited array
// recentlyEdited is a JSON object which follows the structure:
// {article_titles: [], article_urls: [], article_time: []}
function updateRecentlyEdited(recently_edited:string, article_title:string, article_url:string, edit_time: Date) :string {
  let recently_edited_data
  try {
    recently_edited_data = JSON.parse(recently_edited)
    if (
      !recently_edited_data.article_titles ||
      !recently_edited_data.article_urls ||
      !recently_edited_data.article_time
    ) {
      throw Error("Given recenly_edited string is not valid")
    }
  } catch (err) {
    return JSON.stringify({article_titles: [article_title], article_urls: [article_url], article_time: [edit_time.valueOf()]})
  }
  let new_article_index = recently_edited_data.article_titles.indexOf(article_title)
  // if new_article_index is equal to -1, it menas it wasnt found in the array
  if (new_article_index != -1) {
      // deleting an item at index
    recently_edited_data.article_titles.splice(new_article_index, 1)
    recently_edited_data.article_urls.splice(new_article_index, 1)
    recently_edited_data.article_time.splice(new_article_index, 1)
  }
  // adding the same data at the beginnings of the arrays
  recently_edited_data.article_titles.unshift(article_title)
  recently_edited_data.article_urls.unshift(article_url)
  recently_edited_data.article_time.unshift(edit_time.valueOf())
  // if there are too many articles remembered in the arrays, it deletes the last entries
  if (recently_edited_data.article_titles.length > rememberedRecentlyEditedArticles) {
    recently_edited_data.article_titles.pop()
    recently_edited_data.article_urls.pop()
    recently_edited_data.article_time.pop()
  }
  return JSON.stringify(recently_edited_data)
}


"use strict";
var express = require('express');
var router = express.Router();
var articlesController = require('../controllers/articlesController');
var { requireAuth } = require("../middleware/authmiddleware");
var multer = require('multer');
var upload = multer({ dest: './public/img/article' });
// used in uploading articles images 
router.post('/uploadFile', requireAuth, upload.single('image'), articlesController.uploadFile_post);
// used to delete articles images
router.delete('/deleteFile', requireAuth, articlesController.deleteFile_delete);
// renderes index page
router.get('/', function (req, res, next) {
    res.render("index");
});
// renders 404 error
router.get('/error404', (req, res) => {
    res.render('404');
});
// renders articleNew view
router.get('/article/new', requireAuth, (req, res) => {
    res.render('article/articleNew');
});
// used to check if the article title is available (it has to be unique)
router.post('/article/new/check-title', requireAuth, articlesController.checkTitle_post);
// adding a new article
router.post('/article/new', requireAuth, articlesController.newArticle_post);
// viewing a article
router.get('/article/url/:articleUrl', articlesController.viewArticle_get);
// sending additional data
router.post('/article/url/:articleUrl', articlesController.viewArticle_post);
// editing an article - it uses the same functions as viewing articles
router.get('/article/url/:articleUrl/edit', requireAuth, articlesController.editArticle_get);
// saving changes made to the post
router.post('/article/url/:articleUrl/edit', requireAuth, articlesController.editArticle_post);
module.exports = router;

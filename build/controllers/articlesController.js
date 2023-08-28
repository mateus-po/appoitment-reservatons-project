"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
var Img = require('../models/Image');
var Article = require('../models/Article');
var User = require('../models/User');
var fs = require('fs');
var jwt = require('jsonwebtoken');
var { absolutePath, secretString, rememberedRecentlyEditedArticles } = require('../globalVariables');
// allows uploading photos via Editor.js editor
// it saves photos in public/img/tmp
// the photos will be moved to public/img/article folder if the article will be saved
// otherwise the photos will disappear form the tmp polder after a day
module.exports.uploadFile_post = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // req.file is the name of your file in the form above, here 'uploaded_file'
    // req.body will hold the text fields, if there were any 
    let now = new Date();
    try {
        yield Img.create({
            path: `/img/article/${req.file.filename}`,
            hasArticle: false,
            uploadTime: now.getTime()
        });
        let response = {
            success: 1,
            file: {
                url: `/img/article/${req.file.filename}`
            }
        };
        res.status(200).json(response);
    }
    catch (err) {
        console.log(err);
    }
});
// it deletes photos from server if user deletes it from the article during editing it
module.exports.deleteFile_delete = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let path = req.body.path;
        fs.unlinkSync(absolutePath + "/public" + path);
        res.status(201).send("success");
    }
    catch (err) {
        res.status(424).send(err.message);
    }
});
// allows checking if there is already an article with given title
module.exports.checkTitle_post = (req, res) => {
};
// creates a new article and saves it on the database
module.exports.newArticle_post = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // to delete all articles before saving any data
    // Article.collection.deleteMany({})
    let title = req.body.title;
    if (!title) {
        res.status(424).send('Article title is required');
        return;
    }
    // sanitazing the title
    title = title.replace(/</g, '&lt;');
    title = title.replace(/>/g, '&gt;');
    // url name is the same as title, but with spaces replaced with hyphens
    let url = title.replace(/ /g, '-');
    let lastEdited = req.body.articleData.time;
    let body = req.body.articleData;
    let sideBody = req.body.sideBody;
    // adding some data into body and sideBody objects
    // it prevents the Editor.js form bugging when rendering an empty editor
    if (body.blocks.length == 0) {
        body.blocks = [{ id: "dvSFGiwGIy", type: "paragraph", data: { text: "" } }];
    }
    if (sideBody.blocks.length == 0) {
        sideBody.blocks = [{ id: "dvSFGiwGIy", type: "paragraph", data: { text: "" } }];
    }
    body = JSON.stringify(body);
    sideBody = JSON.stringify(sideBody);
    const token = req.cookies.jwt;
    if (!token) {
        res.redirect('/auth/login');
    }
    jwt.verify(token, secretString, (err, decodedToken) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            res.redirect('/auth/login');
        }
        try {
            const user = yield User.findById(decodedToken.id);
            let lastAuthor = user.nickname;
            const article = yield Article.create({
                title,
                url,
                lastAuthor,
                lastEdited,
                body,
                sideBody,
            });
            user.recentlyEditedArticles = updateRecentlyEdited(user.recentlyEditedArticles, article.title, article.url, article.lastEdited);
            user.save();
            res.status(201).send('/article/url/' + article.url);
        }
        catch (err) {
            if (err.code == 11000) {
                res.status(424).send("Given article title was not unique");
            }
            console.log(err);
            res.status(424).send("Unknown error");
            return;
        }
    }));
});
// loads a page with some data
// after successfully loading Editor.js module the site will query for the
// rest of the data via POST request
module.exports.viewArticle_get = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const url = decodeURI(req.params.articleUrl);
    if (!url)
        res.status(404).redirect('/error404');
    const article = yield Article.findOne({ url }, 'title lastEdited lastAuthor url');
    if (!article)
        res.status(404).redirect('/error404');
    res.render('article/articleView', { article });
});
module.exports.viewArticle_post = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const url = decodeURI(req.params.articleUrl);
    if (!url)
        res.status(404).json({ error: 'there was a problem' });
    const article = yield Article.findOne({ url }, 'body sideBody');
    if (!article)
        res.status(404).json({ error: 'there was a problem' });
    res.status(201).json(article);
});
// does virtually the same as viewArticle_get, but renders different page
module.exports.editArticle_get = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const url = decodeURI(req.params.articleUrl);
    if (!url)
        res.status(404).redirect('/error404');
    const article = yield Article.findOne({ url }, 'title lastEdited lastAuthor url');
    if (!article)
        res.status(404).redirect('/error404');
    res.render('article/articleEdit', { article });
});
module.exports.editArticle_post = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const url = decodeURI(req.params.articleUrl);
    const lastEdited = req.body.lastEdited;
    const token = req.cookies.jwt;
    let body = req.body.articleData;
    let sideBody = req.body.sideBody;
    // adding some data into body and sideBody objects
    // it prevents the Editor.js form bugging when rendering an empty editor
    if (body.blocks.length == 0) {
        body.blocks = [{ id: "dvSFGiwGIy", type: "paragraph", data: { text: "" } }];
    }
    if (sideBody.blocks.length == 0) {
        sideBody.blocks = [{ id: "dvSFGiwGIy", type: "paragraph", data: { text: "" } }];
    }
    body = JSON.stringify(body);
    sideBody = JSON.stringify(sideBody);
    if (!url || !token)
        res.status(404).json({ error: 'There has been an error' });
    jwt.verify(token, secretString, (err, decodedToken) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            res.status(404).json({ error: 'There has been an error' });
        }
        try {
            const user = yield User.findById(decodedToken.id);
            let lastAuthor = user.nickname;
            // Article.findOneAndUpdate({url}, {body, sideBody, lastEdited, lastAuthor})
            // console.log(url)
            // res.status(201).send('success')
            const article = yield Article.findOne({ url });
            article.body = body;
            article.sideBody = sideBody;
            article.lastEdited = lastEdited;
            article.lastAuthor = lastAuthor;
            user.recentlyEditedArticles = updateRecentlyEdited(user.recentlyEditedArticles, article.title, article.url, article.lastEdited);
            article.save();
            user.save();
            res.status(201).send('success');
        }
        catch (err) {
            console.log(err);
            res.status(424).json({ error: 'There has been an error' });
        }
    }));
});
// this function takes care of adding articles to the recently edited array
// recentlyEdited is a JSON object which follows the structure:
// {article_titles: [], article_urls: [], article_time: []}
function updateRecentlyEdited(recently_edited, article_title, article_url, edit_time) {
    let recently_edited_data;
    try {
        recently_edited_data = JSON.parse(recently_edited);
        if (!recently_edited_data.article_titles ||
            !recently_edited_data.article_urls ||
            !recently_edited_data.article_time) {
            throw Error("Given recenly_edited string is not valid");
        }
    }
    catch (err) {
        return JSON.stringify({ article_titles: [article_title], article_urls: [article_url], article_time: [edit_time.valueOf()] });
    }
    let new_article_index = recently_edited_data.article_titles.indexOf(article_title);
    // if new_article_index is equal to -1, it menas it wasnt found in the array
    if (new_article_index != -1) {
        // deleting an item at index
        recently_edited_data.article_titles.splice(new_article_index, 1);
        recently_edited_data.article_urls.splice(new_article_index, 1);
        recently_edited_data.article_time.splice(new_article_index, 1);
    }
    // adding the same data at the beginnings of the arrays
    recently_edited_data.article_titles.unshift(article_title);
    recently_edited_data.article_urls.unshift(article_url);
    recently_edited_data.article_time.unshift(edit_time.valueOf());
    // if there are too many articles remembered in the arrays, it deletes the last entries
    if (recently_edited_data.article_titles.length > rememberedRecentlyEditedArticles) {
        recently_edited_data.article_titles.pop();
        recently_edited_data.article_urls.pop();
        recently_edited_data.article_time.pop();
    }
    return JSON.stringify(recently_edited_data);
}

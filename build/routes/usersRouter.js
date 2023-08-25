"use strict";
var multer = require('multer');
var upload = multer({ dest: './public/img/userAvatars' });
// this router handles users page
var express = require('express');
var router = express.Router();
var userController = require('../controllers/usersController');
var { requireAuth } = require('../middleware/authmiddleware');
router.get('/edit', requireAuth, userController.userEdit_get);
router.post('/edit/avatar', requireAuth, upload.single('avatar'), userController.userEditAvatar_post);
router.post('/edit', requireAuth, userController.userEdit_post);
router.get('/profile/:username', userController.userPage_get);
module.exports = router;

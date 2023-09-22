"use strict";
// specifies port at which the app will be running
module.exports.port = 3000;
// secret string that is used to hash JWT
module.exports.secretString = "A secret string, it is not to be shared with anyone!!!";
// how many times we want to hash the password (it will hash 10^saltrounds times)
module.exports.saltrounds = 14;
// maximum age that JWT can live for (in seconds) - it determines the maximum lenght of session
module.exports.maxTokenAge = 60 * 60 * 2;
// absolute path to the project folder
module.exports.absolutePath = __dirname.slice(0, -6);
// how many recently edited articles on will be saved on the database 
module.exports.rememberedRecentlyEditedArticles = 20;
// given URI allows connecting to a mongoDB database
module.exports.dbURI = "";
// email address that verifivation emails will be sent from
// works with gmail addresses, in case of different site you may
// need to adjust the code in ./controllers/authController.ts
module.exports.hostEmailAddress = "";
// password to that email account
module.exports.hostEmailPassword = "";

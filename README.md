# Gatopedia
Gatopedia is a Wikipedia-like site dedicated to cats. It was created to showcase web development skills. Gatopedia allows users to create an account and to add/edit articles of their choice. Authentication is based on JWT technology.

# Page overview with screenshots
## Index page view

![Index page](/readme-screenshots/index-page.png "Index page of Gatopedia")

## Authorization options overview
Gatopedia allows users to create accounts on the page. Sign-up form looks like this:

![Sign-up page](/readme-screenshots/signup.png "Sign-up page of Gatopedia")

Sign-up page provides users with email and nickname verification. It also ensures that chosen password is strong. In case of failing those requirements, the users are notified via error box below form. If all credentials are correct (and unique in case of email and nickname), the page sends user a verification link to a given address. Verification link was generated using JWT technology. The account is created only if the user manages to click verification link in 10 minutes from submitting the form. Then the user can log in. Log-in form looks like this:

![Log-in page](/readme-screenshots/login.png "Log-in page of Gatopedia")

Users can log in using this form. If they forgot they password, they always can choose "Forgot Password?" option:

!["Forgot password?" page](/readme-screenshots/forgot-password.png "Forgot password? page of Gatopedia")

After submitting a correct email addres, user will receive an email with a verification link, which enables them to change their password. This verification link also uses JWT.

!["Reset password" page](/readme-screenshots/reset-password.png "Reset password page of Gatopedia")

Assuming everything went smoothly with logging in, an user will be presented with their user profile page:

![User page](/readme-screenshots/user-loggedin.png "User page of Gatopedia")

Logged in users can edit their account information:

![User edit page](/readme-screenshots/user-edit.png "User edit page of Gatopedia")

## Creating and Editing articles

They also can add new articles and edit existing ones:

![Add article page](/readme-screenshots/adding-article.png "Add article page of Gatopedia")

Gatopedia's editor is based on open-source tool [Editor.js](https://editorjs.io). The site also uses this tool to load articles. This is how articles are displayed:

![Article page](/readme-screenshots/article.png "Article page of Gatopedia")

Users can also search for articles. Searching is only executed in article titles. It uses built-in search options that are available on mongoose npm module.

![Search page](/readme-screenshots/search.png "Search page of Gatopedia")
## Side menu options

About page:

![About page](/readme-screenshots/about.png "About page of Gatopedia")

Users page:

![Users page](/readme-screenshots/users.png "Users page of Gatopedia")

Most popular page:

![Most popular page](/readme-screenshots/most-popular.png "Most popular page of Gatopedia")

# Used technologies

## Back-end:
- MongoDB
- TypeScript
- Node.js (with npm modules listed below)
    - bcrypt
    - cookie-parser
    - ejs
    - express
    - jsonwebtoken
    - mongoose
    - multer
    - nodemailer
    - nodemon
    - validator

## Front-end:
- Editor.js tool
- HTML / CSS
- JavaScript

# Setting up Gatopedia

Before setting up Gatopedia locally, you will have to have prepared:
1. MongoDB database with connect URI string ready (how to do this [here](https://www.mongodb.com/basics/create-database))
2. Email address from which verification emails will be send (on Gmail you will have to allow access to the mailbox for third-party applications - how to do that [here](https://support.google.com/accounts/answer/185833?hl=en) - save the generated code for later)
3. [Node.js](https://nodejs.org/en) and [TypeScript](https://www.typescriptlang.org) installed 

With all that ready, you can start setting up Gatopedia locally on your computer. Download source code and open /src/globalVariables.ts file. Find those lines at the end of the file:

    // given URI allows connecting to a mongoDB database
    module.exports.dbURI = ""

    // email address that verifivation emails will be sent from
    // works with gmail addresses, in case of different site you may
    // need to adjust the code in ./controllers/authController.ts
    module.exports.hostEmailAddress = ""

    // password to that email account
    module.exports.hostEmailPassword = ""



Fill empty quotation marks with your database connect link, chosen email address and its password (the code that Gmail generated). Afterwards, open a terminal in project directory and run command: 

    npm install

It will install all dependencies needed to launch Gatopedia. It may take some time. When its done, type:

    tsc

Which will compile all TypeScript into Javascript. Then run command:

    nodemon build/app

Which will run the server. If everything went smoothly, Gatopedia should work on your computer. Open your browser and type into URL bar:

    localhost:3000

or simply click this [link](http://localhost:3000). Now your Gatopedia is up and running. Have fun!


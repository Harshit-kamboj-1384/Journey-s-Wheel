const express = require("express");
const router = require("./Routes/user");
const cookieParser = require("cookie-parser");
const session = require('express-session');

const app = express();
app.use(session({
    secret: 'asdfghjkl', // Replace with a secure key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
  }));
  
app.use(cookieParser());
app.set('view engine','ejs');

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use('/',router);

app.use(express.static("public"));

app.listen(8000,()=>console.log("server started"));
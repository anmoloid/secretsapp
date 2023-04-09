require("dotenv").config();
const express=require("express")
const bodyParser=require("body-parser")
const ejs=require("ejs")
const mongoose=require("mongoose")
const session=require("express-session")
const passport=require("passport")
const passportLocalMongoose=require("passport-local-mongoose")

const app=express()
app.set("view engine","ejs")
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static("public"))

const secret1=process.env.SECRET

app.use(session({
    secret: secret1,
    resave: false,
    saveUninitialized: false
  }));

//passport is a package for managing cookies and sessions.
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true})

const userSchema= new mongoose.Schema({
    email: String,
    password: String
})

//this ensures that whatever user passwords we are creating are stored in a encrypted format. By default it encrypts the whole database,
//by mentioning the field name we have limited the encryption to only password field
//this is the level 2 type security when we are storing encrypted files
// userSchema.plugin(encrypt,{secret:secret, encryptedFields:["password"]});

//This plugin is used to hash and salt password and save users in mongodb
userSchema.plugin(passportLocalMongoose);

const User= new mongoose.model("User",userSchema)

//learn what these lines of code from the passport documentation. But in short 
//it basically create a local strategy for the user data and then creates a cookie for storing user data- serialisation
//and then crumbles the cookie to read the user data

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.get("/",function(req,res){
    res.render("home")
})
app.get("/login",function(req,res){
    res.render("login")
})
app.get("/secrets",function(req,res){
    if(req.isAuthenticated()){
        res.render("secrets")
    }
    else{
        res.redirect("/login")
    }
    
})
app.get("/register",function(req,res){
    res.render("register")
})
app.get("/logout",function(req,res){
    req.logout(function(err){
        if(err){
            console.log(err)
        }
        else{
            res.redirect("/");
        }
    });
    
})

app.post("/register",function(req,res){
    User.register({username:req.body.username},req.body.password,function(err,user){
        if(err)
        {
            console.log(err)
            res.redirect("/register")
        }
        else(
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secrets")
            })
        )
    })
    
})

app.post("/login",function(req,res){
    const user=new  User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, function(err){
        if(err)
        {
            console.log(err)
            res.redirect("/login")
        }
        else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secrets")
        })
    }})


  
})

app.listen(process.env.PORT || 3000, function(req,res){
    console.log("Server started at port 3000")
})
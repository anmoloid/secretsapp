require("dotenv").config
const express=require("express")
const bodyParser=require("body-parser")
const ejs=require("ejs")
const mongoose=require("mongoose")
const encrypt=require("mongoose-encryption")

mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true})



const userSchema= new mongoose.Schema({
    email: String,
    password: String
})
const secret="Thisismylitttlesecretkey.";
//this ensures that whatever user passwords we are creating are stored in a encrypted format. By default it encrypts the whole database,
//by mentioning the field name we have limited the encryption to only password field
userSchema.plugin(encrypt,{secret:secret, encryptedFields:["password"]});

const User= new mongoose.model("User",userSchema)

const app=express()


app.set("view engine","ejs")
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static("public"))

app.get("/",function(req,res){
    res.render("home")
})
app.get("/login",function(req,res){
    res.render("login")
})
app.get("/register",function(req,res){
    res.render("register")
})

app.post("/register",function(req,res){
   const user= new User ({
    email: req.body.username,
    password: req.body.password
   }) 
    User.create(user).then(function(userDetails){
        res.render("secrets")
    }).catch(function(error){
        res.send("<h1>Some error while creating user</h1>")
    })
})

app.post("/login",function(req,res){

   User.findOne({email:req.body.username}).then(function(results){
    if(results)
    {
    
       if(results.password === req.body.password) 
       {
        res.render("secrets")
       }
       else{
        res.send("<h1>Wrong Password</h1>")
       }
    }
    
   })
})

app.listen(process.env.PORT || 3000, function(req,res){
    console.log("Server started at port 3000")
})
if(process.env.NODE_ENV !=='production'){
    require('dotenv').config()
}

const express=require('express')
const app=express()
const users=[]      //for storing data
const bcrypt= require('bcrypt')  //for password
const passport=require('passport')  //For checcking the credentials
//const { redirect } = require('express/lib/response')
const initializePassport =require('./passport-config')
const flash=require('express-flash')
const session =require('express-session')
const method_overrride=require('method-override')
const mongodb=require('mongodb')
var db=null
//const { Passport } = require('passport/lib')
initializePassport(
    passport,
    email=>users.find(user=> user.email ===email),    //To find the users
    id=> users.find(user=> user.id ===id)             // TO find the  id
    )

app.set('view-engine','ejs')    //for including ejs file
app.use(express.urlencoded({extended:false}))       //For req.body.name url request
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(express.static('views'))
app.use(method_overrride('_method'))
//MongoDB - Connection
const MongoClient=mongodb.MongoClient;

const dbString='mongodb+srv://appuser:Venkat1@cluster0.ugidp.mongodb.net/login?retryWrites=true&w=majority'
const dbname='login'
MongoClient.connect(dbString,{useNewUrlParser:true, useUnifiedTopology:true},function(err,client){
    if(err){
        throw err
    }
    console.log("Connected Successfully")
    db=client.db(dbname)
    app.listen(3100,()=>{console.log(`server is running on http://localhost:3100`)})
})
//GET == Main Page --DAsh Board
app.get('/',checkAuthenticated,function(req,res){
    res.render('index.ejs',{name:req.user.name,lname:req.user.lname})     //index.ejs =linking ejs file
   
})
//GET == Login page
app.get('/login',checkNotAuthenticated,function(req,res){
    res.render('login.ejs')
})

//login == POST method
app.post('/login',passport.authenticate('local',{

    
    successRedirect:'/',
    failureRedirect:'/login',
    failureFlash:true
}))



//GET == Register page
app.get('/register',checkNotAuthenticated,function(req,res){
    
    res.render('register.ejs')
})

//Register == POST method
app.post('/register',async(req,res)=>{
try{
const hashedpassword=await bcrypt.hash(req.body.password,10)
users.push({
    id: Date.now().toString(),                              //For unique ID
    name:req.body.name,                                     //For login
    lname:req.body.lname,
    Age:req.body.Age,
    email:req.body.email,                                   //For email
    password:hashedpassword                                 //For password

})
db.collection('name').insertOne({Firstname:req.body.name,lastname:req.body.lname,Age:req.body.Age,Email:req.body.email,Password:req.body.password},function(err,data){
    if(err){
        throw (err);
    }  
    console.log(`${req.body.name} , ${req.body.lname}= Data sent Successfully`)
  })
res.redirect('/login')           //After getting credentials-> redirect to login page
}
catch{
    res.redirect('/register')     //Or It will load again register page                    

}
console.log(users)
}) //<--End of Register Page-->

app.delete('/logout',(req,res)=>{               //Method overrride
    req.logOut()
    res.redirect('/login')
})
//To Authenticate user
function checkAuthenticated(req,res,next){      //user should not access home page directly
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')
}
//To Already Authenticate user
function checkNotAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return res.redirect('/')
    }
    next()

}




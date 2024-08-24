console.clear();
const express = require('express');
const app = express();
const port = 3000;

//To read file
const fs = require('fs');

//To use session
var session = require('express-session')

app.use('/uploads', express.static('uploads'));

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  // cookie: { secure: true }
}))

const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })

const db  = require("./database/modules/index.js");

db.init();
// Set the view engine to EJS
app.set('view engine', 'ejs');

// Set the directory where your view templates are located
app.set('views', './views');

//to read form data
app.use(express.urlencoded());

//multer for image
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, '/uploads')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix)
    }
  })

const userModel  = require("./database/modules/user.js");


app.get('/',(req,res)=>{
  console.log(req.session.isLoggedIn);
    if(req.session.isLoggedIn){
      console.log(req.session.product);
       res.render("index",{user: req.session.user,products:req.session.product});
    }else{
      res.render('home');
    }
})

app.get("/home",(req,res)=>{
  fs.readFile('products.js', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    req.session.product = JSON.parse(data);
    // console.log(typeof req.session.product,req.session.product); 
    res.redirect("/");
  });
})


app.route('/signup').get((req,res)=>{
    res.render('signup',{error:""});
}).post(upload.single('profile-picture'),(req,res)=>{
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const pictureDeatils = req.file.filename;
    // console.log(username,email,password,pictureDeatils);

    if(!username){
      res.render("signup",{error:"Missing Username"});
      return;
    }

    if(!password){
      res.render("signup",{error:"Missing Password"});
      return;
    }

    if(!pictureDeatils){
      res.render("signup",{error:"Photo to select karo"});
      return;
    }

    userModel.create({
      username: username,
      email: email,
      password: password,
      profilePic: pictureDeatils
    }).then(function(){
      console.log("user stored in DB");
      res.redirect("/");
    }).catch(function(){
      console.log("issue occured while user entry in DB");
      res.render("signup",{error:"Issue occured while user entry in DB !!"});
    })

})

app.get('/login',(req,res)=>{
  res.render('login');
})

app.post('/login',(req,res)=>{
  const username = req.body.username;
  const password = req.body.password;

  if(!username){
    res.render("login",{error:"Missing Username"});
    return;
  }

  if(!password){
    res.render("login",{error:"Missing Password"});
    return;
  }

  userModel.findOne({username: username, password: password})
  .then(function(user){
    req.session.isLoggedIn = true;
    req.session.user = user;
    //console.log(req.session.user);
    res.redirect("/home");
  }).catch(function(){
    console.log("Kuch bhi thik na hai");
  })
})


app.get('/logout',(req,res)=>{
  req.session.destroy();
  res.render('login');
})

app.listen(port,()=>{
    console.log(`App is running at https://localhost:${port}`);
})
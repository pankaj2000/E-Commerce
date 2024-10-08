console.clear();
const express = require('express');
const app = express();
const port = 3000;

//To read file
const fs = require('fs');

//To use session
var session = require('express-session')

app.use('/uploads', express.static('uploads'));
//To Access the folder middleware
app.use(express.static('public'));
//To access the data from API with Content-type JSON
app.use(express.json());

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  // cookie: { secure: true }
}))

const multer = require('multer')
const upload = multer({ dest: 'uploads/' })

const db = require("./database/modules/index.js");
const sendMail = require("./utils/sendMail");


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

const userModelInstance = require("./database/modules/user.js");
const cartModel = require("./database/modules/cart.js");
const productModel = require("./database/modules/product.js");

const userModel = userModelInstance.model;
const userTypeEnums = userModelInstance.userRoleEnums;

app.get('/', (req, res) => {
  // console.log(req.session.isLoggedIn);
  // if (req.session.isLoggedIn && req.session.user.isVerified) {
  //   // console.log(req.session.product);
  //   res.render("index", { user: req.session.user, products: req.session.product });
  // } else {
  if(req.session.user && req.session.isLoggedIn){
    productModel.find().then(function (data) {
      // console.log(data);
      res.render("index",{ user: req.session.user, products: data });  
  })
  }else{
    productModel.find().then(function (data) {
      // console.log(data);
      res.render("index",{ user: "", products: data });  
  }) 
  }
  
  // } 
})

app.get("/home", (req, res) => {
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


app.route('/signup').get((req, res) => {
  res.render('signup', { error: "" });
}).post(upload.single('profile-picture'), (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  const pictureDeatils = req.file.filename;
  // console.log(username,email,password,pictureDeatils);

  if (!username) {
    res.render("signup", { error: "Missing Username" });
    return;
  }

  if (!password) {
    res.render("signup", { error: "Missing Password" });
    return;
  }

  if (!pictureDeatils) {
    res.render("signup", { error: "Photo to select karo" });
    return;
  }

  userModel.create({
    username: username,
    email: email,
    password: password,
    profilePic: pictureDeatils,
    isVerified: false,
    userType: userTypeEnums.customer
  }).then(function () {
    var url = `<h3>Hi ${username},</h3><br><a href="http://localhost:3000/verifyEmail/${email}">Please click to verify email</a>`
    sendMail(email, "WelCome to e-commerce!!", `Hi ${username}, Please click here to verify`, url, function (err) {
      if (err) {
        //do error handling
        res.render("signup", { error: "Issue occured while sending mail !!" });
      } else {
        res.redirect("/");
      }
    });
  }).catch(function () {
    // console.log("issue occured while user entry in DB");
    res.render("signup", { error: "Email exists. Please use another email to create account." });
  })
})

app.get('/login', (req, res) => {
  res.render('login', { error: "" });
})

app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username) {
    res.render("login", { error: "Missing Username" });
    return;
  }

  if (!password) {
    res.render("login", { error: "Missing Password" });
    return;
  }

  userModel.findOne({ username: username, password: password })
    .then(function (user) {
      req.session.isLoggedIn = true;
      req.session.user = user;

      if (user.isVerified) {
        res.redirect("/");
        // fs.readFile('products.js', 'utf8', (err, data) => {
        //   if (err) {
        //     console.error(err);
        //     return;
        //   }
        //   req.session.product = JSON.parse(data);
        //   // console.log("hooooooooooooo",req.session.product,req.session.user);
        //   res.render("index", { user: req.session.user, products: req.session.product });
        // });
      } else {
        var url = `<h3>Hi ${username},</h3><br><a href="http://localhost:3000/verifyEmail/${user.email}">Please click to verify email</a>`
        sendMail(user.email, "WelCome to e-commerce!!", `Hi ${username}, Please click here to verify`, url, function (err) {
          if (err) {
            res.render("login", { error: "Issue occured while sending mail !!" });
          } else {
            res.render("login", { error: "Please check email and verify your account" });
          }
        });
      }


    }).catch(function (err) {
      console.log("Kuch bhi thik na hai:", err);
    })
})


app.get('/logout', (req, res) => {
  req.session.destroy();
  res.render('login', { error: "" });
})

app.get('/verifyEmail/:email', (req, res) => {
  const email = req.params.email;

  userModel.updateOne({ email: email }, { $set: { isVerified: true } }).then(function () {
    console.log("User Verified");
    req.session.isLoggedIn = true;
    res.render('login');
  })

})

app.route('/forgot-password').get((req, res) => {
  res.render('forgetPassword');
}).post((req, res) => {
  var email = req.body.email;

  var url = `<h3>Hi ${email},</h3><br><a href="http://localhost:3000/updatePassword/${email}">Please click to setup a new password</a>`
  sendMail(email, "WelCome to e-commerce!!", `Hi ${email}, Please click to setup a new password`, url, function (err) {
    if (err) {
      //do error handling
      res.render("signup", { error: "Issue occured while sending mail !!" });
    } else {
      res.redirect("/");
    }
  });
})

app.get('/updatePassword/:email', (req, res) => {
  const email = req.params.email;
  res.render("updatePassword", { email: email });
})

app.post("/update-password/:email", (req, res) => {
  const email = req.params.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  if (password != confirmPassword) {
    res.render("updatePassword", { email: email });
    return;
  }

  userModel.updateOne({ email: email }, { $set: { password: password } }).then(function () {
    res.redirect("/");
  })



})

app.route("/cart").post((req, res) => {
  var user = null;

  if (!req.session.isLoggedIn) {
    res.status(401).json({ status: false, message: "Please login..", data: null });
    return;
  }

  user = req.session.user;
  var product_id = req.body.id;

  productModel.find({_id: product_id}).then(function (data) {
    // console.log(data)

   

    cartModel.create({
      product_id: product_id,
      productName: data[0].productName,
      productPrice: data[0].productPrice,
      productImage: data[0].productImage,
      user_id: req.session.user._id
    }).then(function () {
      res.status(400).json({ status: true, message: "Ekdum sahi hai...", data: null });
    })

})




  
})

app.get("/cartView",(req,res)=>{
  // console.log(req.session.user)
  cartModel.find({user_id: req.session.user._id}).then(function (data) {
    // console.log(data)
    res.render("cart",{ user: req.session.user, products: data });  
})
})

app.listen(port, () => {
  console.log(`App is running at https://localhost:${port}`);
})


////////////////////admin////////////////
const adminRoutes = require("./route/admin");

app.use("/admin",(req,res,next)=>{
  //add all the middleware for admin route

  console.log("chal to raha hai ");
  next();
})

app.use("/admin/auth",adminRoutes.auth);
app.use("/admin/adminDash",adminRoutes.adminDash);
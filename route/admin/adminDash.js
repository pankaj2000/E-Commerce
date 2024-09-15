const express = require('express');
// const app = express();
const router = express.Router();
// app.use(express.urlencoded());

const multer = require('multer')
const upload = multer({ dest: 'uploads/' })
//const db = require("./database/modules/index.js");
const productModel = require("../../database/modules/product.js");

router.route('/add-product').get((req, res) => {
    // if (!req.session.isAdminLoggedIn) {
    //     res.redirect('./admin/pages/login'); 
    // }
    //console.log("Sab thik to hai**********");
    res.render("./admin/pages/addProduct");  
})


router.route('/home').get((req, res) => {
    
  productModel.find().then(function (data) {
    // console.log(data);
    res.render("index",{ user: "", products: data });  
})
   
})

router.route('/create-product').post(upload.single('productImage'),(req, res) => {
    const productName = req.body.productName;
    const productPrice = req.body.productPrice;
    const productQuantity = req.body.productQuantity;
    const productImage = req.file.filename;
    const productDescription = req.body.productDescription;

    // console.log(productDescription,productImage,productQuantity,productPrice,productName);

    productModel.create({
        user_id:req.session.user._id,
        productName:productName,
        productPrice:productPrice,
        productImage:productImage,
        ProductQuantity:productQuantity,
        ProductDescription:productDescription
      }).then(function () {
        console.log("Product SAVE ho gya");
        res.render("./admin/pages/addProduct");  
      })
})



module.exports = router;
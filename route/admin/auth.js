const express = require('express');
const router = express.Router();

router.route('/login').get((req, res) => {
    if (!req.session.isAdminLoggedIn) {
        res.redirect('./admin/pages/login'); 
    }
    console.log("Sab thik to hai111");
    res.render("./admin/pages/login");  
}).post((req, res) => {
    // res.send("its working......");

    //write code for login
    //check if thid id admin account 
    //if admin then show him additional pages
    //if not admin them send him on login page again
})


module.exports = router;
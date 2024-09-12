const express = require("express");
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { isauthenticatedvalidtoken , isuserornot, isadminauthenticate} = require("../middlewares/auth");
const {
    regispage,
    handleuserregistration,
    otppage,
    checkotp,
    loginpage,
    handleuserlogin,
    homepageadmmin,
    homepageuser,
    carspageadmin,
    carspageuser,
    getcarbyid,
    homegetcarbyid,
    addtocart,
    showcart,
    removecar,
    bookcar,
    logout,
    emailpage,
    handleemailpage,
    verifyotpforpassword,
    handleverifyotpforpassword,
    changepasspage,
    handlechangepasspage,
    proceed_payment,
    bookcarhome,
    bookingcomplete,
    showbookingpage,
    cancelbooking
} = require("../controllers/user");

const { addcar, 
    handleaddcar,
    updatepage,
    handleupdatepage,
    removecarfromcarpage
 } = require("../controllers/registercar");

// Configure image upload directory
const uploadDir = path.join(__dirname, '../public/images');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const customImageName = req.body.imageName || 'default_image_name';
        const uniqueSuffix = Date.now() + path.extname(file.originalname);
        cb(null, customImageName + uniqueSuffix);
    }
});

const upload = multer({ storage: storage });

// Routes
router.get("/homeadmin", isadminauthenticate, homepageadmmin);
router.get("/homeuser", isuserornot, homepageuser);

router.get("/add-car", isauthenticatedvalidtoken, addcar);
router.post("/add-car", isauthenticatedvalidtoken, upload.single('image'), handleaddcar);

router.get("/carsadmin", isadminauthenticate, carspageadmin);
router.get("/carsuser", isuserornot, carspageuser);

router.get("/updatecar/:id", isauthenticatedvalidtoken, updatepage); 
router.post("/updatecar/:id", isadminauthenticate, upload.single('image'),handleupdatepage);
router.post("/removecar",isadminauthenticate, removecarfromcarpage);

router.get("/registration", regispage);
router.post("/registration", handleuserregistration);

router.get("/verifyotp", otppage);
router.post("/verifyotp", checkotp);

router.get("/login", loginpage);
router.post("/login", handleuserlogin);

router.get("/logout", logout);

router.get("/home/:id", isauthenticatedvalidtoken, homegetcarbyid);
router.get("/cars/:id", isauthenticatedvalidtoken, getcarbyid);

router.post("/cart", isauthenticatedvalidtoken, addtocart);
router.get("/cart", isauthenticatedvalidtoken, showcart);
router.post("/removecart", isauthenticatedvalidtoken, removecar);

router.get("/book/:id", isauthenticatedvalidtoken, bookcar);
router.get("/books/:id", isauthenticatedvalidtoken, bookcarhome);
router.post("/payment",proceed_payment)

router.get("/book",isauthenticatedvalidtoken,bookingcomplete)
router.get("/booking",isauthenticatedvalidtoken,showbookingpage)

router.post("/cancelbooking",cancelbooking)

// forgot password routes
router.get("/emailverify", emailpage);
router.post("/emailverify", handleemailpage);

router.get("/otpverify", verifyotpforpassword);
router.post("/otpverify", handleverifyotpforpassword);

router.get("/resetpass", changepasspage);
router.post("/resetpass", handlechangepasspage);

module.exports = router;

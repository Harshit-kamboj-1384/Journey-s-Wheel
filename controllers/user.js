const { con } = require("../models/user");
const bcrypt = require('bcryptjs');
const express = require("express");
const nodemailer = require("nodemailer");
const jwt = require('jsonwebtoken');
const cookies = require('cookies')
const generateotp = require("./otp.js");
const Captcha = require("node-captcha-generator/dist/Captcha.js");
const stripe = require('stripe')('sk_test_51PtQbaBFowmkaECnzIlMdIliMqkinVJDfBNizLdqmdinfY3vc4G3wL2RiOYe0rYGqrXkd32Q7UfaigZ5Nnj7tIsm00hem9G3qc');

// for email
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "hkamboj181@gmail.com",
        pass: "ywec bhgq ljww xyen",
    },
  });

// main work
function homepageadmmin(req,res){
  try {
    con.query('SELECT * FROM home_images',async(err,result)=>{
    if(err){
      console.log(err);
    }
    if(result.length!=0){
      const cars = result;
      userr = req.session.user;
      res.render('home_page_admin', { cars,userr });
    }
  }); 
}
 catch (error) {
  res.status(500).send(error);
}
}

function homepageuser(req,res){
  try {
    con.query('SELECT * FROM home_images',async(err,result)=>{
    if(err){
      console.log(err);
    }
    if(result.length!=0){
      const cars = result;
      userr = req.session.user;
      res.render('home_page_user', { cars,userr });
    }
  }); 
}
 catch (error) {
  res.status(500).send(error);
}
}

async function carspageadmin(req, res){
  try {
      con.query('SELECT * FROM car_images',async(err,result)=>{
      if(err){
        console.log(err);
      }
      if(result.length!=0){
        const cars = result;
        userr = req.session.user;
        res.render('cars_admin', { cars ,userr});
      }
    }); 
  }
   catch (error) {
    res.status(500).send(error);
  }
}

async function carspageuser(req, res){
  try {
      con.query('SELECT * FROM car_images',async(err,result)=>{
      if(err){
        console.log(err);
      }
      if(result.length!=0){
        const cars = result;
        userr = req.session.user;
        res.render('cars_user', { cars ,userr});
      }
    }); 
  }
   catch (error) {
    res.status(500).send(error);
  }
}

async function regispage(req, res){
  // add captcha
  let c=new Captcha({
    length: 5,
    size:{
       width: 120,
       height: 75
    },
  })
  await c.toBase64(async(err,base64)=>{
    if(err){
      console.log("captcha failed")
    }
    else{
      console.log(c.value,'===');
      con.query(`Insert into captcha(captcha) values ('${c.value}')`,(err , result)=>{
        if(err)
          throw err;
        else{
          console.log("Inserted Captcha successfully");
        }
      })
      res.render("registration",{imgPath : base64});
    }
  })
}

async function handleuserregistration(req,res){
  try {
    const body = req.body;
    const email = req.body.email;
    await transporter.sendMail({
      from: 'hkamboj181@gmail.com',
      to: email,
      subject: "One-time OTP Is",
      html: `Your OTP is: ${generateotp}`,
    });

    req.session.singperson = req.body;
    req.session.otp = generateotp;

    // Redirect to OTP verification page
     res.redirect("/verifyotp");
  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).json({ error: "An error occurred during registration" });
  }
}

// OTP page will be open 
function otppage(req,res){
    res.render("otp");
}

async function checkotp(req,res){
    const OTP = req.body.otpvalue;
    if (req.session.otp === OTP){
       // Hash the password
       const hashedPassword = await bcrypt.hash(req.session.singperson.passd, 10);

       // Prepare SQL query
      const sql = `INSERT INTO users (name, email, password, otp) VALUES (?, ?, ?, ?)`;
      const values = [req.session.singperson.username, req.session.singperson.email, hashedPassword, OTP];

      // Execute SQL query
      con.query(sql, values, (err, result) => {
      if (err) {
          console.error('Error occurred:', err);
          return res.status(500).json({ error: "An error occurred during registration" });
        }
        res.redirect("/login");
       });
     }
      else {
        res.redirect("/verifyotp")
        }
}

function loginpage(req, res){
    res.render("login");
}

function handleuserlogin(req,res){
    let data = req.body;
    con.query(`select * from users where email= '${data.email}' `, async (err, result) => {
      console.log(data);
      if (err) {
          return res.json({ message: "error in fetching user" });
      }
      if (result.length != 0) {
        const user = result[0];
        console.log(user);
        let passwordIsSame = await bcrypt.compare(data.passd,user.password);
          if (passwordIsSame) {
            var token = jwt.sign(user, "shhhaaa", {expiresIn: '1h'})
            console.log("Token: ",token)
            res.cookie('Token',token, {maxAge: 3600000, httpOnly: true});
            // res.cookie("id",req.cookie, {maxAge: 3600000, httpOnly: true});

            req.session.user = user;
            if (data.role === 'Admin') {
              if (data.key === '1234567890') {
                  // Handle admin login and redirect
                  res.cookie('secret_key','1234567890', {maxAge: 3600000, httpOnly: true});
                  res.redirect('/homeadmin');
              } else {
                  res.send('Invalid Admin key');
              }
          } else if (data.role === 'User') {
              // Handle user login and redirect
              res.redirect('/homeuser');
          } else {
              res.send('Invalid role');
          }
          }
          else{
            return res.json({ message: "Incorrect password!" });
          }
         }
         else{
            return res.json({message: "User is not registered!"})
         }
       })
}


async function homegetcarbyid(req,res){
  const myid = req.params.id;
  const sql2 =   `select * from home_images where id = ${myid}`;
  con.query(sql2,(err,result)=>{
    if(err) {
      // console.log(err);
      return res.json({ message: "error in fetching user" });
     }
    if(result.length != 0) {
      const car = result[0];
      console.log(car);
      userr = req.session.user;
      res.render('car-details', { car ,userr});
    }
  })

}

function logout(req,res){
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send('Failed to logout.');
    }
    res.clearCookie('connect.sid');

    // Clear the token if it is stored in cookies
    res.clearCookie('Token'); 
    res.clearCookie('secret_key');
    
    res.redirect('/homeuser'); 
  });
}

async function getcarbyid(req,res){
  const myid = req.params.id;
  const sql2 =   `select * from car_images where id = ${myid}`;
  con.query(sql2,(err,result)=>{
    if(err) {
      // console.log(err);
      return res.json({ message: "error in fetching user" });
     }
    if(result.length != 0) {
      const car = result[0];
      userr = req.session.user;
      res.render('car-details', { car ,userr});
    }
  })

}

async function addtocart(req,res){

  const { carId } = req.body;
  const id = req.session.user.id;
  
    if (!carId) {
        return res.status(400).json({ success: false, message: 'Invalid car ID' });
    }

  con.query('SELECT * FROM car_images WHERE id = ?', [carId], (err, results) => {
    if (err) {
        console.error('Error fetching car details:', err);
        return res.status(500).json({ success: false, message: 'An error occurred.' });
    }

    if (results.length === 0) {
        return res.status(404).json({ success: false, message: 'Car not found' });
    }

    const car = results[0];

    // Insert car details into the cart table
    const insertQuery = 'INSERT INTO cart (id, name , price, description, user_id, img) VALUES (?, ?, ?, ?, ?, ?)';
    con.query(
        insertQuery,
        [car.id, car.name, car.price, car.description, id, car.img],
        (err, results) => {
            if (err) {
                console.error('Error inserting into cart:', err);
                return res.status(500).json({ success: false, message: 'An error occurred.' });
            }
            res.json({ success: true });
        }
    );
});
}

function showcart(req,res){
  try {
    const id = req.session.user.id;~
    con.query(`SELECT * FROM cart where user_id=${id}`,async(err,result)=>{
    if(err){
      console.log(err);
    }
    if(result.length!=0){
      const cars = result;
      userr = req.session.user;
      res.render('cartpage', { cars ,userr});
    }
    else{
      return res.json({message: "Cart is empty"});
    }
  }); 
}
 catch (error) {
  res.status(500).send(error);
}
}

function removecar(req,res){
  const { carImg } = req.body;
  console.log(carImg);
  const id = req.session.user.id;
  con.query(`delete from cart where img = '${carImg}' and user_id=${id}`,(err,result)=>{
    if(err){
      console.log(err);
    }
    else{
      console.log(result);
      res.json({ success: true });
    }
  })
}

function bookcar(req,res){
  const myid = req.params.id;
  const sql2 =   `select * from car_images where id = ${myid}`;
  con.query(sql2,(err,result)=>{
    if(err) {
      // console.log(err);
      return res.json({ message: "error in fetching user" });
     }
    if(result.length != 0) {
      const car = result[0];
      userr = req.session.user;
      res.render('car-book', { car ,userr});
    }
  })
}

function bookcarhome(req,res){
  const myid = req.params.id;
  const sql2 =   `select * from home_images where id = ${myid}`;
  con.query(sql2,(err,result)=>{
    if(err) {
      // console.log(err);
      return res.json({ message: "error in fetching user" });
     }
    if(result.length != 0) {
      const car = result[0];
      userr = req.session.user;
      res.render('car-book', { car ,userr});
    }
  })
}

function emailpage(req,res){
  res.render("forgot_emailverify")
}

async function handleemailpage(req, res) {
  try {
    const body = req.body;
    const email = req.body.email;
    await transporter.sendMail({
      from: 'hkamboj181@gmail.com',
      to: email,
      subject: "One-time OTP Is",
      html:`Your OTP is: ${generateotp}`,
    });

    // Insert OTP into the database
    const insertSql = 'INSERT INTO update_password (email, otp) VALUES (?, ?)';
    const insertValues = [email, generateotp];
    
    con.query(insertSql, insertValues, (err, result) => {
      if (err) {
        console.error('Error occurred during OTP insertion:', err);
        return res.status(500).json({ error: "An error occurred during OTP insertion" });
      }

      // Select user based on email
      const selectSql = 'SELECT * FROM users WHERE email = ?';
      con.query(selectSql, [email], (err, result) => {
        if (err) {
          console.error('Error occurred during user selection:', err);
          return res.status(500).json({ error: "An error occurred during user selection" });
        }
        
        if (result.length === 0) {
          return res.status(404).json({ error: "User not found" });
        }
        
        const person = result[0];
        req.session.person = person; // Store user information in session
        res.redirect("/otpverify");
      });
    });
  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).json({ error: "An error occurred during email verification" });
  }
}

function verifyotpforpassword(req,res){
  res.render("forgot_otpverify")
}

function handleverifyotpforpassword(req,res){
  const OTP = req.body.otp;
  con.query(`select * from update_password where otp = '${OTP} ' `, async (err, result) => {
    // console.log(result);
    if (err) {
        res.json({ message: "error in fetching user" });
        console.log(err);
       }
    else if (result.length != 0)
       {
        res.redirect("/resetpass");
       }
    else {
        res.send("Incorrect otp");
    }
    })
}

function changepasspage(req,res){
  res.render("forgot_newpass");
}

async function handlechangepasspage(req,res){
  const pass1 = req.body.pass1;
  const pass2 = req.body.pass2;
  if (pass1 === pass2) {
    try {
      // Hash the new password before storing it
      const hashedPassword = await bcrypt.hash(pass1, 10);
      const id = req.session.person.id;
      // query
      const query = 'UPDATE users SET password = ? WHERE id = ?';
      const values = [hashedPassword, id];
      
      con.query(query, values, (err,result)=>{
        if(err){
          console.log("error:",err);
          res.send("error",err)
        }
        // Send a success response
         res.redirect("/login");
      });
      
    } catch (error) {
      // Handle any errors during hashing or database operations
      console.error('Error updating password:', error);
      res.status(500).send('Internal server error.');
    }
  } else {
    // Passwords do not match
    res.status(400).send('Passwords do not match. Please try again.');
  }
}
async function proceed_payment(req,res){
  try {
    const total = req.body.totalCost;
    const pickupDate = req.body.pickupDate;
    const returnDate = req.body.returnDate;
    req.session.body = req.body;

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: "Journeys Wheel",
                    },
                    unit_amount: Number(total)*100,
                },
                quantity: 1 // Add quantity if needed
            }
        ],
        mode: 'payment', // Place mode property correctly inside the object
        success_url: 'http://localhost:8000/book',
        cancel_url: 'http://localhost:8000/cancel'
    });
    res.redirect(session.url)
} catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to initiate checkout session' });
}
}

function bookingcomplete(req,res){
  const id = req.session.user.id // login user id

  const body = req.session.body;

    con.query('SELECT * FROM car_images WHERE id = ?', [body.carid], (err, results) => {
      if (err) {
          console.error('Error fetching car details:', err);
          return res.status(500).json({ success: false, message: 'An error occurred.' });
      }
  
      if (results.length === 0) {
          return res.status(404).json({ success: false, message: 'Car not found' });
      }
  
      const car = results[0];
  
      // Insert car details into the cart table
      const insertQuery = 'INSERT INTO booked (id, name , price, description, user_id, img, cust_name, cust_phone_no, email, pickup_date, return_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
      con.query(
          insertQuery,
          [car.id, car.name, car.price, car.description, id, car.img, body.name, body.phone, body.email, body.pickupDate, body.returnDate],
          (err, results) => {
              if (err) {
                  console.error('Error inserting into cart:', err);
                  return res.status(500).json({ success: false, message: 'An error occurred.' });
              }
              res.redirect("/homeuser")
          }
      );
  });
}

function showbookingpage(req, res) {
  try {
    const id = req.session.user.id;
    con.query(`SELECT * FROM booked WHERE user_id=${id}`, (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send("Database query error.");
        return;
      }

      if (result.length !== 0) {
        const cars = result.map(car => {
          return {
            ...car,
            pickup_date: new Date(car.pickup_date).toLocaleDateString(),
            return_date: new Date(car.return_date).toLocaleDateString()
          };
        });

        const userr = req.session.user;
        res.render('bookedcar', { cars, userr });
      } else {
        return res.json({ message: "No car is booked, please book your car first." });
      }
    });
  } catch (error) {
    res.status(500).send(error);
  }
}

function cancelbooking(req,res){
  const { carImg } = req.body;
  console.log(carImg);
  con.query(`delete from booked where img = '${carImg}'`,(err,result)=>{
    if(err){
      console.log(err);
    }
    else{
      console.log(result);
      res.json({ success: true });
    }
  })
}

module.exports = {
  homepageadmmin,
    homepageuser,
    carspageadmin,
    carspageuser,
    regispage,
    loginpage,
    handleuserregistration,
    otppage,
    checkotp,
    handleuserlogin,
    homegetcarbyid,
    getcarbyid,
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
}
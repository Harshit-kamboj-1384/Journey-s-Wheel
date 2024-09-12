
const jwt = require('jsonwebtoken');
const cookies = require('cookies')

exports.isauthenticatedvalidtoken = async (req, res, next) => {
   try {
     const token = req.cookies.Token;
    //  console.log("cart:",token);
     if (!token) {
       return res.redirect('/login');
     }
 
     const user = jwt.verify(token, 'shhhaaa');
     req.session.user = user;
     next();
   }
   catch (err) {
     console.log("Firstly login on the website to open this");
   //   res.redirect('/login');
   }
 };
 
exports.isuserornot = async(req,res,next) =>{
  try {
    const token = req.cookies.Token;
    if(token){
      const user = jwt.verify(token, 'shhhaaa');
      req.session.user = user;
    }
    next();
  }
  catch (err) {
    console.log("Firstly login on the website to open this");
  //   res.redirect('/login');
  }
}
 exports.isadminauthenticate = async (req, res, next) => {
  try{
    if(req.cookies.secret_key)
    {console.log("inside")
      if (!req.cookies.Token) {
        return res.redirect('/login');
      }
  
      const user = jwt.verify(req.cookies.Token, 'shhhaaa');
      req.session.user = user;
      next();
    }
    else{
      res.redirect('/login');
    }
  }catch (err) {
     console.log("Firstly login on the website to open this");
   //   res.redirect('/login');
   }
}; 

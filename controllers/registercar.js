// controllers/registercar.js
const { con } = require("../models/user");
const path = require('path');

function addcar(req, res) {
    res.render("addcarpage");
}

async function handleaddcar(req, res) {
    try {
        const { carName, price, description } = req.body;
        const image = req.file;
        const imageFileName = image ? image.filename : null;

        // Insert car details into the database
        const sql = 'INSERT INTO car_images (img, name, price, description) VALUES (?, ?, ?, ?)';
        const values = [imageFileName, carName, price, description];

        con.query(sql, values, (err, result) => {
            if (err) {
                console.error('Error occurred:', err);
                return res.status(500).json({ error: "An error occurred during registration" });
            }
            
            // Successfully added car details, redirect to /carsadmin
            res.redirect("/carsadmin");
        });

        // The console.log statement is only for server-side debugging and does not affect the response sent to the client
        console.log('Car Details:', {
            carName,
            price,
            description,
            imageFileName
        });

    } catch (error) {
        console.error('Error uploading car details:', error);
        res.status(500).send('Error uploading car details.');
    }
}

async function updatepage(req,res){
    const id = req.params.id
    res.render("updatecarpage",{id})
  }
  
  async function handleupdatepage(req,res){
    try {
      const myid = req.params.id;
      const { carName, price, description } = req.body;
      const image = req.file;
      const imageFileName = image ? image.filename : null;
  
      // Insert car details into the database
      const sql = `UPDATE car_images SET img = ?, name = ?, price = ?, description = ? WHERE id = ?`;
      const values = [imageFileName, carName, price, description, myid];
  
      con.query(sql, values, (err, result) => {
          if (err) {
              console.error('Error occurred:', err);
              return res.status(500).json({ error: "An error occurred during update" });
          }
          res.redirect("/carsadmin")
      });
  } catch (error) {
      console.error('Error uploading car details:', error);
      res.status(500).send('Error uploading car details.');
  }
  }
  
  function removecarfromcarpage(req,res){
    const { carImg } = req.body;
    console.log(carImg);
    con.query(`delete from car_images where img = '${carImg}'`,(err,result)=>{
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
    addcar,
    handleaddcar,
    updatepage,
    handleupdatepage,
    removecarfromcarpage
};

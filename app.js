const con = require('./db');
const express = require('express');
const bcrypt = require('bcrypt');
const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// password generator
app.get('/password/:pass', (req, res) => {
    const password = req.params.pass;
    bcrypt.hash(password, 10, function (err, hash) {
        if (err) {
            return res.status(500).send('Hashing error');
        }
        res.send(hash);
    });
});


app.post('/login', (req, res) => {
   const { username, password } = req.body;


   con.query("SELECT id, password FROM users WHERE username = ?", [username], (err, results) => {
       if(err) return res.status(500).json({ error: "Database error" });
       if(results.length !== 1) return res.status(401).json({ error: "Wrong username" });


       const user = results[0];
       bcrypt.compare(password, user.password, (err, same) => {
           if(err) return res.status(500).json({ error: "Hashing error" });
           if(!same) return res.status(401).json({ error: "Wrong password" });


           res.json({ id: user.id, username, message: "Login OK" });
       });
   });
});


app.get('/expenses', (req, res) => {
   const { userId, date, keyword } = req.query;


   let sql = "SELECT * FROM expenses WHERE user_id = ?";
   let params = [userId];


   if (date) {
       sql += " AND DATE(date) = ?";
       params.push(date);
   }
   if (keyword) {
       sql += " AND item LIKE ?";
       params.push(`%${keyword}%`);
   }


   con.query(sql, params, (err, results) => {
       if (err) return res.status(500).send("Database error");
       res.json(results);
   });
});



// ---------- Server starts here ---------
const PORT = 3000;
app.listen(PORT, () => {
    console.log('Server is running at ' + PORT);
});


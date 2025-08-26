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


// ---------- Delete Expense ----------
app.delete('/expenses/:id', (req, res) => {
   const { id } = req.params;
   const { userId } = req.query;


   con.query("DELETE FROM expenses WHERE id = ? AND user_id = ?", [id, userId], (err, result) => {
       if (err) return res.status(500).send("Database error");
       if (result.affectedRows === 0) return res.status(404).send("Expense not found or not owned by user");
       res.status(200).send("Expense deleted successfully");
   });
});


// ---------- Add Expense ----------
app.post('/expenses', (req, res) => {
   const { userId, item, paid } = req.body;
   const sql = "INSERT INTO expenses (user_id, item, paid, date) VALUES (?, ?, ?, NOW())";
   const params = [userId, item, paid];


   con.query(sql, params, (err, result) => {
       if (err) {
           console.error(err);
           return res.status(500).send("Database server error");
       }
       res.status(201).send("Expense added successfully");
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




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

// ---------- Add Expense ----------
app.post('/expenses', (req, res) => {
   const { userId, item, paid } = req.body;
   const sql = "INSERT INTO expense (user_id, item, paid, date) VALUES (?, ?, ?, NOW())";
   const params = [userId, item, paid];


   con.query(sql, params, (err, result) => {
       if (err) {
           console.error(err);
           return res.status(500).send("Database server error");
       }
       res.status(201).send("Expense added successfully");
   });
});


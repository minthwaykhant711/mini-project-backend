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

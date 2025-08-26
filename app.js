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



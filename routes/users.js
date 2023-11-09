var express = require('express');
var router = express.Router();
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

const pool = mysql.createPool({
    host: process.env.DB_HOST, // L'hôte de la base de données MySQL
    user: process.env.DB_USER, // Votre nom d'utilisateur MySQL
    password: process.env.DB_PASSWORD, // Votre mot de passe MySQL
    database: process.env.DB_NAME, // Le nom de la base de données MySQL
});

function generateToken(id){
  return jwt.sign({id : id}, process.env.JWT_SECRET);
}  

// , {expireIn: '1d'}
function sqlQuery(query, callback) {
    pool.getConnection((connError, connection) => {
        if (connError) {
            console.log(connError);
            throw new Error("Connection error " + connError);
        }
        connection.query(query, (error, result) => {
            if (error) {
                console.log(error);
                throw new Error("Query error " + error);
            }
            callback(result);
            connection.release();
        });
    });
}



// Création d'un nouvelle utilisateur et cryptage du mot de passe'


router.post('/signup', (req, res) => {
  const body = req.body;

  if (!body.email || !body.password || !body.display_name) {
      res.status(400)
      res.send("Tous les champs sont obligatoires")
      return
  }

  if (body.password.length < 8) {
      res.status(400)
      res.send("MDP doit avoir au moins 8 symboles")
      return
  }

  bcrypt.hash(body.password, 12).then(hashedPassword => {
      const insertQuery = `INSERT INTO user (email, password, display_name) VALUES ("${body.email}", "${hashedPassword}", "${body.display_name}")`;

      try {
          sqlQuery(insertQuery, (result) => {
              res.status(201)
              res.send("ok")
          });
      } catch (exception) {
          res.status(500)
          res.send("Erreur lors de la création : " + exception)
      }
  })
})


// Connexion


router.post('/login', (req, res) => {
  const body = req.body;

  if (!body.email || !body.password) {
      res.status(500)
      res.send("Tous les champs sont obligatoires")
      return
  }

  sqlQuery(`SELECT * FROM user WHERE email="${body.email}"`, (results) => {
      if (results.length === 0) {
          res.status(500);
          res.send("Mauvais mot de passe ou email");
      }

      const user = results[0];
      bcrypt.compare(body.password, user.password).then(isOk => {
          if (!isOk) {
              res.status(500);
              res.status("Mauvais mot de passe ou email");
          } else {
              delete user.password
              //Generate a JWT Token
              return res.json({
                  'token': generateToken(user.id),
                  'user': user,
              })
          }
      })
  });
})


// Affiche le bdd pour voir si tout est bien ajouté 

router.get('/', function (req, res) {
  try {
      const sql = "SELECT * FROM user";

      sqlQuery(sql, (results) => {
          res.json(results);
      });
  } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs' });
  }
});


// Une route qui permet de tester le token
// router.get('/test-token', verifyToken);



// function verifyToken(req, res) {
// const token = req.headers["authorization"];
// console.log(token);
//   jwt.verify(token.split(' ')[1] , process.env.JWT_SECRET, (err, data) => {
//       if (err) {
//           return res.status(500).json({ message: 'Token invalide' });
//       }
//       req.data = data.id;
//   });
// }

router.get('/test-token', (req, res) => {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        const token = req.headers.authorization.split(' ')[1];
        const secret = process.env.JWT_SECRET;
        jwt.verify(token, secret, (err, decoded) => {
            console.log(token)
            sqlQuery(`SELECT display_name FROM user WHERE id="${decoded.id}"`, (results) => {
                if (results.length === 0) {
                    res.status(400);
                    res.send("Invalid password or email");
                    return;
                }
                if (err) {
                    console.log(err);
                } else {
                    return res.json({
                        'id': decoded,
                        'results': results
                    })
                }
            })
        });
    }
});



module.exports = router;


// sql.sqlQuery('SELECT * FROM user WHERE user.id' = ${decoded.id} . (results) => {
//     if (!results.length){
//         res.status(40);
//     }
// })
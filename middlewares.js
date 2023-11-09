const jwt = require('jsonwebtoken');
const mysql = require('mysql');

const pool = mysql.createPool({
    host: process.env.DB_HOST, // L'hôte de la base de données MySQL
    user: process.env.DB_USER, // Votre nom d'utilisateur MySQL
    password: process.env.DB_PASSWORD, // Votre mot de passe MySQL
    database: process.env.DB_NAME, // Le nom de la base de données MySQL
});

function sqlQuery(query, callback) {
    pool.getConnection((connError, connection) => {
        if (connError) {
            console.log(connError);
            throw new Error("Erreur de connexion : " + connError);
        }
        connection.query(query, (error, result) => {
            connection.release();
            if (error) {
                console.log(error);
                throw new Error("Erreur de requête : " + error);
            }
            callback(result);
        });
    });
}

function authenticationMiddleware(req, res, next) {
    const token = req.headers.authorization && req.headers.authorization.startsWith('Bearer')
        ? req.headers.authorization.split(' ')[1]
        : null;

    if (!token) {
        return res.status(401).json({ message: 'Token non fourni' });
    }

    const secret = process.env.JWT_SECRET;

    jwt.verify(token, secret, (err, decoded) => {
        if (err) {
            console.log(err);
            return res.status(401).json({ message: 'Token invalide' });
        }

        const userId = decoded.id;

        sqlQuery(`SELECT display_name, id FROM user WHERE id = ${userId}`, (results) => {
            if (results.length === 0) {
                return res.status(401).json({ message: 'Utilisateur non trouvé' });
            }

            req.user = results[0];
            next();
        });
    });
}

module.exports = {
    authenticationMiddleware,
};

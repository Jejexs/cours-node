var express = require('express');
var router = express.Router();

const mysql = require('mysql');

const middlewares = require ('../middlewares');

const sequelize = require('../utils/sequelize');


router.use(middlewares.authenticationMiddleware);

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


router.get('/test', function (req, res, next) {
    sqlQuery("SELECT * FROM todo", (results) => {
        console.log(results);
        res.status(200).json(tasksList);
    })
})

// let body = req.body
// body['user']= req.user.id;

// liste des todo

router.get('/', function (req, res) {
    console.log(req.user);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10; // Nombre d'éléments par page

    // Calculez l'offset (décalage) en fonction de la page et du nombre d'éléments par page
    const offset = (page - 1) * limit;

    try {
        // Utilisez LIMIT et OFFSET dans la requête SQL pour paginer les résultats
       
        const sql = `SELECT * FROM todo WHERE user_id = "${req.user.id}" LIMIT ${limit} OFFSET ${offset}`;

        sqlQuery(sql, (results) => {
            // Récupérez le nombre total d'éléments (avant la pagination)
            sqlQuery(`SELECT COUNT(*) as totalCount FROM todo WHERE user_id = "${req.user.id}"`, (countResult) => {
                const totalCount = countResult[0].totalCount;
                const paginatedResults = results;

                const response = {
                    count: paginatedResults.length,
                    total: totalCount,
                    hasNext: offset + paginatedResults.length < totalCount,
                    hasPrev: offset > 0,
                    results: paginatedResults,
                };

                res.json(response);
            });
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Erreur lors de la récupération des tâches' });
    }
});


// Detail des todo par id
router.get('/:id', (req, res) => {
    const id = parseInt(req.params.id);

    try {
        sqlQuery(`SELECT * FROM todo WHERE user_id = "${req.user.id}" AND id = "${id}"`, (results) => {
            
            if (results.length > 0) {
                res.json(results[0]);
            } else {
                res.status(404).json({ message: "Tâche non trouvée" });
            }
        
        });
    } catch (error) {
        console.log(error);
    }
});

// Création de nouvelles taches

router.post('/', (req, res) => {
    const newTask = req.body;

    try {
        const sql = "INSERT INTO todo (title, creation_date, due_date, Done, description, user) VALUES (?, ?, ?, ?, ?, ?)";
        const values = [newTask.title, newTask.creation_date, newTask.due_date, newTask.Done, newTask.description, newTask.user];

        pool.query(sql, values, (error, results) => {
            if (error) {
                console.log(error);
                res.status(500).json({ message: 'Erreur lors de la création de la tâche' });
            } else {
                const insertedId = results.insertId;
                newTask.id = insertedId;
                res.status(201).json(newTask);
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Erreur lors de la création de la tâche' });
    }
});

// modification partiel

router.patch('/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    const updatedTaskData = req.body;

    try {
        const sql = "UPDATE todo SET title = ?, due_date = ?, Done = ?, description = ?, user = ? WHERE id = ?";
        const values = [updatedTaskData.title, updatedTaskData.due_date, updatedTaskData.Done, updatedTaskData.description, updatedTaskData.user, taskId];

        pool.query(sql, values, (error, results) => {
            if (error) {
                console.log(error);
                res.status(500).json({ message: 'Erreur lors de la mise à jour de la tâche' });
            } else if (results.affectedRows === 0) {
                res.status(404).json({ message: 'Tâche non trouvée' });
            } else {
                console.log('Données de la requête :', req.body);
                console.log('Tâche mise à jour avec succès');
                res.status(200).json({ message: 'Tâche mise à jour avec succès' });
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour de la tâche' });
    }
});

/* Delete un todo */

router.delete('/:id', (req, res) => {
    const id = parseInt(req.params.id);

    try {
        const sql = "DELETE FROM todo WHERE id = ?";
        const values = [id];

        pool.query(sql, values, (error, results) => {
            if (error) {
                console.log(error);
                res.status(500).json({ message: 'Erreur lors de la suppression de la tâche' });
            } else if (results.affectedRows === 0) {
                res.status(404).json({ message: 'Tâche non trouvée' });
            } else {
                console.log('Tâche supprimée avec succès');
                res.json({ message: 'Tâche supprimée avec succès' });
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Erreur lors de la suppression de la tâche' });
    }
});

// filtre si Done est a 0 ou 1 

// ...

// Route pour récupérer les tâches en fonction de la propriété 'Done'
router.get('/done/:status', (req, res) => {
    const status = parseInt(req.params.status);
    
    try {
        const sql = "SELECT * FROM todo WHERE Done = ?";
        const values = [status];

        pool.query(sql, values, (error, results) => {
            if (error) {
                console.log(error);
                res.status(500).json({ message: 'Erreur lors de la récupération des tâches' });
            } else {
                res.json(results);
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Erreur lors de la récupération des tâches' });
    }
});

// Route pour rechercher des tâches par mot-clé dans le titre
router.get('/search/:keyword', (req, res) => {
    const keyword = req.params.keyword;

    try {
        const sql = "SELECT * FROM todo WHERE title LIKE ?";
        const values = [`%${keyword}%`];

        pool.query(sql, values, (error, results) => {
            if (error) {
                console.log(error);
                res.status(500).json({ message: 'Erreur lors de la recherche des tâches' });
            } else {
                res.json(results);
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Erreur lors de la recherche des tâches' });
    }
});

// Route pour rechercher des tâches par due_date ASC
router.get('/date', (req, res) => {
    try {
        const sql = "SELECT * FROM todo WHERE due_date";

        pool.query(sql, (error, results) => {
            if (error) {
                console.log(error);
                res.status(500).json({ message: 'Erreur lors de la recherche des tâches' });
            } else {
                res.json(results);
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Erreur lors de la recherche des tâches' });
    }
});




module.exports = router;


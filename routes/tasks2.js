var express = require('express');
var router = express.Router();

const mysql = require('mysql');

const middlewares = require('../middlewares');

const sequelize = require('../utils/sequelize');

const { Task } = require('../models/models');

const { Op } = require('sequelize');



// router.use(middlewares.authenticationMiddleware);

const pool = mysql.createPool({
    host: process.env.DB_HOST_2, // L'hôte de la base de données MySQL
    user: process.env.DB_USER_2, // Votre nom d'utilisateur MySQL
    password: process.env.DB_PASSWORD_2, // Votre mot de passe MySQL
    database: process.env.DB_NAME_2, // Le nom de la base de données MySQL
});

// liste des tasks

router.get('/all', function (req, res, next) {
    Task.findAll().then((tasks) => {
        res.json(tasks);
    });
});

// liste de tout les tasks

router.get('/all/async', async function (req, res, next) {
    const tasks = await Task.findAll();
    res.json(tasks);
});


// filter

router.get('/filtered', async function (req, res) {
    const tasks = await Task.findAll({
        where: {
            [Op.or]: [
                {
                    user: {
                        [Op.like]: '%a%',
                    },
                },
                {
                    user: {
                        [Op.like]: '%o%',
                    }
                }
            ]
        },

    });
    res.json(tasks);
});



//Obtenir les tasks par id

router.get('/:id', function (req, res, next) {
    const id = parseInt(req.params.id);

    Task.findByPk(id).then((task) => {
        if (task) {
            res.json(task);
        } else {
            res.status(404).json({ message: "Tâche non trouvée" });
        }
    });
});



// Création d'une nouvelle tasks

router.post('/', (req, res) => {
    const newTask = req.body;

    try {
        Task.create(newTask).then((createdTask) => {
            res.status(201).json(createdTask);
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Erreur lors de la création de la tâche' });
    }
});



// Modification d'une tache


router.patch('/:id', async (req, res) => {
    const taskId = parseInt(req.params.id);
    Task.findByPk(taskId).then((task) => {
        if (task) {
            task.update(req.body).then((updatedTask) => {
                res.json(updatedTask);
            });
        } else {
            res.status(404).json({ message: 'Tâche non trouvée' });
        }
    });
});

// Suppression d'une tache

router.delete('/:id', async (req, res) => {
    const taskId = parseInt(req.params.id);
    Task.findByPk(taskId).then((task) => {
        if (task) {
            task.destroy().then(() => {
                res.send('Tâche supprimée');
            });
        } else {
            res.status(404).json({ message: 'Tâche non trouvée' });
        }
    });
});

// recherche par mot clé dans le titre 

router.get('/search/:keyword', async (req, res) => {
    const keyword = req.params.keyword;
    const tasks = await Task.findAll({
        where: {
            title: {
                [Op.like]: `%${keyword}%`,
            },
        },
    });
    res.json(tasks);
});

// filtre si Done est a 0 ou 1

router.get('/done/:status', async (req, res) => {
    const status = parseInt(req.params.status);
    const tasks = await Task.findAll({
        where: {
            done: status,
        },
    });
    res.json(tasks);
});

// filtre par due_date ASC

router.get('/due_date/asc', async (req, res) => {
    const tasks = await Task.findAll({
        order: [['due_date', 'ASC']],
    });
    res.json(tasks);
});





module.exports = router;


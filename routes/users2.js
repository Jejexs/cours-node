var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const middlewares = require('../middlewares');
const sequelize = require('../utils/sequelize');
const { User } = require('../models/models');
const { Op } = require('sequelize');



function generateToken(id) {
    return jwt.sign({ id: id }, process.env.JWT_SECRET);
}

// Création d'un nouvelle utilisateur et cryptage du mot de passe'

router.post('/signup2', async (req, res) => {
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

    try {
        const hashedPassword = await bcrypt.hash(body.password, 12);
        const user = await User.create({
            email: body.email,
            password: hashedPassword,
            display_name: body.display_name
        });
        res.status(201)
        res.send("ok")
    } catch (exception) {
        res.status(500)
        res.send("Erreur lors de la création : " + exception)
    }
})

// src/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const knex = require('knex')(require('../../knexfile').development);

// Register a new user
router.post('/register', async (req, res) => {
    const { nome, email, senha, endereco, telefone } = req.body;
    if (!nome || !email || !senha) {
        return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });
    }
    try {
        const hash = await bcrypt.hash(senha, 10);
        const [id] = await knex('users').insert({
            nome,
            email,
            senha_hash: hash,
            endereco,
            telefone,
        }).returning('id');
        res.status(201).json({ id, email, nome });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Erro ao registrar usuário.' });
    }
});

// Login and return JWT
router.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    if (!email || !senha) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }
    try {
        const user = await knex('users').where({ email }).first();
        if (!user) return res.status(401).json({ error: 'Credenciais inválidas.' });
        const match = await bcrypt.compare(senha, user.senha_hash);
        if (!match) return res.status(401).json({ error: 'Credenciais inválidas.' });
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Erro ao fazer login.' });
    }
});

module.exports = router;

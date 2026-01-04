// src/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const knex = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-muito-seguro-para-desenvolvimento';

// Register a new user
router.post('/register', async (req, res) => {
    const { nome, email, senha, endereco, telefone } = req.body;
    if (!nome || !email || !senha) {
        return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });
    }
    try {
        // PERFORMANCE: Verifica se o usuário já existe ANTES de gastar CPU com o hash process
        const existingUser = await knex('users').where({ email }).first();
        if (existingUser) {
            return res.status(400).json({ error: 'Este email já está cadastrado.' });
        }

        const hash = await bcrypt.hash(senha, 10);

        const result = await knex('users').insert({
            nome,
            email,
            senha_hash: hash,
            endereco,
            telefone,
        }).returning(['id', 'email', 'nome']);

        const newUser = result[0];
        res.status(201).json(newUser);
    } catch (err) {
        // Race condition: O e-mail pode ter sido inserido entre o check inicial e o insert final
        if (err.code === '23505' || err.message.includes('unique constraint') || err.message.includes('UNIQUE constraint')) {
            return res.status(400).json({ error: 'Este email já está cadastrado.' });
        }
        console.error('Register error:', err);
        res.status(500).json({ error: 'Erro ao registrar usuário. Tente novamente.' });
    }
});

// Login and return JWT (Protegido contra Ghost Accounts)
router.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    if (!email || !senha) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }
    try {
        const user = await knex('users')
            .select('id', 'nome', 'email', 'senha_hash')
            .where({ email })
            .first();

        // SEGURANÇA: Se a conta for GUEST (criada no checkout rápido), ela não tem senha real.
        // Impedimos o login direto nela. O usuário deve usar "Recuperar Senha" para definir uma.
        if (!user || user.senha_hash === 'GUEST_ACCOUNT') {
            return res.status(401).json({ error: 'Credenciais inválidas ou e-mail vinculado a conta de convidado.' });
        }

        const match = await bcrypt.compare(senha, user.senha_hash);
        if (!match) return res.status(401).json({ error: 'Credenciais inválidas.' });

        const token = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                nome: user.nome,
                email: user.email
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Erro ao fazer login.' });
    }
});

module.exports = router;

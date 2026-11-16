const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const signToken = (user) =>
  jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  });

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // El rol no se acepta desde el cliente: todo registro público es "user"
  const user = await User.create({ name, email, password });
  const token = signToken(user);

  res.status(201).json({
    ok: true,
    message: 'Usuario registrado correctamente',
    token,
    user,
  });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Email y contraseña son obligatorios', 400);
  }

  const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Credenciales inválidas', 401);
  }

  const token = signToken(user);

  res.status(200).json({
    ok: true,
    message: 'Inicio de sesión exitoso',
    token,
    user,
  });
});

// GET /api/auth/me
const me = asyncHandler(async (req, res) => {
  res.status(200).json({ ok: true, user: req.user });
});

module.exports = { register, login, me };

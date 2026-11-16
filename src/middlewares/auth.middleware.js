const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// Verifica el header "Authorization: Bearer <token>" y adjunta el usuario a req.user
const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new AppError('No autorizado: falta el token Bearer', 401);
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    const message =
      error.name === 'TokenExpiredError'
        ? 'No autorizado: el token ha expirado'
        : 'No autorizado: token inválido';
    throw new AppError(message, 401);
  }

  const user = await User.findById(payload.sub);
  if (!user) {
    throw new AppError('No autorizado: el usuario del token ya no existe', 401);
  }

  req.user = user;
  next();
});

// Restringe la ruta a uno o más roles (se usa después de protect)
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError('Prohibido: no tienes permisos para esta acción', 403));
  }
  next();
};

module.exports = { protect, authorize };

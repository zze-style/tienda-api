const notFound = (req, res) => {
  res.status(404).json({
    ok: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
};

// Traduce los errores de Mongoose, JSON y AppError a respuestas HTTP claras
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Error interno del servidor';
  let errors;

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Error de validación';
    errors = Object.values(err.errors).map((e) => e.message);
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Identificador inválido: ${err.value}`;
  } else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'campo';
    message = `Ya existe un registro con ese ${field}`;
  } else if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'El cuerpo de la petición no es un JSON válido';
  }

  if (statusCode === 500) {
    console.error(err);
  }

  const body = { ok: false, message };
  if (errors) body.errors = errors;
  res.status(statusCode).json(body);
};

module.exports = { notFound, errorHandler };

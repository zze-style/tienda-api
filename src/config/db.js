const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Falta la variable MONGODB_URI en el archivo .env');
    process.exit(1);
  }
  try {
    await mongoose.connect(uri);
    console.log(`MongoDB conectado: ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (error) {
    console.error('Error al conectar con MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;

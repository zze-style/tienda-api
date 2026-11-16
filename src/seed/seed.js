// Crea un usuario administrador y un catálogo inicial de productos.
// Uso: npm run seed
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');

const products = [
  { name: 'Teclado mecánico', description: 'Teclado RGB switch azul', price: 150, stock: 20, category: 'periféricos' },
  { name: 'Mouse inalámbrico', description: 'Mouse ergonómico 2.4 GHz', price: 60, stock: 35, category: 'periféricos' },
  { name: 'Monitor 24 pulgadas', description: 'Monitor IPS Full HD 75 Hz', price: 520, stock: 8, category: 'monitores' },
];

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error('Define ADMIN_EMAIL y ADMIN_PASSWORD en .env');

  let admin = await User.findOne({ email });
  if (!admin) {
    admin = await User.create({ name: 'Administrador', email, password, role: 'admin' });
    console.log(`Administrador creado: ${email}`);
  } else {
    console.log(`El administrador ${email} ya existía`);
  }

  for (const p of products) {
    await Product.updateOne(
      { name: p.name },
      { $setOnInsert: { ...p, createdBy: admin._id } },
      { upsert: true }
    );
  }
  console.log(`Productos listos: ${products.length}`);

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error('Error en el seed:', error.message);
  await mongoose.disconnect();
  process.exit(1);
});

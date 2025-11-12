require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const vendorRoutes = require('./routes/vendor');
const superAdminRoutes = require('./routes/superadmin');
const clientRoutes = require('./routes/client');
const ProductRoutes = require('./routes/Product');

const app = express();
app.use(express.json({ type: ['application/json', 'text/plain'] }));
app.use(cors());

app.use('/api/auth', authRoutes);
app.use('/api/superadmin', superAdminRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', ProductRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/client', clientRoutes);

const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Atlas connected');


    app.listen(PORT, () => console.log('Server running on port', PORT));
  })
  .catch((err) => {
    console.error('DB connection error', err);
    process.exit(1);
  });

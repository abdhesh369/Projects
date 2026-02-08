require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors());
app.use(express.json());

// Routes
const bankingRoutes = require('./routes/banking.routes');
app.use('/', bankingRoutes);

app.listen(PORT, () => {
    console.log(`Banking Integration Service running on port ${PORT}`);
});

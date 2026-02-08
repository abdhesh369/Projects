require('dotenv').config();
const express = require('express');
const cors = require('cors');
const transactionRoutes = require('./routes/transaction.routes');

const app = express();
const PORT = process.env.PORT || 3009;

app.use(cors());
app.use(express.json());

// Routes
app.use('/', transactionRoutes);

app.listen(PORT, () => {
    console.log(`Transaction Service running on port ${PORT}`);
});

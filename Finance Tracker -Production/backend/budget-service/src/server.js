require('dotenv').config();
const express = require('express');
const cors = require('cors');
const budgetRoutes = require('./routes/budget.routes');

const app = express();
const PORT = process.env.PORT || 3006;

app.use(cors());
app.use(express.json());

// Routes
app.use('/', budgetRoutes);

app.listen(PORT, () => {
    console.log(`Budget Service running on port ${PORT}`);
});

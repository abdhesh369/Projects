require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3007;

app.use(cors());
app.use(express.json());

// Routes
const notificationRoutes = require('./routes/notification.routes');
app.use('/', notificationRoutes);

app.listen(PORT, () => {
    console.log(`Notification Service running on port ${PORT}`);
});

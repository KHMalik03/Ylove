const express = require('express')();

const userRoutes = require('./routes/user.routes');
const profileRoutes = require('./routes/profile.routes');

const app = express();


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/users', userRoutes);
app.use('/profiles', profileRoutes);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
const express = require('express');
const app = express();

const userRoutes = require('./routes/user.routes.js');
const profileRoutes = require('./routes/profile.routes.js');
const blockRoutes = require('./routes/block.routes.js');
const intrestRoutes = require('./routes/intrest.routes.js');
const userInterestRoutes = require('./routes/userIntrest.routes.js');
const matchRoutes = require('./routes/match.routes.js');
const messageRoutes = require('./routes/message.routes.js');
const photoRoutes = require('./routes/photo.routes.js');
const reportRoutes = require('./routes/report.routes.js');
const swipeRoutes = require('./routes/swipe.routes.js');



// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/users', userRoutes);
app.use('/profiles', profileRoutes);
app.use('/blocks', blockRoutes);
app.use('/interest', intrestRoutes);
app.use('/matches', matchRoutes);
app.use('/messages', messageRoutes);
app.use('/photos', photoRoutes);
app.use('/reports', reportRoutes);
app.use('/swipes', swipeRoutes);
app.use('/userInterests', userInterestRoutes);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
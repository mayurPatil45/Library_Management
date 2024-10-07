const cookieParser = require('cookie-parser');
const express = require('express');
const connectDB = require('./config/connectDB');
const passport = require('passport')
const userRoute = require('./routes/userRoute');
const categoryRoute = require('./routes/categoryRoute');
const bookRoute = require('./routes/bookRoute');
const loanRoute = require('./routes/loanRoute');
require('./config/passportStretegyJwt')
require('dotenv').config()

const app = express();
app.use(cookieParser())

connectDB();
app.use(express.json())

// Passport Middleware
app.use(passport.initialize())

app.use('/api/user', userRoute);

app.use('/api/admin', categoryRoute);

app.use('/api/admin', bookRoute);
app.use('/api', bookRoute);

app.use('/api/admin', loanRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
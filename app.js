const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session'); // Import express-session
// const cors = require('cors');  // Import CORS middleware
// const MongoStore = require('connect-mongo');
const authRouter = require('./routes/auth');
const apiCheckRouter = require('./routes/apiCheck');
require('dotenv').config(); // Load environment variables from .env file
const cookieParser = require('cookie-parser'); // Import cookie-parser

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser()); // Use cookie-parser middleware

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// CORS Middleware (add this code here)
// app.use(cors({
//   origin: 'https://auth-j347.onrender.com', // Replace with your Render site URL
//   credentials: true
// }));

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session Middleware
app.use(session({
  secret: process.env.SESSION_SECRET || DEFAULT_SECRET, // Use a strong secret key
  resave: false,
  saveUninitialized: true,
  // store: MongoStore.create({
  //     mongoUrl: process.env.MONGO_URI,
  //     collectionName: 'sessions'
  // }),
  cookie: { secure: process.env.NODE_ENV === 'production', httpOnly: true, sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax', }  // Secure cookies in production
}));
// app.use(session({
//   secret: process.env.SESSION_SECRET || DEFAULT_SECRET, // Use a strong secret key
//   resave: false,
//   saveUninitialized: true,
//   cookie: { secure: process.env.NODE_ENV === 'production' } // Secure cookies in production
// }));

// MongoDB Connection
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI)
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

// Routes
app.use('/api', apiCheckRouter);
app.use('/', authRouter);

// 404 Error Page
app.use((req, res) => {
  res.status(404).render('404');
});

// Start the Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});





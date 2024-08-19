const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const router = express.Router();
const jwt = require('jsonwebtoken');


// Registration Route
router.get('/register', (req, res) => {
    res.render('register');
});


router.post('/register', async (req, res) => {
    const { loginuser, email, loginpassword } = req.body;

    try {
        const existingUser = await User.findOne({ loginuser });
        if (existingUser) {
            return res.status(400).send('Username already exists');
        }

        const hashedPassword = await bcrypt.hash(loginpassword, 10);
        const user = new User({ loginuser, email, loginpassword: hashedPassword });
        await user.save();

        // Create a JWT token
        const token = jwt.sign({ loginuser: user.loginuser }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Store the token in a cookie
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        res.redirect('/home');
    } catch (err) {
        console.error('Error registering user:', err.message);
        res.status(400).send('Error registering user');
    }
});


// router.post('/register', async (req, res) => {
//     const { loginuser, email, loginpassword } = req.body;

//     try {
//         // Check if the loginuser already exists
//         const existingUser = await User.findOne({ loginuser });
//         if (existingUser) {
//           return res.status(400).send('Username already exists');
//         }
    
//         const hashedPassword = await bcrypt.hash(loginpassword, 10);
//         const user = new User({ loginuser, email, loginpassword: hashedPassword });
//         await user.save();
//         res.redirect('/login');
//       } catch (err) {
//         console.error('Error registering user:', err.message);
//         res.status(400).send('Error registering user');
//       }

//     // try {
//     //     const hashedPassword = await bcrypt.hash(loginpassword, 10);
//     //     const user = new User({ loginuser, email, loginpassword: hashedPassword });
//     //     await user.save();
//     //     res.redirect('/login');
//     // } catch (err) {
//     //     console.error('Error registering user:', err);
//     //     res.status(400).send('Error registering user');
//     // }
// });

// Login Route
router.get('/login', (req, res) => {
    //res.render('login');
    res.render('login', { error: null });
});

// router.post('/login', async (req, res) => {
//     const { loginuser, loginpassword } = req.body;

//     try {
//         const user = await User.findOne({ loginuser });
//         if (user && await bcrypt.compare(loginpassword, user.loginpassword)) {
//             // Set a session cookie (or use your authentication strategy)
//             //res.cookie('sessionId', 'yourSessionValue', { httpOnly: true });
//             req.session.loginuser = loginuser;
            
//             res.redirect('/home');
//         } else {
//             // res.status(404).render('404');
//             res.status(401).render('login', { error: 'Invalid login credentials' });
//         }
//     } catch (error) {
//         console.error('Error during login:', error);
//         res.status(500).send('Internal Server Error');
//     }
// });

router.post('/login', async (req, res) => {
    const { loginuser, loginpassword } = req.body;

    try {
        const user = await User.findOne({ loginuser });
        if (user && await bcrypt.compare(loginpassword, user.loginpassword)) {
            // Create a JWT token
            const token = jwt.sign({ loginuser: user.loginuser }, process.env.JWT_SECRET, { expiresIn: '1h' });

            // Store the token in a cookie
            res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
            res.redirect('/home');
        } else {
            res.status(401).render('login', { error: 'Invalid login credentials' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Internal Server Error');
    }
});



// Home Page
// router.get('/home', (req, res) => {
//     res.render('home');
// });
// router.get('/home', (req, res) => {
//     if (!req.session.loginuser) { // Check if user is logged in
//       return res.redirect('/login');
//     }
//     res.render('home', { loginuser: req.session.loginuser });
// });
router.get('/home', (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.redirect('/login');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.render('home', { loginuser: decoded.loginuser });
    } catch (error) {
        console.error('Invalid token:', error);
        res.redirect('/login');
    }
});



// router.get('/logout', (req, res) => {
//     req.session.destroy(); // Destroy session
//     res.redirect('/login');
// });
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
});



module.exports = router;





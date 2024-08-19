const express = require('express');
const axios = require('axios');
const router = express.Router();

const maxRetries = 3;

router.post('/check-api', async (req, res) => {
    const { loginUser, loginPassword, url } = req.body;

    if (!loginUser || !loginPassword || !url) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    async function loginAndCheckHome(attempts) {
        try {
            console.log(`Attempt ${attempts + 1} - Trying to log in`);

            // Step 1: Attempt to log in
            const loginResponse = await axios.post(`${url}/login`, {
                loginuser: loginUser,
                loginpassword: loginPassword
            }, {
                maxRedirects: 0, // Prevent axios from following redirects automatically
                validateStatus: status => status === 302 || status === 200, // Accept 302 Redirects and 200 OK
            });

            console.log('Login Response:', loginResponse.data);

            // Check if a session cookie is present
            const cookieHeader = loginResponse.headers['set-cookie'];
            if (!cookieHeader) {
                throw new Error('No session cookie received after login');
            }

            // Step 2: Follow the redirect to the home page if login was successful
            if (loginResponse.status === 302 && loginResponse.headers.location === '/home') {
                console.log('Login successful, checking home page');

                // Request the home page with the session cookie
                const homeResponse = await axios.get(`${url}/home`, {
                    headers: {
                        'Cookie': cookieHeader.join(';'), // Pass the session cookie
                    }
                });

                console.log('Home Page Response:', homeResponse.data);

                if (homeResponse.status === 200 && homeResponse.data.includes('<title>Home</title>')) {
                    return { success: true, message: 'Login successful and home page loaded.' };
                } else {
                    throw new Error('Failed to load home page after login');
                }
            } else {
                throw new Error('Login failed or did not redirect to home');
            }
        } catch (error) {
            console.error(`Attempt ${attempts + 1} - ${error.message}`, error.response ? error.response.data : '');

            if (attempts < maxRetries - 1) {
                console.log('Retrying...');
                return await loginAndCheckHome(attempts + 1);
            } else {
                return { success: false, message: 'API is not working after 3 attempts' };
            }
        }
    }

    const result = await loginAndCheckHome(0);

    if (result.success) {
        res.json({ status: 'success', message: result.message });
    } else {
        res.status(500).json({ status: 'error', message: result.message });
    }
});

module.exports = router;







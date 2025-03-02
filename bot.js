require('dotenv').config();
const express = require('express');
const line = require('@line/bot-sdk');
const mysql = require('mysql2');  // Use 'pg' for PostgreSQL
const axios = require('axios');

const app = express();

// LINE Bot Configuration
const config = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.CHANNEL_SECRET
};
const client = new line.Client(config);

// Database Connection (MySQL)
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});
db.connect(err => {
    if (err) throw err;
    console.log("✅ Connected to MySQL Database");
});

app.use(express.json());

// Function to Get User Profile (Display Name)
async function getUserProfile(userId) {
    const url = `https://api.line.me/v2/bot/profile/${userId}`;
    try {
        const response = await axios.get(url, {
            headers: {
                "Authorization": `Bearer ${process.env.CHANNEL_ACCESS_TOKEN}`
            }
        });
        return response.data.displayName;  // Returns user's display name
    } catch (error) {
        console.error("❌ Error fetching user profile:", error);
        return "Unknown User";  // Fallback if request fails
    }
}

// Handle Incoming Messages
app.post('/webhook', async (req, res) => {
    try {
        const events = req.body.events;
        for (const event of events) {
            if (event.type === 'message' && event.message.type === 'text') {
                const userId = event.source.userId;
                const messageText = event.message.text;

                // Check for "-number xxxxxxxxx" format
                const match = messageText.match(/-number (\d+)/);
                if (match) {
                    const number = match[1];

                    // Get User's Display Name
                    const displayName = await getUserProfile(userId);

                    // Save to Database
                    db.query("INSERT INTO messages (user_id, user_name, number) VALUES (?, ?, ?)", 
                        [userId, displayName, number], 
                        (err) => {
                            if (err) {
                                console.error("❌ Database Error:", err);
                            }
                        }
                    );

                    // Reply to User
                    await client.replyMessage(event.replyToken, {
                        type: "text",
                        text: `✅ ${displayName}, your number ${number} has been saved!`
                    });
                }
            }
        }
        res.sendStatus(200);
    } catch (error) {
        console.error("❌ Error handling event:", error);
        res.sendStatus(500);
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

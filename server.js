const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

const dbPool = mysql.createPool({
    host: '195.34.83.112',
    port: 3306,
    user: 'hhhhadmin',
    password: 'Ddlgn2023.',
    database: 'ContactDatabase',
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

// app.post('/api/insertData', async (req, res) => {
//     try {
//         const {id, EnglishBody, EnglishTitle, ItemRank, ItemCover, EventDate, EndDate, EventDescription, ItemDescription } = req.body;

//         //const { Title, Email, Id } = req.body; // Extract Title, Email, and Id from the request body

//         const connection = await dbPool.getConnection();
//         await connection.query('INSERT INTO Testevents (id, EnglishBody, EnglishTitle, ItemRank, ItemCover, EventDate, EndDate, EventDescription, ItemDescription) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [id, EnglishBody, EnglishTitle, ItemRank, ItemCover, EventDate, EndDate, EventDescription, ItemDescription]);

//         //await connection.query('INSERT INTO Sharepoint (Title, Email, Id) VALUES (?, ?, ?)', [Title, Email, Id]);
//         connection.release();

//         res.status(200).json({ message: 'Data inserted successfully' });
//     } catch (error) {
//         console.error('Error inserting data into MySQL:', error);
//         res.status(500).json({ error: 'Error inserting data' });
//     }
// });
app.post('/api/insertData', async (req, res) => {
    try {
        const itemsToInsert = req.body; // Assuming req.body is an array of items

        const connection = await dbPool.getConnection();

        for (const item of itemsToInsert) {
            const { id, EnglishBody, EnglishTitle, ItemRank, ItemCover, EventDate, EndDate, EventDescription, ItemDescription } = item;

            await connection.query('INSERT INTO Testevents (id, EnglishBody, EnglishTitle, ItemRank, ItemCover, EventDate, EndDate, EventDescription, ItemDescription) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [id, EnglishBody, EnglishTitle, ItemRank, ItemCover, EventDate, EndDate, EventDescription, ItemDescription]);
        }

        connection.release();

        res.status(200).json({ message: 'Data inserted successfully' });
    } catch (error) {
        console.error('Error inserting data into MySQL:', error);
        res.status(500).json({ error: 'Error inserting data' });
    }
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

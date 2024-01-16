const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

const dbPool = mysql.createPool({
    host: '185.3.235.202',
    port: 3306,
    user: 'h187338_database',
    password: 'Ddlgn2023.',
    database: 'h187338_publicsp_gruene-washington-de',
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

// app.post('/api/tableCreationdata', async (req, res) => {
//     try {
//         const itemsToInsert = req.body;
//         if (!Array.isArray(itemsToInsert) || itemsToInsert.length === 0) {
//             return res.status(400).json({ error: 'Invalid input data' });
//         }
//         const connection = await dbPool.getConnection(); 
//         const sampleItem = itemsToInsert[0];
//         const tableName = 'Announcements'; // Set your desired dynamic table name here
//         const columns = Object.keys(sampleItem);
//         // Generate the SQL CREATE TABLE statement
//         const createTableQuery = `CREATE TABLE IF NOT EXISTS ${tableName} (${columns.map(column => `${column} longtext`).join(', ')})`;
//         // Execute the CREATE TABLE query
//         await connection.query(createTableQuery);
//         for (const item of itemsToInsert) {
//             const values = columns.map(column => item[column]);
//             // Generate the SQL INSERT INTO statement
//             const insertQuery = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`;
//             // Execute the INSERT INTO query
//             await connection.query(insertQuery, values);
//         }
//         res.status(200).json({ message: 'Data inserted successfully' });
//     } catch (error) {
//         console.error('Error inserting data into SQL Server:', error);
//         res.status(500).json({ error: 'Error inserting data' });
//     } finally {
//         await sql.close();
//     }
// });
app.post('/api/tableCreationdata', async (req, res) => {
    let connection;
    try {
        const { data: itemsToInsert, tableName } = req.body;
        if (!Array.isArray(itemsToInsert) || itemsToInsert.length === 0 || !tableName) {
            return res.status(400).json({ error: 'Invalid input data' });
        }
        connection = await dbPool.getConnection();
        const sampleItem = itemsToInsert[0];
        // Check if the table already exists
        const tableExistsQuery = `SHOW TABLES LIKE '${tableName}'`;
        const tableExistsResult = await connection.query(tableExistsQuery);
        console.log(tableExistsResult)

        if (tableExistsResult[0].length === 0) {
            // Table doesn't exist, so create it dynamically without a primary key
            const createTableQuery = `CREATE TABLE ${tableName} (${Object.keys(sampleItem).map(column => `${column} longtext`).join(', ')})`;
            await connection.query(createTableQuery);
        } else {
            // Table already exists, dynamically adjust the schema
            for (const column of Object.keys(sampleItem)) {
                const columnExistsQuery = `SHOW COLUMNS FROM ${tableName} LIKE '${column}'`;
                const columnExistsResult = await connection.query(columnExistsQuery);

                if (columnExistsResult[0].length === 0) {
                    // Column doesn't exist, so add it dynamically
                    const addColumnQuery = `ALTER TABLE ${tableName} ADD COLUMN ${column} longtext`;
                    await connection.query(addColumnQuery);
                }
            }
        }

        // Insert data into the table without specifying the primary key
        for (const item of itemsToInsert) {
            const columns = Object.keys(item);
            const values = columns.map(column => item[column]);
            const insertQuery = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`;
            await connection.query(insertQuery, values);
        }

        res.status(200).json({ message: 'Data inserted successfully' });
    } catch (error) {
        console.error('Error inserting data into SQL Server:', error);
        res.status(500).json({ error: 'Error inserting data' });
    } finally {
        if (connection) {
            await connection.release();
        }
    }
});

// app.post('/api/tableCreationdata', async (req, res) => {
//     let connection;
//     try {
//         const { data: itemsToInsert, tableName } = req.body;
//         if (!Array.isArray(itemsToInsert) || itemsToInsert.length === 0 || !tableName) {
//             return res.status(400).json({ error: 'Invalid input data' });
//         }
//         connection = await dbPool.getConnection(); 
//         const sampleItem = itemsToInsert[0];
//         // Check if the table already exists
//         const tableExistsQuery = `SHOW TABLES LIKE '${tableName}'`;
//         const tableExistsResult = await connection.query(tableExistsQuery);

//         if (tableExistsResult[0].length === 0) {
//             // Table doesn't exist, so create it dynamically
//             const createTableQuery = `CREATE TABLE ${tableName} (${Object.keys(sampleItem).map(column => `${column} longtext`).join(', ')})`;
//             await connection.query(createTableQuery);
//         } else {
//             // Table already exists, dynamically adjust the schema
//             for (const column of Object.keys(sampleItem)) {
//                 const columnExistsQuery = `SHOW COLUMNS FROM ${tableName} LIKE '${column}'`;
//                 const columnExistsResult = await connection.query(columnExistsQuery);
                
//                 if (columnExistsResult[0].length === 0) {
//                     // Column doesn't exist, so add it dynamically
//                     const addColumnQuery = `ALTER TABLE ${tableName} ADD COLUMN ${column} longtext`;
//                     await connection.query(addColumnQuery);
//                 }
//             }
//         }

//         // Insert data into the table
//         for (const item of itemsToInsert) {
//             const values = Object.keys(sampleItem).map(column => item[column]);
//             const insertQuery = `INSERT INTO ${tableName} (${Object.keys(sampleItem).join(', ')}) VALUES (${Object.keys(sampleItem).map(() => '?').join(', ')})`;
//             await connection.query(insertQuery, values);
//         }

//         res.status(200).json({ message: 'Data inserted successfully' });
//     } catch (error) {
//         console.error('Error inserting data into SQL Server:', error);
//         res.status(500).json({ error: 'Error inserting data' });
//     } finally {
//         if (connection) {
//             await connection.release();
//         }
//     }
// });

app.post('/api/insertData', async (req, res) => {
    try { 
        const { data: itemsToInsert, tableName } = req.body; // Assuming req.body is an array of items
        const connection = await dbPool.getConnection();
        for (const item of itemsToInsert) {
            const keys = Object.keys(item);
            const values = Object.values(item);
            const placeholders = keys.map(() => '?').join(', ');
            const query = `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES (${placeholders})`;
            await connection.query(query, values);
        }
        connection.release();
        res.status(200).json({ message: 'Data inserted successfully' });
    } catch (error) {
        console.error('Error inserting data into MySQL:', error);
        res.status(500).json({ error: 'Error inserting data' });
    }
});

// app.post('/api/insertData', async (req, res) => {
//     try {
//         const itemsToInsert = req.body; // Assuming req.body is an array of items

//         const connection = await dbPool.getConnection();

//         for (const item of itemsToInsert) {
//             const { id, EnglishBody, EnglishTitle, ItemRank, ItemCover, EventDate, EndDate, EventDescription, ItemDescription,Title, EventType, Modified, Created } = item;

//             await connection.query('INSERT INTO events (id, EnglishBody, EnglishTitle, ItemRank, ItemCover, EventDate, EndDate, EventDescription, ItemDescription,Title,EventType, Modified, Created) VALUES (?,?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?)', [id, EnglishBody, EnglishTitle, ItemRank, ItemCover, EventDate, EndDate, EventDescription, ItemDescription,Title,EventType, Modified, Created]);
//         }

//         connection.release();

//         res.status(200).json({ message: 'Data inserted successfully' });
//     } catch (error) {
//         console.error('Error inserting data into MySQL:', error);
//         res.status(500).json({ error: 'Error inserting data' });
//     }
// });

// app.put('/api/updateData', async (req, res) => {
//     try {
//         const itemsToUpdate = req.body; // Assuming req.body is an array of items
//         const connection = await dbPool.getConnection();
//         for (const item of itemsToUpdate) {
//             const {
//                 id,
//                 EnglishBody,
//                 EnglishTitle,
//                 ItemRank,
//                 ItemCover,
//                 EventDate,
//                 EndDate,
//                 EventDescription,
//                 ItemDescription,
//                 Title,
//                 EventType,
//                 Modified, 
//                 Created,
//             } = item;

//             await connection.query(
//                 'UPDATE events SET EnglishBody=?, EnglishTitle=?, ItemRank=?, ItemCover=?, EventDate=?, EndDate=?, EventDescription=?, ItemDescription=?, Title=?, EventType=?, Modified=?, Created=? WHERE id=?',
//                 [EnglishBody, EnglishTitle, ItemRank, ItemCover, EventDate, EndDate, EventDescription, ItemDescription, Title, EventType, Modified, Created, id]
//             );
//         }
//         connection.release();
//         res.status(200).json({ message: 'Data updated successfully' });
//     } catch (error) {
//         console.error('Error updating data in MySQL:', error);
//         res.status(500).json({ error: 'Error updating data' });
//     }
// });
app.put('/api/updateData', async (req, res) => {
    try {
        const { data: itemsToUpdate, tableName } = req.body; // Assuming req.body is an array of items
        const connection = await dbPool.getConnection();
        for (const item of itemsToUpdate) {
            const { id, ...updateFields } = item;
            const keys = Object.keys(updateFields);
            const values = Object.values(updateFields);
            const setClause = keys.map(key => `${key}=?`).join(', ');
            await connection.query(
                `UPDATE ${tableName} SET ${setClause} WHERE id=?`,
                [...values, id]
            );
        }
        connection.release();
        res.status(200).json({ message: 'Data updated successfully' });
    } catch (error) {
        console.error('Error updating data in MySQL:', error);
        res.status(500).json({ error: 'Error updating data' });
    }
});
app.get('/api/getData', async (req, res) => {
    try {
        // Extract the table name from the query parameters
        const tableName = req.query.table;
        if (!tableName) {
            return res.status(400).json({ error: 'Table name is required' });
        }
        const connection = await dbPool.getConnection();
        // Retrieve column names from the specified table
        const columnsResult = await connection.query(`SHOW COLUMNS FROM ${tableName}`);
        const columns = columnsResult[0].map(column => column.Field);
        // Use the column names to build the SELECT query
        const selectQuery = `SELECT ${columns.join(', ')} FROM ${tableName}`;
        // Execute the SELECT query
        const result = await connection.query(selectQuery);
        const data = result[0]; // Assuming the data is in the first element of the result array
        connection.release();
        res.status(200).json(data);
    } catch (error) {
        console.error('Error retrieving data from MySQL:', error);
        res.status(500).json({ error: 'Error retrieving data' });
    }
});

// app.get('/api/getData', async (req, res) => {
//     try {
//         const connection = await dbPool.getConnection();

//         // Retrieve column names from the table
//         const columnsResult = await connection.query('SHOW COLUMNS FROM events');
//         const columns = columnsResult[0].map(column => column.Field);

//         // Use the column names to build the SELECT query
//         const selectQuery = `SELECT ${columns.join(', ')} FROM events`;

//         // Execute the SELECT query
//         const result = await connection.query(selectQuery);
//         const data = result[0]; // Assuming the data is in the first element of the result array

//         connection.release();
//         res.status(200).json(data);
//     } catch (error) {
//         console.error('Error retrieving data from MySQL:', error);
//         res.status(500).json({ error: 'Error retrieving data' });
//     }
// });

// app.get('/api/getData', async (req, res) => {
//     try {
//         const connection = await dbPool.getConnection();
//         const result = await connection.query('SELECT * FROM events');
//         const data = result[0]; // Assuming the data is in the first element of the result array
//         connection.release();
//         res.status(200).json(data);
//     } catch (error) {
//         console.error('Error retrieving data from MySQL:', error);
//         res.status(500).json({ error: 'Error retrieving data' });
//     }
// });
app.delete('/api/deleteData', async (req, res) => {
    try {
        const { data: itemsToDelete, tableName } = req.body; // Assuming req.body is an array of item IDs
        const connection = await dbPool.getConnection();
        for (const idToDelete of itemsToDelete) {
            await connection.query(`DELETE FROM ${tableName} WHERE id=?`, [idToDelete.id]);
        }
        connection.release();
        res.status(200).json({ message: 'Data deleted successfully' });
    } catch (error) {
        console.error('Error deleting data in MySQL:', error);
        res.status(500).json({ error: 'Error deleting data' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

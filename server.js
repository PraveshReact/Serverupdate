const express = require('express');
const multer = require('multer');
const path = require('path');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
// Increase the limit for request size (e.g., 10MB)
app.use(bodyParser.json({ limit: '500mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '500mb' }));

const port = process.env.PORT || 4000;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    }
  });
  
  const upload = multer({ dest: 'uploads/' });

  
  app.use('/uploads', express.static('uploads'));

const dbPool = mysql.createPool({
    host: '195.34.83.112',
    port: 3306,
    user: 'gruene_db_user',
    password: '@8T2tu12f',
    database: 'h16635_publicsp_gruene-washington-de',
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

//------------------------------Working Code ---------------------------//
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
//             // Table doesn't exist, so create it dynamically without a primary key
//             const createTableQuery = `CREATE TABLE ${tableName} (${Object.keys(sampleItem).map(column => {
//                 if (column === 'image') {
//                     return `${column} LONGBLOB`; // Assuming 'image' is the name of your image column
//                 } else {
//                     return `${column} longtext`;
//                 }
//             }).join(', ')})`;
//             await connection.query(createTableQuery);
//         } else {
//             // Table already exists, dynamically adjust the schema
//             for (const column of Object.keys(sampleItem)) {
//                 const columnExistsQuery = `SHOW COLUMNS FROM ${tableName} LIKE '${column}'`;
//                 const columnExistsResult = await connection.query(columnExistsQuery);

//                 if (columnExistsResult[0].length === 0) {
//                     // Column doesn't exist, so add it dynamically
//                     const addColumnQuery = `ALTER TABLE ${tableName} ADD COLUMN ${column} ${column === 'image' ? 'LONGBLOB' : 'longtext'}`;
//                     await connection.query(addColumnQuery);
//                 }
//             }
//         }

//         // Insert data into the table without specifying the primary key
//         for (const item of itemsToInsert) {
//             const columns = Object.keys(item);
//             const values = columns.map(column => item[column]);
//             const insertQuery = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`;
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
//             // Table doesn't exist, so create it dynamically without a primary key
//             const createTableQuery = `CREATE TABLE ${tableName} (${Object.keys(sampleItem).map(column => {
//                 if (column === 'image') {
//                     return `${column} LONGBLOB`; // Assuming 'image' is the name of your image column
//                 } else {
//                     return `${column} longtext`;
//                 }
//             }).join(', ')})`;
//             await connection.query(createTableQuery);
//         } else {
//             // Table already exists, dynamically adjust the schema
//             for (const column of Object.keys(sampleItem)) {
//                 const columnExistsQuery = `SHOW COLUMNS FROM ${tableName} LIKE '${column}'`;
//                 const columnExistsResult = await connection.query(columnExistsQuery);

//                 if (columnExistsResult[0].length === 0) {
//                     // Column doesn't exist, so add it dynamically
//                     const addColumnQuery = `ALTER TABLE ${tableName} ADD COLUMN ${column} ${column === 'image' ? 'LONGBLOB' : 'longtext'}`;
//                     await connection.query(addColumnQuery);
//                 }
//             }
//         }

//         // Insert data into the table using streaming
//         const columns = Object.keys(sampleItem);
//         const insertQuery = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES ?`;
//         const values = itemsToInsert.map(item => columns.map(column => item[column]));
//         await connection.query(insertQuery, [values]);

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

        if (tableExistsResult[0].length > 0) {
            // Table exists, delete it before proceeding
            const dropTableQuery = `DROP TABLE ${tableName}`;
            await connection.query(dropTableQuery);
        }

        // Create the table dynamically without a primary key
        const createTableQuery = `CREATE TABLE ${tableName} (${Object.keys(sampleItem).map(column => {
            if (column === 'image') {
                return `${column} LONGBLOB`; // Assuming 'image' is the name of your image column
            } else {
                return `${column} longtext`;
            }
        }).join(', ')})`;
        await connection.query(createTableQuery);

        // Insert data into the table using streaming
        const columns = Object.keys(sampleItem);
        const insertQuery = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES ?`;
        const values = itemsToInsert.map(item => columns.map(column => item[column]));
        await connection.query(insertQuery, [values]);

        res.status(200).json({ message: 'Data inserted successfully' });
    } catch (error) {
        console.error('Error inserting data:', error);
        res.status(500).json({ error: 'Error processing data' });
    } finally {
        if (connection) {
            await connection.release();
        }
    }
});

//----------try to post image as well=------------------//
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
//             // Table doesn't exist, so create it dynamically without a primary key
//             const createTableQuery = `CREATE TABLE ${tableName} (${Object.keys(sampleItem).map(column => {
//                 if (column === 'image') {
//                     return `${column} LONGBLOB`; // Assuming 'image' is the name of your image column
//                 } else {
//                     return `${column} longtext`;
//                 }
//             }).join(', ')})`;
//             await connection.query(createTableQuery);
//         } else {
//             // Table already exists, dynamically adjust the schema
//             for (const column of Object.keys(sampleItem)) {
//                 const columnExistsQuery = `SHOW COLUMNS FROM ${tableName} LIKE '${column}'`;
//                 const columnExistsResult = await connection.query(columnExistsQuery);

//                 if (columnExistsResult[0].length === 0) {
//                     // Column doesn't exist, so add it dynamically
//                     const addColumnQuery = `ALTER TABLE ${tableName} ADD COLUMN ${column} ${column === 'image' ? 'LONGBLOB' : 'longtext'}`;
//                     await connection.query(addColumnQuery);
//                 }
//             }
//         }

//         // Insert data into the table without specifying the primary key
//         for (const item of itemsToInsert) {
//             const columns = Object.keys(item);
//             const values = columns.map(column => item[column]);
//             const insertQuery = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`;
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

app.get('/api/getDataFilterbase', async (req, res) => {
    try {
        // Extract the table name and title from the query parameters
        const { table, Title } = req.query;
        if (!table || !Title) {
            return res.status(400).json({ error: 'Table name and Title are required' });
        }
        const connection = await dbPool.getConnection();
        // Retrieve column names from the specified table
        const columnsResult = await connection.query(`SHOW COLUMNS FROM ${table}`);
        const columns = columnsResult[0].map(column => column.Field);
        // Use the column names to build the SELECT query with a WHERE clause for the title
        const selectQuery = `SELECT ${columns.join(', ')} FROM ${table} WHERE Title = ?`;
        // Execute the SELECT query with the Title parameter
        const result = await connection.query(selectQuery, [Title]);
        const data = result[0]; // Assuming the data is in the first element of the result array
        connection.release();
        res.status(200).json(data);
    } catch (error) {
        console.error('Error retrieving data from MySQL:', error);
        res.status(500).json({ error: 'Error retrieving data' });
    }
});
app.get('/api/getDataFilterItemRank', async (req, res) => {
    try {
        // Extract the table name and item rank from the query parameters
        const { table, ItemRank } = req.query;
        if (!table || !ItemRank) {
            return res.status(400).json({ error: 'Table name and ItemRank are required' });
        }
        const connection = await dbPool.getConnection();
        // Retrieve column names from the specified table
        const columnsResult = await connection.query(`SHOW COLUMNS FROM ${table}`);
        const columns = columnsResult[0].map(column => column.Field);
        // Use the column names to build the SELECT query with a WHERE clause for the item rank
        const selectQuery = `SELECT ${columns.join(', ')} FROM ${table} WHERE ItemRank = ?`;
        // Execute the SELECT query with the ItemRank parameter
        const result = await connection.query(selectQuery, [ItemRank]);
        const data = result[0]; // Assuming the data is in the first element of the result array
        connection.release();
        res.status(200).json(data);
    } catch (error) {
        console.error('Error retrieving data from MySQL:', error);
        res.status(500).json({ error: 'Error retrieving data' });
    }
});

//---------------------getSmartPagewebpartData-------------------//
app.get('/api/getDataFilterSmartPageId', async (req, res) => {
    try {
        const { table, SmartPagesId } = req.query;
        if (!table || !SmartPagesId) {
            return res.status(400).json({ error: 'Table name and SmartPagesId are required' });
        }

        const connection = await dbPool.getConnection();

        const columnsResult = await connection.query(`SHOW COLUMNS FROM ${table}`);
        const columns = columnsResult[0].map(column => column.Field);

        // Check if the SmartPagesId column exists in the table
        if (!columns.includes('SmartPagesId')) {
            return res.status(400).json({ error: 'SmartPagesId column does not exist in the table' });
        }

        // Build the SELECT query to fetch rows where SmartPagesId contains the specified value
        const selectQuery = `SELECT ${columns.join(', ')} FROM ${table} WHERE SmartPagesId LIKE ?`;

        // Construct the search pattern for the JSON array-like string
        const searchPattern = `%[${SmartPagesId}]%`;

        console.log('Select Query:', selectQuery);
        console.log('Search Pattern:', searchPattern);

        const result = await connection.query(selectQuery, [searchPattern]);

        const data = result[0];
        connection.release();

        console.log('Retrieved Data:', data);
        res.status(200).json(data);
    } catch (error) {
        console.error('Error retrieving data from MySQL:', error);
        res.status(500).json({ error: 'Error retrieving data' });
    }
});




// app.get('/api/getDataFilterSmartPageId', async (req, res) => {
//     try {
//         // Extract the table name and smart Pages from the query parameters
//         const { table, SmartPagesId } = req.query;
//         if (!table || !SmartPagesId) {
//             return res.status(400).json({ error: 'Table name and SmartPages are required' });
//         }
//         const connection = await dbPool.getConnection();
//         // Retrieve column names from the specified table
//         const columnsResult = await connection.query(`SHOW COLUMNS FROM ${table}`);
//         const columns = columnsResult[0].map(column => column.Field);
//         // Use the column names to build the SELECT query with a WHERE clause for the smart Pages
//         const selectQuery = `SELECT ${columns.join(', ')} FROM ${table} WHERE SmartPagesId = ?`;
//         // Execute the SELECT query with the SmartPages parameter
//         const result = await connection.query(selectQuery, [SmartPagesId]);
//         const data = result[0]; // Assuming the data is in the first element of the result array
//         connection.release();
//         res.status(200).json(data);
//     } catch (error) {
//         console.error('Error retrieving data from MySQL:', error);
//         res.status(500).json({ error: 'Error retrieving data' });
//     }
// });

app.get('/api/getFilterKeyTitle', async (req, res) => {
    try {
        // Extract the table name and title from the query parameters
        const { table, Title } = req.query;
        if (!table || !Title) {
            return res.status(400).json({ error: 'Table name and Title are required' });
        }
        const connection = await dbPool.getConnection();
        // Retrieve column names from the specified table
        const columnsResult = await connection.query(`SHOW COLUMNS FROM ${table}`);
        const columns = columnsResult[0].map(column => column.Field);
        // Use the column names to build the SELECT query with a WHERE clause for the title
        const selectQuery = `SELECT ${columns.join(', ')} FROM ${table} WHERE KeyTitle = ?`;
        // Execute the SELECT query with the Title parameter
        const result = await connection.query(selectQuery, [Title]);
        const data = result[0]; // Assuming the data is in the first element of the result array
        connection.release();
        res.status(200).json(data);
    } catch (error) {
        console.error('Error retrieving data from MySQL:', error);
        res.status(500).json({ error: 'Error retrieving data' });
    }
});

app.delete('/api/deleteData', async (req, res) => {
    try {
        const { data: itemsToDelete, tableName } = req.body; // Assuming req.body is an array of item IDs
        const connection = await dbPool.getConnection();
        for (const idToDelete of itemsToDelete) {
            await connection.query(`DELETE FROM ${tableName} WHERE id=?`, [idToDelete]);
        }
        connection.release();
        res.status(200).json({ message: 'Data deleted successfully' });
    } catch (error) {
        console.error('Error deleting data in MySQL:', error);
        res.status(500).json({ error: 'Error deleting data' });
    }
});


//------------IdBaseFilter------------------//
app.get('/api/getDataFilterId', async (req, res) => {
    try {
        // Extract the table name and title from the query parameters
        const { table, id } = req.query;
        if (!table || !id) {
            return res.status(400).json({ error: 'Table name and id are required' });
        }
        const connection = await dbPool.getConnection();
        // Retrieve column names from the specified table
        const columnsResult = await connection.query(`SHOW COLUMNS FROM ${table}`);
        const columns = columnsResult[0].map(column => column.Field);
        // Use the column names to build the SELECT query with a WHERE clause for the id
        const selectQuery = `SELECT ${columns.join(', ')} FROM ${table} WHERE id = ?`;
        // Execute the SELECT query with the id parameter
        const result = await connection.query(selectQuery, [id]);
        const data = result[0]; // Assuming the data is in the first element of the result array
        connection.release();
        res.status(200).json(data);
    } catch (error) {
        console.error('Error retrieving data from MySQL:', error);
        res.status(500).json({ error: 'Error retrieving data' });
    }
});

// app.post('/upload', upload.single('image'), async (req, res) => {
//     const { filename } = req.file;
//     const imagePath = `uploads/${filename}`;
//     const connection = await dbPool.getConnection();
//     const sql = 'INSERT INTO images (image_path) VALUES (?)';
//     connection.query(sql, [imagePath], (err, result) => {
//       if (err) {
//         console.error('Error uploading image:', err);
//         res.status(500).json({ error: 'Failed to upload image' });
//       } else {
//         console.log('Image uploaded successfully');
//         res.status(200).json({ message: 'Image uploaded successfully' });
//       }
//     });
//   });/


const fs = require('fs');

// app.post('/upload', upload.single('image'), async (req, res) => {
//     try {
//         const originalName = req.file.originalname; // Get the original filename
//         const imagePath = req.file.path; // Path to the uploaded image

//         // Read the image file
//         const imageBuffer = fs.readFileSync(imagePath);

//         // Insert the image data into the database
//         const connection = await dbPool.getConnection();
//         const sql = 'INSERT INTO images (data, imageName) VALUES (?, ?)';
//         connection.query(sql, [imageBuffer, originalName], (err, result) => {
//             if (err) {
//                 console.error('Error uploading image:', err);
//                 res.status(500).json({ error: 'Failed to upload image' });
//             } else {
//                 console.log('Image uploaded successfully');
//                 res.status(200).json({ message: 'Image uploaded successfully' });
//             }
//         });

//         // Remove the temporary file
//         fs.unlinkSync(imagePath);
//     } catch (error) {
//         console.error('Error uploading image:', error);
//         res.status(500).json({ error: 'Failed to upload image' });
//     }
// });

app.post('/upload', upload.array('image', 200), async (req, res) => {
    try {
        const files = req.files; // Get the array of files

        // Process each uploaded file
        for (const file of files) {
            const originalName = file.originalname; // Get the original filename
            const imagePath = file.path; // Path to the uploaded image

            // Read the image file
            const imageBuffer = fs.readFileSync(imagePath);

            // Insert the image data into the database
            const connection = await dbPool.getConnection();
            const sql = 'INSERT INTO images (data, imageName) VALUES (?, ?)';
            connection.query(sql, [imageBuffer, originalName], (err, result) => {
                if (err) {
                    console.error('Error uploading image:', err);
                    res.status(500).json({ error: 'Failed to upload image' });
                } else {
                    console.log('Image uploaded successfully');
                }
                connection.release();
            });

            // Remove the temporary file
            fs.unlinkSync(imagePath);
        }

        res.status(200).json({ message: 'Images uploaded successfully' });
    } catch (error) {
        console.error('Error uploading images:', error);
        res.status(500).json({ error: 'Failed to upload images' });
    }
});


// app.get('/images', async (req, res) => {
//     try {
//         // Retrieve all image records from the database
//         const connection = await dbPool.getConnection();
//         const sql = 'SELECT id, data,imageName FROM images';
//         const [rows, fields] = await connection.execute(sql);
//         connection.release();

//         // If there are no image records, return an empty response
//         if (rows.length === 0) {
//             return res.status(404).send('No images found');
//         }

//         // Create an array to store image objects
//         const imageArray = [];

//         // Loop through each image record
//         rows.forEach(row => {
//             try {
//                 // Convert the BLOB data into a Base64 string
//                 const imageBase64 = row.data.toString('base64');

//                 // Create an object for each image record
//                 const imageObject = {
//                     id: row.id,
//                     data: 'data:image/png;base64,' + imageBase64,
//                     imageName: row.imageName
//                 };

//                 // Push the object to the array
//                 imageArray.push(imageObject);
//             } catch (conversionError) {
//                 console.error('Error converting image data:', conversionError);
//                 res.status(500).send('Internal Server Error');
//             }
//         });

//         // Send the array of image objects as JSON response
//         res.json(imageArray);
//     } catch (error) {
//         console.error('Error fetching images:', error);
//         res.status(500).send('Internal Server Error');
//     }
// });

app.get('/images', async (req, res) => {
    try {
        // Retrieve image records from the database with pagination
        const { page = 1, perPage = 10 } = req.query;
        const offset = (page - 1) * perPage;

        const connection = await dbPool.getConnection();
        const sql = 'SELECT id, data, imageName FROM images LIMIT ? OFFSET ?';
        const [rows] = await connection.execute(sql, [parseInt(perPage), parseInt(offset)]);
        connection.release();

        // If there are no image records, return a 404 response
        if (rows.length === 0) {
            return res.status(404).send('No images found');
        }

        // Map rows to image objects asynchronously
        const imageArray = await Promise.all(rows.map(async (row) => {
            try {
                // Convert the BLOB data into a Base64 string asynchronously
                const imageBase64 = row.data.toString('base64');

                // Create an object for each image record
                return {
                    id: row.id,
                    data: 'data:image/png;base64,' + imageBase64,
                    imageName: row.imageName
                };
            } catch (conversionError) {
                console.error('Error converting image data:', conversionError);
                // Return a placeholder image object
                return {
                    id: row.id,
                    data: null,
                    imageName: row.imageName
                };
            }
        }));

        // Send the array of image objects as JSON response
        res.json(imageArray);
    } catch (error) {
        console.error('Error fetching images:', error);
        res.status(500).send('Internal Server Error');
    }
});


// app.post('/upload', upload.single('image'), async (req, res) => {
//     try {
//         const originalName = req.file.originalname; // Get the original filename
//         const folderName = path.dirname(req.file.path); // Dynamically fetch folder name
//         const imagePath = `${folderName}/${originalName}`; // Concatenate folder name with filename

//         // Insert the original filename and imagePath into the database
//         const connection = await dbPool.getConnection();
//         const sql = 'INSERT INTO images (image_path) VALUES (?)';
//         connection.query(sql, [imagePath], (err, result) => {
//             if (err) {
//                 console.error('Error uploading image:', err);
//                 res.status(500).json({ error: 'Failed to upload image' });
//             } else {
//                 console.log('Image uploaded successfully');
//                 res.status(200).json({ message: 'Image uploaded successfully' });
//             }
//         });
//     } catch (error) {
//         console.error('Error uploading image:', error);
//         res.status(500).json({ error: 'Failed to upload image' });
//     }
// });

  
//   app.get('/images', async (req, res) => {
//     try {
//       const connection = await dbPool.getConnection();
//       const [results, fields] = await connection.query('SELECT image_path FROM images');
//       const imagePaths = results.map(result => result.image_path);
//       res.status(200).json({ images: imagePaths });
//     } catch (error) {
//       console.error('Error retrieving images:', error);
//       res.status(500).json({ error: 'Failed to retrieve images' });
//     }
//   });
  app.post('/api/formData', async (req, res) => {
    try {
        // Extract data from request body
        const { data, tableName } = req.body;
        const { Country, Occupation, GrueneWeltweitInterested, Name, Email } = data;

        // SQL query to insert data into specified table
        const sql = `INSERT INTO ${tableName} (Country, Occupation, GrueneWeltweitInterested, Name, Email) 
                     VALUES (?, ?, ?, ?, ?)`;
        const values = [Country, Occupation, GrueneWeltweitInterested, Name, Email];
        
        // Get a connection from the pool
        const connection = await dbPool.getConnection();
        
        // Execute the SQL query and wait for it to complete
        await connection.query(sql, values);

        // Release the connection back to the pool
        connection.release();

        console.log('Data inserted successfully');
        // Send the response back to the client
        return res.status(200).json({ message: 'Data inserted successfully' });
    } catch (error) {
        console.error('Error inserting data:', error);
        // If an error occurs, send an error response back to the client
        return res.status(500).json({ message: 'Error inserting data' });
    }
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

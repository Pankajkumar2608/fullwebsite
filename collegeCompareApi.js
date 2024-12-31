import express from 'express';
import cors from 'cors';
import pkg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pkg;
dotenv.config();
const app = express();

app.use(cors({
    origin: ["https://www.motivationkaksha.com", "https://motivationkaksha.com"],
    credentials: true
}));

app.use(express.json());

const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.DB_PORT,
    ssl: true 
});

app.post('/colleges', async (req, res) => {
    const { collegeName1, collegeName2 } = req.body;

    const college1Query = `SELECT * FROM colleges WHERE name = $1`;
    const college2Query = `SELECT * FROM colleges WHERE name = $1`;

    try {
        
        const [college1Result, college2Result] = await Promise.all([
            pool.query(college1Query, [collegeName1]),
            pool.query(college2Query, [collegeName2])
        ]);

        const college1Data = college1Result.rows[0] || null; 
        const college2Data = college2Result.rows[0] || null;

        res.status(200).json({ college1: college1Data, college2: college2Data });
    } catch (err) {
        console.error('Database Query Error:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});

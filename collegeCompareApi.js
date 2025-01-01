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

    // Input validation
    if (!collegeName1 && !collegeName2) {
        return res.status(400).json({ error: 'At least one college name is required' });
    }

    const collegeQuery = `
        SELECT "College Type", "Location", "NIRF Rank", 
               "Highest Package (LPA)", "Average Package (LPA)", 
               "Placement Rate (%)", "Facilities", "Reddit Review"
        FROM college_review 
        WHERE "College Name" = $1
        
    `;

    try {
        let college1Data = null;
        let college2Data = null;

        if (collegeName1) {
            const college1Result = await pool.query(collegeQuery, [collegeName1]);
            college1Data = college1Result.rows[0];
        }

        if (collegeName2) {
            const college2Result = await pool.query(collegeQuery, [collegeName2]);
            college2Data = college2Result.rows[0];
        }

        res.status(200).json({ 
            college1: college1Data, 
            college2: college2Data 
        });
    } catch (err) {
        console.error('Database Query Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});

// server.js
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config(); // Load environment variables from .env file

// --- Configuration ---
const PORT = process.env.PORT || 3001;
const TABLE_NAME = "csab_final"; // !!! IMPORTANT: Change this if your table name is different !!!

// --- Database Connection ---
const pool = new Pool({
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  port: 5432, // Default PostgreSQL port
  ssl: {
    require: true, // Neon requires SSL
  },
});

pool.on('connect', () => {
  console.log('Connected to the Database via Pool');
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle database client', err);
  process.exit(-1); // Exit if DB connection has critical error
});

// --- Express App Setup ---
const app = express();

// --- Middleware ---
// Enable CORS - Adjust origin for production
app.use(cors({
  origin: process.env.FRONTEND_URL || '*' // Allow all origins in dev, specific in prod
}));

// Parse JSON request bodies
app.use(express.json());

// --- Helper Functions ---

// Calculates the lower margin for rank filtering (same as frontend logic)
function calculateLowerMargin(userRank) {
    if (userRank === null || isNaN(userRank) || userRank < 1) return 0;
    if (userRank <= 10000) return 1500;
    if (userRank <= 20000) return 2500;
    if (userRank <= 30000) return 3200;
    if (userRank <= 40000) return 3900;
    if (userRank <= 50000) return 4500;
    if (userRank <= 60000) return 5000;
    if (userRank <= 70000) return 5500;
    if (userRank <= 80000) return 6000;
    if (userRank <= 90000) return 8500;
    if (userRank <= 100000) return 10500;
    if (userRank <= 150000) return 12500;
    if (userRank <= 210000) return 20000;
    return 30000;
}

// Safely attempts to convert a VARCHAR rank column to INTEGER in SQL
// Strips non-numeric characters first. Returns NULL if conversion fails or input is just non-digits.
function safeRankToIntSQL(columnName) {
    // Use double quotes for column name with spaces/case sensitivity
    return `NULLIF(regexp_replace("${columnName}", '[^0-9]', '', 'g'), '')::integer`;
}


// --- API Routes ---

// 1. GET /api/options - Fetch distinct values for dropdowns
app.get('/api/options', async (req, res) => {
    const types = req.query.types ? req.query.types.split(',') : [];
    const optionsData = {};
    // Map frontend type names to *quoted* DB column names
    const validTypes = {
        years: '"Year"', // Quoted because it might clash with SQL keyword YEAR
        rounds: '"Round"',
        quotas: '"Quota"',
        seatTypes: '"Seat Type"',
        genders: '"Gender"',
        institutes: '"Institute"',
        programs: '"Academic Program Name"'
    };

    try {
        const client = await pool.connect(); // Get client from pool
        try {
            const promises = types.map(async (type) => {
                const columnName = validTypes[type];
                if (!columnName) return; // Ignore invalid types

                // Query for distinct, non-null, non-empty values, ordered
                // Use quoted column name here
                const queryText = `SELECT DISTINCT ${columnName} FROM "${TABLE_NAME}" WHERE ${columnName} IS NOT NULL AND ${columnName}::text <> '' ORDER BY ${columnName} ASC`;
                const result = await client.query(queryText);
                optionsData[type] = result.rows.map(row => row[Object.keys(row)[0]]); // Get value dynamically

                // Special sorting for year (descending numeric)
                if (type === 'years') {
                    optionsData[type].sort((a, b) => parseInt(b, 10) - parseInt(a, 10));
                }
                 // Special sorting for round (ascending numeric) - already handled by ORDER BY generally
                 if (type === 'rounds') {
                    optionsData[type].sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
                }
            });

            await Promise.all(promises);
            res.json(optionsData);
        } finally {
            client.release(); // Release client back to pool
        }
    } catch (err) {
        console.error("Error fetching dropdown options:", err);
        res.status(500).json({ message: "Error fetching filter options." });
    }
});

// 2. GET /api/colleges - Fetch filtered, sorted, paginated college data
app.get('/api/colleges', async (req, res) => {
    const {
        rank, seatType, year, round, quota, gender, institute, program,
        page = 1, limit = 25, fetchAll = 'false'
    } = req.query;

    // --- Validation ---
    if (!seatType) {
        return res.status(400).json({ message: "Seat Type (Category) is required." });
    }
    const userRank = rank ? parseInt(rank, 10) : null;
    if (rank && (isNaN(userRank) || userRank < 1)) {
        return res.status(400).json({ message: "Invalid Rank provided." });
    }
    const currentPage = parseInt(page, 10) || 1;
    const itemsPerPage = parseInt(limit, 10) || 25;
    const offset = (currentPage - 1) * itemsPerPage;
    const shouldFetchAll = fetchAll === 'true';

    // --- Build SQL Query Dynamically ---
    let queryParams = [];
    let paramIndex = 1;
    // Use quoted identifiers for table and column names
    let baseSelect = `SELECT "Institute", "Academic Program Name" as program_name, "Quota", "Seat Type" as seat_type, "Gender", "Opening Rank" as opening_rank, "Closing Rank" as closing_rank, "Year", "Round" FROM "${TABLE_NAME}"`;
    let countSelect = `SELECT COUNT(*) FROM "${TABLE_NAME}"`;
    let whereClauses = [];

    // Mandatory Seat Type filter
    whereClauses.push(`"Seat Type" = $${paramIndex++}`);
    queryParams.push(seatType);

    // Optional Filters (using quoted column names)
    if (year) { whereClauses.push(`"Year" = $${paramIndex++}`); queryParams.push(parseInt(year, 10)); }
    if (round) { whereClauses.push(`"Round" = $${paramIndex++}`); queryParams.push(parseInt(round, 10)); }
    if (quota) { whereClauses.push(`"Quota" = $${paramIndex++}`); queryParams.push(quota); }
    if (gender) { whereClauses.push(`"Gender" = $${paramIndex++}`); queryParams.push(gender); }
    if (institute) { whereClauses.push(`"Institute" = $${paramIndex++}`); queryParams.push(institute); }
    if (program) {
        // Use ILIKE for case-insensitive partial match
        whereClauses.push(`"Academic Program Name" ILIKE $${paramIndex++}`);
        queryParams.push(`%${program}%`);
    }

    // Rank Filtering Logic (Apply only if rank provided AND specific institute NOT selected)
    const specificInstituteSelected = !!institute;
    if (userRank && !specificInstituteSelected) {
        const lowerMargin = calculateLowerMargin(userRank);
        const minAllowedRank = Math.max(1, userRank - lowerMargin);

        // Compare using the safely converted integer rank
        whereClauses.push(`${safeRankToIntSQL("Closing Rank")} >= $${paramIndex++}`);
        queryParams.push(minAllowedRank);
    }

    // Combine WHERE clauses
    let whereString = "";
    if (whereClauses.length > 0) {
        whereString = ` WHERE ${whereClauses.join(" AND ")}`;
    }

    // Define Sorting (using quoted column names)
    let orderByClauses = [
        `"Year" DESC`,
        `"Round" DESC`,
        `"Institute" ASC`,
        `"Academic Program Name" ASC`
    ];
    let sortParamsCount = 0; // Count parameters added specifically for sorting

    // Add rank closeness sorting if applicable
    if (userRank && !specificInstituteSelected) {
        // Use ABS(safely_converted_rank - user_rank)
        // Insert at the beginning for primary sort after year (or adjust position as needed)
        orderByClauses.splice(1, 0, `ABS(${safeRankToIntSQL("Closing Rank")} - $${paramIndex++}) ASC NULLS LAST`); // Added NULLS LAST
        queryParams.push(userRank);
        sortParamsCount++;
    }
    let orderByString = ` ORDER BY ${orderByClauses.join(", ")}`;

    // --- Execute Queries ---
    try {
        const client = await pool.connect();
        try {
            let totalCount = 0;

            // Get total count (only if pagination is needed)
            if (!shouldFetchAll) {
                // Exclude sort-specific parameters from the count query parameters
                const countParams = queryParams.slice(0, queryParams.length - sortParamsCount);
                const countResult = await client.query(countSelect + whereString, countParams);
                totalCount = parseInt(countResult.rows[0].count, 10);
            }

            // Add LIMIT and OFFSET for pagination unless fetching all
            let finalQuery = baseSelect + whereString + orderByString;
            if (!shouldFetchAll) {
                finalQuery += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
                queryParams.push(itemsPerPage);
                queryParams.push(offset);
            }

            // Fetch the actual results
            const resultData = await client.query(finalQuery, queryParams);
            const results = resultData.rows.map(row => ({
                // Generate a unique ID for the frontend if DB doesn't have one
                // This is crucial for the 'saved' functionality and keys in lists
                id: `${row.Institute}-${row.program_name}-${row.Quota}-${row.seat_type}-${row.Gender}-${row.Year}-${row.Round}`.toLowerCase().replace(/[^a-z0-9\-_]/g, "-").replace(/-+/g,'-').replace(/^-+|-+$/g, ''),
                ...row // Include all other selected fields
            }));


            // If fetching all, set totalCount based on results length after fetching
            if (shouldFetchAll) {
                totalCount = results.length;
            }

             // --- Send Response ---
             res.json({
                results: results, // Array of college data objects
                totalCount: totalCount,
                currentPage: shouldFetchAll ? 1 : currentPage,
                totalPages: shouldFetchAll ? 1 : Math.ceil(totalCount / itemsPerPage),
            });

        } finally {
            client.release(); // Release client back to pool
        }
    } catch (err) {
        console.error("Database Query Error in /api/colleges:", err);
        console.error("Query Params:", queryParams); // Log params on error
        res.status(500).json({ message: "Error fetching college data." });
    }
});

// 3. GET /api/trends - Fetch historical rank data for a specific combination
app.get('/api/trends', async (req, res) => {
    const { institute, program, quota, seatType, gender, round } = req.query;

    // Basic validation
    if (!institute || !program || !quota || !seatType || !gender || !round) {
        return res.status(400).json({ message: "Missing required parameters for trend data." });
    }

    // Use quoted identifiers
    const queryText = `
        SELECT "Year" as year, "Opening Rank" as opening_rank, "Closing Rank" as closing_rank
        FROM "${TABLE_NAME}"
        WHERE "Institute" = $1
          AND "Academic Program Name" = $2
          AND "Quota" = $3
          AND "Seat Type" = $4
          AND "Gender" = $5
          AND "Round" = $6
        ORDER BY "Year" ASC
    `;
    const queryParams = [institute, program, quota, seatType, gender, parseInt(round, 10)];

    try {
        const client = await pool.connect();
        try {
            const result = await client.query(queryText, queryParams);
            res.json(result.rows); // Send array of {year, opening_rank, closing_rank}
        } finally {
            client.release();
        }
    } catch (err) {
        console.error("Error fetching trend data:", err);
        res.status(500).json({ message: "Error fetching trend data." });
    }
});


// --- Basic Root Route ---
app.get('/', (req, res) => {
  res.send('College Predictor API is running!');
});

// --- Global Error Handler ---
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack || err);
  res.status(500).json({ message: err.message || 'Something went wrong on the server!' });
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`Connecting to DB: ${process.env.PGHOST}/${process.env.PGDATABASE}`);
});
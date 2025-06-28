const express = require('express');
const mssql = require('mssql');
const path = require('path');
const app = express();

// Serve static files from "public" folder
app.use(express.static('public'));
app.use(express.json()); // To parse JSON body

const config = {
    user: 'iqac',
    password: 'Bpsmvedp@123',
    server: 'P3NWPLSK12SQL-v08.shr.prod.phx3.secureserver.net',
    database: 'edp02',
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

// Serve the HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint to trigger the API call
app.post('/trigger-api', async (req, res) => {
    try {
        const pool = await mssql.connect(config);
        const result = await pool.request().query('SELECT * FROM examservice');
        
        const apiResult = await apicall(result.recordset);
        res.status(200).json(apiResult); // send API response back to browser
    } catch (err) {
        console.error('Error triggering API:', err);
        res.status(500).json({ error: "Failed to call API", details: err.message });
    }
});

async function apicall(data) {
    console.log("Calling external API...");
    try {
        const response = await fetch("https://ws.edisha.gov.in/API/Values/SaralBulkUpload", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        

        const result = await response.json();
        console.log("API Success:", result);
        return result; // ✅ return the result
    } catch (error) {
        console.error("API Error:", error);
        return { error: error.message }; // return error object
    }
}


app.listen(5000, () => {
    console.log('Server is listening at port 5000...');
});

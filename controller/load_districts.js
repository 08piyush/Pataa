const {Client} = require("pg");
const fs = require("fs");

// Create a PostgreSQL client
const client = new Client({
    host: "localhost",
    port: "5432",
    user: "postgres",
    password: "user@123",
    database: "pataaDB"
});

// Connect to the database
client.connect();

// Read the GeoJSON file
fs.readFile("./ULB_City_Boundary_MP_01.geojson", "utf8", (error, data) => {
    if (error) {
        console.error("Error:", error);
        client.end(); // Disconnect from the database in case of an error
        return;
    }
    // Parse the JSON data
    const geoJSONData = JSON.parse(data);
    // Loop through each feature
    for (const feature of geoJSONData.features) {
        const dist_nm = feature.properties.dist_nm;
        const state_nm = feature.properties.state_nm;
        const ulb_nm_e = feature.properties.ulb_nm_e;
        const geometry = feature.geometry;

        // Prepare the SQL statement with a parameter
        const query = "INSERT INTO districts (dist_nm, state_nm, ulb_nm_e, geom) VALUES ($2, $3, $4, ST_GeomFromGeoJSON($1))";
        const values = [JSON.stringify(geometry), dist_nm, state_nm, ulb_nm_e];

        // Execute the prepared statement
        client.query(query, values, (err, result) => {
            if (err) {
                console.error("Error inserting data:", err);
            } else {
                console.log("Data inserted successfully");
            }
            // Check if all queries have completed
            if (feature === geoJSONData.features[geoJSONData.features.length - 1]) { // Disconnect from the database
                client.end();
            }
        });
    }
});

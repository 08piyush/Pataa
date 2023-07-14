const {pool} = require("../config/dbconnection");


//  QUERY TO GET LOCATION FROM LATITUDE AND LONGITUDES 
async function getFromLL(long, lat) {
    const que = {  text: "SELECT id, dist_nm, state_nm, ulb_nm_e FROM DISTRICTS WHERE ST_INTERSECTS(GEOM,ST_GEOMFROMTEXT('POINT(  " + long + "  " + lat + "  )',4326)) " };
    try {
        return await pool.query(que);
    } catch (err) {
        console.log("error in query parse : ");
        throw err;
    }
}

//  QUERY TO MARK THE POINTS INSIDE OUTSIDE OF A REGION (INDORE HERE)
async function insideOut(values) {
    const que = { text: "WITH input_points AS (  SELECT *  FROM (VALUES"   + values +  ") AS coordinates (longitude, latitude) ), polygon AS (  SELECT geom  FROM districts WHERE ulb_nm_e = 'Indore') SELECT  input_points.longitude,  input_points.latitude, CASE    WHEN ST_Contains(polygon.geom, ST_SetSRID(ST_MakePoint(input_points.longitude, input_points.latitude), 4326)) THEN 'inside' ELSE 'outside' END AS location FROM input_points, polygon" };
    try {
        return await pool.query(que);
    } catch (err) {
        throw err;
    }
}

//  QUERY TO FETCH THE BOUNDARY OF DISTRICT 
async function fetchBoundary() {
    const que = { text: "select st_asGeoJson(geom) from districts where ulb_nm_e = 'Indore' "  };
      try {
        return await pool.query(que);
    } catch (err) {
        throw err;
    }   
}

// QUERY TO FETCH THE CENTROID OF DISTRICT 
async function fetchCentroid() {
    const que = { text: "SELECT st_centroid(ST_Envelope(ST_Collect(geom))) AS centroid FROM districts WHERE ULB_NM_E = 'Indore' "  };
      try {
        return await pool.query(que);
    } catch (err) {
        throw err;
    }   
} 

module.exports = {
    getFromLL,
    insideOut,
    fetchBoundary,
    fetchCentroid
};
// EOL

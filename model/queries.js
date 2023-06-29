const {pool} = require("../config/dbconnection");

async function getFromLL(long, lat) {
    const que = {  text: "SELECT id, dist_nm, state_nm, ulb_nm_e FROM DISTRICTS WHERE ST_INTERSECTS(GEOM,ST_GEOMFROMTEXT('POINT(  " + long + "  " + lat + "  )',4326)) " };
    try {
        return await pool.query(que);
    } catch (err) {
        console.log("error in query parse : ");
        throw err;
    }
}

async function insideOut() {
    const que = { text: "WITH input_points AS (  SELECT *  FROM (VALUES     (75.911951, 22.735507), (75.830495, 22.688106),    (75.844119, 22.734721),    (75.833455, 22.727647),    (75.969456, 22.721861),    (75.860012, 22.653182),    (75.767340, 22.711918),    (75.776472, 22.663233)  ) AS coordinates (longitude, latitude) ), polygon AS (  SELECT geom  FROM districts WHERE ulb_nm_e = 'Indore') SELECT  input_points.longitude,  input_points.latitude, CASE    WHEN ST_Contains(polygon.geom, ST_SetSRID(ST_MakePoint(input_points.longitude, input_points.latitude), 4326)) THEN 'inside' ELSE 'outside' END AS location FROM input_points, polygon" };
    try {
        return await pool.query(que);
    } catch (err) {
        throw err;
    }
}

module.exports = {
    getFromLL,
    insideOut
};
// EOL

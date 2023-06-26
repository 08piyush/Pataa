const {pool} = require("../config/dbconnection");

async function getFromLL(long, lat) {
    console.log("values query side : ", long, lat);
    const que = {
        text: "SELECT id, dist_nm, state_nm, ulb_nm_e FROM DISTRICTS WHERE ST_INTERSECTS(GEOM,ST_GEOMFROMTEXT('POINT(  " + long + "  " + lat + "  )',4326)) ",
    };
    console.log("query : ", que);
    try {
        return await pool.query(que);
    } catch (err) {
        console.log("error in query parse : ");
        throw err;
    }
}

module.exports = {
    getFromLL
};
// EOL

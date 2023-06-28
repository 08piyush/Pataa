SELECT *
FROM DISTRICTS
ORDER BY ID ;

SELECT * FROM DISTRICTS WHERE ST_INTERSECTS(GEOM,ST_GEOMFROMTEXT('POINT(74.58060774 21.66470211 )',4326));


-- -- query to get the boundary (as a line string ) 
SELECT * from (select st_Astext(ST_Boundary(ST_Collect(geom))) AS boundary FROM districts )AS subquery WHERE ST_INTERSECTS(st_geomfromtext((boundary),4326),ST_GEOMFROMTEXT('POINT(75.774 22.36797846)',4326));

--convex hull is different from boundary , boundary is more accurate estima

-- query to check if geomatry is valid 
select st_IsValid(ST_Collect(geom))  from districts; 



SELECT
  MAX(ST_X(point_geom)) AS max_x,
  MAX(ST_Y(point_geom)) AS max_y
FROM
(
  SELECT (ST_DumpPoints(ST_ExteriorRing(geom))).geom AS point_geom
  FROM districts
) AS subquery;

select  max(geom ) from districts; 

select ulb_nm_e from districts group by ulb_nm_e; 

SELECT max(ST_AsText(geom)) FROM districts;

SELECT ST_AsText(geom) FROM districts order by geom ;

SELECT  max(ST_AsText(geom)) AS boundary FROM districts;

SELECT ST_AsText(ST_ExteriorRing(ST_GeometryN(geom, 1))) AS boundary FROM districts;


SELECT ST_AsText(ST_Envelope(ST_Collect(geom))) AS boundary
FROM districts;   

SELECT ST_AsText(ST_ConvexHull(ST_Collect(geom))) AS boundary
FROM districts;

 SELECT *
 FROM districts
 WHERE ST_Intersects(geom, ST_GeomFromText('POINT(75.12107991 23.65194819)', 4326));


SELECT *
FROM DISTRICTS
ORDER BY ID ;

-- query to locate a point in multipolygons(districts) 
SELECT * FROM DISTRICTS WHERE ST_INTERSECTS(GEOM,ST_GEOMFROMTEXT('POINT(82.73918712 21.22609228  )',4326));


--query to locate a point in boundary(state) 
SELECT * FROM (SELECT ST_AsText(ST_ConvexHull(ST_Collect(geom))) AS boundary FROM districts ) AS subquery WHERE ST_INTERSECTS(st_geomfromtext((boundary),4326),ST_GEOMFROMTEXT('POINT(75.774 22.36797846)',4326));


-- query to get the boundary (convex hull)
SELECT ST_AsText(ST_ConvexHull(ST_Collect(geom))) AS boundary FROM districts ;

-- query to get the maximum and minimum latitudes and longitudes of a boundary 
select 
ST_XMax(ST_ExteriorRing(boundary)) as maxLong ,
ST_XMin(ST_ExteriorRing(boundary)) as minLong ,
ST_YMax(ST_ExteriorRing(boundary)) as maxLat ,
ST_YMin(ST_ExteriorRing(boundary)) as minLat 
from 
(select ST_AsText(ST_ConvexHull(ST_Collect(geom))) as boundary
from districts) as subquery;

-- this query returns the multipolygon with largest area 
SELECT ST_AsText(geom) AS multipolygon
FROM districts
ORDER BY ST_Area(geom) DESC
LIMIT 1;

-- this query returns all hte unique ulbs 
select ulb_nm_e from districts group by ulb_nm_e; 

-- this query envelopes the group of multipolygons into a big region (not minimum)
SELECT ST_AsText(ST_Envelope(ST_Collect(geom))) AS boundary FROM districts;   

-- this query counts the number of points in the polygon 
select ST_Numpoints("POLYGON((76.24227131 21.22609228,76.23978908 21.22649702,74.58060774 21.66470211,74.31864287 22.29700295,74.32000149 22.5390629,74.32002113 22.53917385,74.75764626 24.56937563,74.75769298 24.56954168,C24.57047372,74.83457905 24.6444253,75.28439141 24.98627275,77.45410315 26.37276979,78.22422047 26.71683983,78.90401558 26.65677461,78.90512897 26.65658306,81.73506065 25.04978904,82.10894531 24.80311441,82.11066616 24.80191192,82.73153584 24.20706073,82.73242573 24.20515883,82.73254124 24.20490291,82.73795722 24.18938672,82.73918712 24.18560392,82.73915018 24.1847136,82.73902029 24.18166413,82.73900067 24.18140777,82.72704362 24.1350074,82.71017744 24.08113262,81.77137581 22.66501673,81.75707049 22.64594773,81.7563852 22.64511968,80.55506452 21.49187851,80.54449551 21.48703564,80.54373771 21.48684544,80.54291754 21.48672895,80.52486804 21.48502106,76.24227131 21.22609228"))) as num ;
 
-- ST_PointN(g, n) function returns point in a geom g at an index n. 

-- st_geomfromtext()  and st_astext() functions are used to convert geo into text and text as geo (very useful )
 
-- ST_NumPoints(geom)  counts the number of points in geomatry geom. 


-- query to check which mutlipolygons intersect 
	SELECT t1.id, t2.id
FROM districts t1, districts t2
WHERE t1.id <> t2.id -- Exclude self-comparisons if needed
  AND ST_Intersects(t1.geom, t2.geom);
-- alternative 
  -- select * from ( 
	SELECT t1.id, t2.id,  st_astext(ST_Intersection(t1.geom, t2.geom)),(ST_Intersection(t1.geom, t2.geom)) 
FROM districts t1, districts t2
WHERE t1.id <> t2.id -- Exclude self-comparisons if needed
  AND ST_Intersects(t1.geom, t2.geom);
--  ) as subquery where common_coordinates != 'POLYGON EMPTY' ;
-- Exclude self-comparisons if needed
--   select * from districts where ulb_nm_e = 'Bhopal' or ulb_nm_e='Mandideep' ;


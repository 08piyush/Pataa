CREATE EXTENSION fuzzystrmatch;

drop table pataa_fts_details;
create table pataa_fts_details as 
select 
	pu.pataa_user_id,p.pataa_id,
	pu.first_name,pu.last_name,
	p.pataa_code,p.property_name,
	cn.country_name,st.state_name,ct.city_name,p.zipcode,
	p.address1,p.address2,p.address3,p.address4,
	p.lati,p.lngi,
	fts_tsvector(concat_ws(' ',coalesce(pu.first_name,'') ,
	coalesce(pu.last_name,'') ,
	coalesce(p.pataa_code,'') ,
	coalesce(p.property_name,'') ,
	coalesce(cn.country_name,'') ,
	coalesce(st.state_name,'') ,
	coalesce(ct.city_name,'') ,
	coalesce(p.zipcode,'') ,
	coalesce(p.address1,'') ,
	coalesce(p.address2,'') ,
	coalesce(p.address3,'') ,
	coalesce(p.address4,'') , 
	coalesce(p.lati||'','') , 
	coalesce(p.lngi||'',''))) as pataa_vector 
from pataa as p left join pataa_user as pu on pu.pataa_user_id = p.pataa_user_id left join countries as cn on cn.country_id = p.country_id left join states as st on st.state_id = p.state_id left join cities as ct on ct.city_id = p.city_id limit 1000 offset 100000;

alter table pataa_fts_details add pataa_fts_details_id serial primary key;

CREATE INDEX pataa_fts_details_pataa_vector ON pataa_fts_details USING gin(pataa_vector);
analyze pataa_fts_details;

CREATE OR REPLACE FUNCTION fts_tsvector(text text) RETURNS tsvector AS
  $BODY$
  BEGIN
      RETURN (select to_tsvector('simple', text));
  END;
  $BODY$
  IMMUTABLE
  language plpgsql;

select first_name||' '||last_name as name,pataa_code,address1||' '||address2||' '||address3||' '||address4 as address,country_name,state_name,city_name,lati||','||lngi as geo_location from pataa_fts_details where 
fts_tsvector(pataa_vector) @@ (phraseto_tsquery('simple', 'ponj')::text || ':*')::tsquery

-- Query Case: PANKAJ
-- Using soundex 
select * from pataa_fts_details where soundex(first_name) = soundex('PNKAS');

-- Using Levenshtein , fuzzymatch 
select * from pataa_fts_details where levenshtein(first_name,'PNKAS');

-- Mixing tsvector
select first_name||' '||last_name as name,pataa_code,address1||' '||address2||' '||address3||' '||address4 as address,country_name,state_name,city_name,lati||','||lngi as geo_location from pataa_fts_details where 
fts_tsvector(pataa_vector) @@ (phraseto_tsquery('simple', 'punj')::text || ':*')::tsquery; -- working

select first_name||' '||last_name as name,pataa_code,address1||' '||address2||' '||address3||' '||address4 as address,country_name,state_name,city_name,lati||','||lngi as geo_location from pataa_fts_details where 
fts_tsvector(pataa_vector) @@ (phraseto_tsquery('simple', 'ponj')::text || ':*')::tsquery; -- no result

select * from pataa_fts_details where levenshtein(state_name,'ponj') <=3; -- working Punjab

select first_name||' '||last_name as name,pataa_code,address1||' '||address2||' '||address3||' '||address4 as address,country_name,state_name,city_name,lati||','||lngi as geo_location from pataa_fts_details where 
levenshtein(first_name, 'ponj') <=3 or levenshtein(last_name, 'ponj') <=3 or levenshtein(address1, 'ponj') <=3 or levenshtein(address2, 'ponj') <=3 or levenshtein(address3, 'ponj') <=3 or levenshtein(address4, 'ponj') <= 3; -- working but could be slow



-- Final alogo
-- fetch matching results based on tsvector impl first
-- if no result then use fuzzymatch on first pataa_code and then address fields 
-- if no result go to google geocode api 





--------------------------------------------- WORKING ILOHCNAP -------------------------------------------------------

--- searching a tsquery in a tsvector // working 

SELECT FIRST_NAME || ' ' || LAST_NAME AS NAME,
	PATAA_CODE,
	ADDRESS1 || ' ' || ADDRESS2 || ' ' || ADDRESS3 || ' ' || ADDRESS4 AS ADDRESS,
	COUNTRY_NAME,
	STATE_NAME,
	CITY_NAME,
	LATI || ',' || LNGI AS GEO_LOCATION
FROM PATAA_FTS_DETAILS
WHERE PATAA_VECTOR @@ (PHRASETO_TSQUERY('simple','punj')::text || ':*')::TSQUERY;


--- doing same process with tsquery 'ponj' but showing no results 

SELECT FIRST_NAME || ' ' || LAST_NAME AS NAME,
	PATAA_CODE,
	ADDRESS1 || ' ' || ADDRESS2 || ' ' || ADDRESS3 || ' ' || ADDRESS4 AS ADDRESS,
	COUNTRY_NAME,
	STATE_NAME,
	CITY_NAME,
	LATI || ',' || LNGI AS GEO_LOCATION
FROM PATAA_FTS_DETAILS
WHERE PATAA_VECTOR @@ (PHRASETO_TSQUERY('simple','ponj')::text || ':*')::TSQUERY;


--- NOW USING FUZZY MATCH EXTENSION  
--- levenshtein distance is edit distance only just with a different name 
--- other algorithms are hamming distance (binary forms of ascii values of differring letters in strings )
--- and Damerau-lavenshtein algorithm which taken another operation at transposition which is interchanging the character positions 
--- though the cost of this operation is also 1 

SELECT * FROM PATAA_FTS_DETAILS WHERE LEVENSHTEIN(STATE_NAME,'Punj') <= 2;


--- using lavenshtein on name and state 
SELECT * FROM PATAA_FTS_DETAILS WHERE (LEVENSHTEIN(first_name,'Mohm') <= 3) and (LEVENSHTEIN(state_name,'Punj') <= 2) ;

--- using soundex 

SELECT * FROM PATAA_FTS_DETAILS WHERE SOUNDEX(FIRST_NAME) = SOUNDEX('MHND');

--- 
SELECT FIRST_NAME || ' ' || LAST_NAME AS NAME,
	PATAA_CODE,
	ADDRESS1 || ' ' || ADDRESS2 || ' ' || ADDRESS3 || ' ' || ADDRESS4 AS ADDRESS,
	COUNTRY_NAME,
	STATE_NAME,
	CITY_NAME,
	LATI || ',' || LNGI AS GEO_LOCATION
FROM PATAA_FTS_DETAILS
WHERE  (LEVENSHTEIN(first_name,'Mohm') <= 3) and (LEVENSHTEIN(state_name,'Punj') <= 2) ;


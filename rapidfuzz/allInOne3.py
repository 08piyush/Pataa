import json
from rapidfuzz import fuzz
import psycopg2
import sys

sys.stdout.reconfigure(encoding='utf-8')

# FUNCTION TO BE CALLED WHICH DOES SEARCHING IN THE DATABASE 

def allInOne3(keyword, encoding='utf-8'):
    #  SETTING UP CONNECTION WITH DATABASE
    connection = psycopg2.connect(
        user="ec2-user",
        host="localhost",
        database="pataaDB",
        password="user@123",
        port="5432"
    )
    cursor = connection.cursor()


    #  WHICH QUERY DOES WHAT ? 
    
    #  QUERY1 searching in TSVECTOR 
    #  QUERY2 searching with pataa_code till LEVENSHTIEN<=3 
    #  QUERY3 searching only if the keyword is DIGIT 
    #  QUERY4 searching only in records where value is non-numeric e.g. polace , nagar, house 45,---
    #  --- 566ADF. / non-examples : 456, 12 etc. , now combined with query5 and metaphone
    #  QUERY5 searching for the values greater than the length of string in address2 and address3   
    #  QUERY6 searching in complete data (maybe removed for large databases)
    
    
    #  ALL THE QUERIES --
    base_query = "SELECT FIRST_NAME || ' ' || LAST_NAME AS NAME, PATAA_CODE, zipcode, address1, address2, address3, address4, COUNTRY_NAME, STATE_NAME, CITY_NAME, LATI || ',' || LNGI AS GEO_LOCATION FROM PATAA_FTS_DETAILS "    
    query1 = base_query +  "WHERE PATAA_VECTOR @@ (PHRASETO_TSQUERY('simple', '{0}' )::text || ':*')::TSQUERY".format(keyword)
    query2 = base_query +  "WHERE LEVENSHTEIN(pataa_code , '{0}' ) <= 3".format(keyword)
    query3 = base_query +  "WHERE pataa_code LIKE '%{0}%' OR zipcode LIKE '%{0}%' OR address1 LIKE '%{0}%' OR address2 LIKE '%{0}%'".format(keyword)
    query4 = base_query +  "WHERE (address1 ~ '^[^0-9]+$' and LEVENSHTEIN(address1, '{0}') <= 3) or (address2 ~ '^[^0-9]+$' and LEVENSHTEIN(address2, '{0}') <= 3) or (address3 ~ '^[^0-9]+$' and LEVENSHTEIN(address3, '{0}') <= 3) or LEVENSHTEIN(address4, '{0}') <= 3 or LEVENSHTEIN(state_name, '{0}') <= 3 or LEVENSHTEIN(city_name, '{0}') <= 3 or LEVENSHTEIN(country_name, '{0}') <= 3 or metaphone(state_name, 3) = metaphone('{0}', 3) or metaphone(address1, 3) = metaphone('{0}', 3) or metaphone(address2, 3) = metaphone('{0}', 3) or metaphone(address3, 3) = metaphone('{0}', 3) or metaphone(address4, 3) = metaphone('{0}', 3) or (LENGTH(address2) >= LENGTH('{0}')+8 OR (address3 ~ '^[^0-9]+$' and LENGTH(address3) >= LENGTH('{0}')+8 ) OR LENGTH(city_name) >= LENGTH('{0}'))".format(keyword)
    query5 = base_query +  "WHERE (LEVENSHTEIN(address1, '{0}') <= 3) or (LEVENSHTEIN(address2, '{0}') <= 3) or (LEVENSHTEIN(address3, '{0}') <= 3) or LEVENSHTEIN(address4, '{0}') <= 3 or LEVENSHTEIN(state_name, '{0}') <= 3 or LEVENSHTEIN(city_name, '{0}') <= 3 or LEVENSHTEIN(country_name, '{0}') <= 3 or metaphone(state_name, 3) = metaphone('{0}', 3) or metaphone(address1, 3) = metaphone('{0}', 3) or metaphone(address2, 3) = metaphone('{0}', 3) or metaphone(address3, 3) = metaphone('{0}', 3) or metaphone(address4, 3) = metaphone('{0}', 3) or (LENGTH(address2) >= LENGTH('{0}')+8 OR (LENGTH(address3) >= LENGTH('{0}')+8 ) OR LENGTH(city_name) >= LENGTH('{0}'))".format(keyword)





    # SEARCHING ALGORITHM 

    if keyword:  
    #  SEARCH IN TSVECTOR 
        cursor.execute(query1)             
        rows = cursor.fetchall()
        if(len(rows) > 0):
            return json.dumps(showData(rows))
        else: 


        #  SEARCH IN PATAA CODE 
            cursor.execute(query2) 
            rows = cursor.fetchall()
            if(len(rows) > 0):
                    return json.dumps(showData(rows))
            else: 


            #  SEARCH IF KEYWORD IS NUMERIC
                if  keyword.isdigit():   
                    cursor.execute(query3) 
                    rows = cursor.fetchall()
                    if(len(rows) > 0):
                        return json.dumps(showData(rows))
                    

            #  SEARCH IF KEYWORD IS NON-NUMERIC
                elif not any(char.isdigit() for char in keyword):     
                    cursor.execute(query4)                            
                    rows = cursor.fetchall()
                    if(len(rows) > 0):
                        return json.dumps(showData(rows))
                else:


                # SEARCH ON FUZZYMATCH-METAPHONE
                    cursor.execute(query5) 
                    rows = cursor.fetchall()
                    if(len(rows) > 0):
                        return json.dumps(showData(rows))
                    else:
                    #     cursor.execute(query6) 
                    #     rows = cursor.fetchall()
                    #     if(len(rows) > 0):
                    #         return json.dumps(showData(rows))
                    #     else: 
                            return None 



        # SEARCH IS DONE NOW CLOSING THE CONNECTION  
        cursor.close()
        connection.close()
    else : 
        return "why spaces ??"





#  CALCULATE MATCHING SCORE OF EVERY RECORD WITH GIVEN KEYWORD 
def calculate_score(keyword, row):
    scores = []
    for value in row:
        if isinstance(value, str):
            terms = [term.strip() for term in value.split() if term.strip()]
            scores.extend([fuzz.token_set_ratio(keyword, term) for term in terms])
    return max(scores) if scores else 0



#  DISPLAY DATA AFTER SORTING ON BASIS OF MATCHING SCORES 
def showData(rows):
    best_records = []
    for row in rows:
        score = calculate_score(keyword, row)
        if score > 0:
            record = {
                "name": row[0],
                "pataa_code": row[1],
                "zipcode": row[2],
                "address": row[3]+" "+row[4]+" "+row[5],
                "country_name": row[7],
                "state_name": row[8],
                "city_name": row[9],
                "geo_location": row[10],
                "Score": score
            }
            best_records.append(record)

    if best_records:
        best_records = sorted(best_records, key=lambda x: x["Score"], reverse=True)
        return best_records[:150]
        # return best_records
    else:
        return None




# RETRIEVE THE KEYWORD FROM CLI ARGUMENTS
strr = ""
for i in range (1 , len(sys.argv)):
     strr += sys.argv[i] 
keyword = str(strr)
result = allInOne3(keyword)
print(json.dumps(result))


# RELEASE ALL THE DATA FROM SHELL MEMORY 
sys.stdout.flush()  

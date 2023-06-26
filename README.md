# Pataa
Optimal dynamic Search application which in real-time shows the most relevant addresses from the database of Indian localities on the basis of user input keyword | Clone of google maps search bar- on providing the latitude and longitude values it extracts out the districts to which those coordinates belong.


Model : 
It contains all the SQL queries used to extract the data from Postgres. 

Views : 
It contains HTML, CSS, and EJS files of front-end pages. 

Rapidfuzz : 
It contains a Python script to stimulate the Rapidfuzz library for optimal and efficient search, it also operates Postgres Queries for primary layer filtration of data using the FuzzyStrMatch extension.

functions.js : 
This file contains API plugins, which eventually operate various programmed functions.

load_districts.js : 
This file fetches data from a .geojson file and dumps it into a table in Postgres. 









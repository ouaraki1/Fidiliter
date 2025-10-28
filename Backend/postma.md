 

 # superadmin 

post  http://localhost:5000/api/auth/register-superadmin

 1- 

{
    "name":"abdelkhalek",
    "email":"abdelkhalek@gmail.com",
    "number":"0648430026",
    "password":"123456789"
}

{
    "message": "SuperAdmin created successfully",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZmViODhiZmRhOGIxYzQyNzliN2Y3MyIsInJvbGUiOiJzdXBlcmFkbWluIiwiaWF0IjoxNzYxNTIzODUxLCJleHAiOjE3NjIxMjg2NTF9.LxyWn3ZPKAg50KRGGlf9q2D93cVjVvXcyxPt7Et6fnA",
    "userId": "68feb88bfda8b1c4279b7f73"
}
-------------
2-

{
    "name":"oussama",
    "email":"oussama@gmail.com",
    "number":"0987654",
    "password":"123456789"
}

{
    "message": "SuperAdmin created successfully",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZmViOTQzZmRhOGIxYzQyNzliN2Y3ZiIsInJvbGUiOiJzdXBlcmFkbWluIiwiaWF0IjoxNzYxNTI0MDM1LCJleHAiOjE3NjIxMjg4MzV9.cKDT9VwylCKCLLY1GBnRiOrzsh6uO_h8UHy2zkWtm4w",
    "userId": "68feb943fda8b1c4279b7f7f"
}
------------
3-
.................




# create admin  done :
post http://localhost:5000/api/superadmin/create-admin

{
    "name":"saad",
    "store":"antali",
    "number":"098765",
    "email":"antali@gmail.com",
    "city":"rabat",
    "password": "123456789"
}

{
    "admin": {
        "role": "admin",
        "name": "saad",
        "number": "098765",
        "email": "antali@gmail.com",
        "city": "rabat",
        "password": "$2a$10$q5GWf9rAW7gcKNUShZCD1uwAG9SA2BMVPqYQbF5imYj2Vn1gglgLy",
        "store": "antali",
        "disabled": false,
        "pending": false,
        "_id": "68fec01f79cea7f00ea0b22e",
        "createdAt": "2025-10-27T00:43:11.345Z",
        "updatedAt": "2025-10-27T00:43:11.345Z",
        "__v": 0
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZmVjMDFmNzljZWE3ZjAwZWEwYjIyZSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2MTUyNTc5MSwiZXhwIjoxNzYyMTMwNTkxfQ.6AcnEisJ8EeFRLpTkP7Bif_2SuAb7YqGbZzeeho-zho"
}
------------------------
{
    "name":"youness",
    "store":"homsi",
    "number":"87654",
    "email":"homsi@gmail.com",
    "city":"rabat",
    "password": "123456789"
}

{
    "admin": {
        "role": "admin",
        "name": "youness",
        "number": "87654",
        "email": "homsi@gmail.com",
        "city": "rabat",
        "password": "$2a$10$Afk9MItq7tnNGvfpshxj0eHTumCh.s1r9YIiJbO8wLvMFj6P3hz/W",
        "store": "homsi",
        "disabled": false,
        "pending": false,
        "_id": "68fec05279cea7f00ea0b232",
        "createdAt": "2025-10-27T00:44:02.637Z",
        "updatedAt": "2025-10-27T00:44:02.637Z",
        "__v": 0
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZmVjMDUyNzljZWE3ZjAwZWEwYjIzMiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2MTUyNTg0MiwiZXhwIjoxNzYyMTMwNjQyfQ.5IXfSBRPi4HViw1x606fAO-uOnuJFspQo_jzyn7_iz8"
}
--------------------------



# edite admin   done
# delet admin   done



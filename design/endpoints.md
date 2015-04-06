# REST endpoints

assume web context = irods-cloud-backend, this can vary based on the war file you deploy

Login/Logout

## Login user
_URL_ irods-cloud-backend/login
_Method_ POST

### Parameters

host
port
authType [STANDARD, PAM]
userName 
password
zone

### Response (JSON)

  {
    "zone" : "tempZone",
    "userName" : "rods",
    "defaultStorageResource" : "",
    "serverVersion" : "rods4.0.3"
  }

# REST endpoints

assume web context = irods-cloud-backend, this can vary based on the war file you deploy

# User Actions

## Login user
**URL** irods-cloud-backend/login<br>
**Method** POST

### Parameters

* host
* port
* authType [STANDARD, PAM]
* userName 
* password
* zone

### Response (JSON)

  {
    "zone" : "tempZone",
    "userName" : "rods",
    "defaultStorageResource" : "",
    "serverVersion" : "rods4.0.3"
  }
  
# Virtual Collections
  
  
## List default virtual collections for logged in user
**URL** irods-cloud-backend/virtualCollection<br>
**Method** GET

### Parameters

### Response (JSON)

 

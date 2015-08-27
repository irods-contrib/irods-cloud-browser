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


# Config Actions

## Get initial config (basic properties of back end server config)
**URL** irods-cloud-backend/initialConfig
**Method** GET

### Parameters
n/a

### Response (JSON)

{"loginPresetEnabled":true,"presetAuthScheme":"STANDARD","presetHost":"localhost","presetPort":1247,"presetZone":"tempZone"}

  
# Virtual Collections
  
  
## List default virtual collections for logged in user
**URL** irods-cloud-backend/virtualCollection<br>
**Method** GET

### Parameters

### Response (JSON)

  [{"class":"org.irods.jargon.vircoll.types.CollectionBasedVirtualCollection","description":"iRODS Collection at a given   path","i18Description":"virtual.collection.default.description","i18Name":"virtual.collection.default.name","i18icon":"virtual.collection.default.icon","pagingStyle":{"enumType":"org.irods.jargon.core.query.PagingAwareCollectionListing$PagingStyle","name":"SPLIT_COLLECTIONS_AND_FILES"},"parameters":{},"rootPath":"/","uniqueName":"root"},{"class":"org.irods.jargon.vircoll.types.CollectionBasedVirtualCollection","description":"iRODS Collection at a given path","i18Description":"virtual.collection.default.description","i18Name":"virtual.collection.default.name","i18icon":"virtual.collection.default.icon","pagingStyle":{"enumType":"org.irods.jargon.core.query.PagingAwareCollectionListing$PagingStyle","name":"SPLIT_COLLECTIONS_AND_FILES"},"parameters":{},"rootPath":"/test1/home/test1","uniqueName":"home"},{"class":"org.irods.jargon.vircoll.types.StarredFoldersVirtualCollection","description":"Files and folders marked as starred in iRODS","i18Description":"virtual.collection.description.starred","i18Name":"virtual.collection.name.starred","i18icon":"virtual.collection.icon.starred","pagingStyle":{"enumType":"org.irods.jargon.core.query.PagingAwareCollectionListing$PagingStyle","name":"CONTINUOUS"},"parameters":{},"uniqueName":"Starred Files"}]
  
  
## Get details about a particular virtual collection by name
**URL** irods-cloud-backend/virtualCollection/_vcName as URL Encoded String_<br>
**Method** GET

### Parameters

### Response (JSON)
  
  {"class":"org.irods.jargon.vircoll.types.CollectionBasedVirtualCollection","description":"iRODS Collection at a given path","i18Description":"virtual.collection.default.description","i18Name":"virtual.collection.default.name","i18icon":"virtual.collection.default.icon","pagingStyle":{"enumType":"org.irods.jargon.core.query.PagingAwareCollectionListing$PagingStyle","name":"SPLIT_COLLECTIONS_AND_FILES"},"parameters":{},"rootPath":"/test1/home/test1","uniqueName":"home"}
 
## List contents of a virtual collection
**URL** irods-cloud-backend/collection/_vcName as URL Encoded String_<br>
**Method** GET

### Parameters

path=subpath if needed


### Response (JSON)
 {"class":"org.irods.jargon.core.query.PagingAwareCollectionListing","collectionAndDataObjectListingEntries":[{"class":"org.irods.jargon.core.query.CollectionAndDataObjectListingEntry","collection":true,"count":2,"createdAt":"2014-09-02T12:01:22Z","dataObject":false,"dataSize":0,"description":"","displayDataSize":"0 B","formattedAbsolutePath":"/test1","id":10000,"lastResult":true,"modifiedAt":"2014-09-02T12:01:22Z","nodeLabelDisplayValue":"test1","objectType":{"enumType":"org.irods.jargon.core.query.CollectionAndDataObjectListingEntry$ObjectType","name":"COLLECTION"},"ownerName":"rodsBoot","ownerZone":"test1","parentPath":"/","pathOrName":"/test1","specColType":{"enumType":"org.irods.jargon.core.pub.domain.ObjStat$SpecColType","name":"NORMAL"},"specialObjectPath":"","totalRecords":2,"userFilePermission":[]}],"pagingAwareCollectionListingDescriptor":{"class":"org.irods.jargon.core.query.PagingAwareCollectionListingDescriptor","collectionsComplete":true,"count":2,"dataObjectsComplete":true,"dataObjectsCount":0,"dataObjectsOffset":0,"dataObjectsTotalRecords":0,"objStat":null,"offset":0,"pageSizeUtilized":5000,"pagingStyle":null,"parentAbsolutePath":"/","pathComponents":[],"totalRecords":2}}
 
# File and Collection details

## Get data profile for a particular file or collection

**URL** irods-cloud-backend/file

**Method** GET

### Parameters
path=absolute path

### Response (JSON)
 
  {"acls":[{"class":"org.irods.jargon.core.pub.domain.UserFilePermission","filePermissionEnum":{"enumType":"org.irods.jargon.core.protovalues.FilePermissionEnum","name":"OWN"},"nameWithZone":"test1#fedZone1","userId":"10012","userName":"test1","userType":{"enumType":"org.irods.jargon.core.protovalues.UserTypeEnum","name":"RODS_ADMIN"},"userZone":"fedZone1"}],"childName":"metadata avu.tiff","class":"org.irods.jargon.dataprofile.DataProfile","domainObject":{"absolutePath":"/fedZone1/home/test1/testing/hive screen caps/metadata avu.tiff","checksum":"sha2:692IQlC7jMnbkJ0pTcKMezBGst9YezDW3SAEFwDqv9M=","class":"org.irods.jargon.core.pub.domain.DataObject","collectionId":28033,"collectionName":"/fedZone1/home/test1/testing/hive screen caps","comments":"","count":1,"createdAt":"2015-04-18T05:06:48Z","dataMapId":0,"dataName":"metadata avu.tiff","dataOwnerName":"test1","dataOwnerZone":"fedZone1","dataPath":"/var/lib/irods/Vault1/home/test1/testing/hive screen caps/metadata avu.tiff","dataReplicationNumber":0,"dataSize":140832,"dataStatus":"","dataTypeName":"generic","dataVersion":0,"displayDataSize":"137 KB","expiry":"","id":28036,"lastResult":true,"objectPath":"","replicationStatus":"1","resourceGroupName":"test1-resc","resourceName":"test1-resc","specColType":{"enumType":"org.irods.jargon.core.pub.domain.ObjStat$SpecColType","name":"NORMAL"},"totalRecords":0,"updatedAt":"2015-04-18T05:06:48Z"},"file":true,"irodsTagValues":[],"metadata":[],"mimeType":"image/tiff","parentPath":"/fedZone1/home/test1/testing/hive screen caps","pathComponents":["","fedZone1","home","test1","testing","hive screen caps","metadata avu.tiff"],"shared":false,"starred":false}
  
  
  
# File Actions

## Upload a file

**URL** irods-cloud-backend/file

**Method** POST

### Parameters
_collectionParentName:_ path of parent collection in iRODS 

## Delete a file or list of files (data objects or collections)

**URL** irods-cloud-backend/file

**Method** Delete

### Parameters
_path:_ single path or array of paths
_force:_ true|false



## Create a new file or folder

**URL** irods-cloud-backend/file

**Method** PUT

### Parameters
_path:_ path of new file or folder
_collection:_ true|false, false if not provided, will create a new folder if true, a new file if false

### Response (JSON)

Will return a listing entry JSON object that reflects the new file or folder.  If the file or folder already exists, it will just return the entry

   {"class":"org.irods.jargon.core.query.CollectionAndDataObjectListingEntry","collection":false,"count":0,"createdAt":null,"dataObject":false,"dataSize":0,"description":"","displayDataSize":"0 B","formattedAbsolutePath":"/","id":0,"lastResult":false,"modifiedAt":null,"nodeLabelDisplayValue":"","objectType":null,"ownerName":"","ownerZone":"","parentPath":"","pathOrName":"","specColType":{"enumType":"org.irods.jargon.core.pub.domain.ObjStat$SpecColType","name":"NORMAL"},"specialObjectPath":"","totalRecords":0,"userFilePermission":[]}



## Rename file or folder

Renames a file to a new name in the same parent directory

**URL** irods-cloud-backend/rename

**Method** PUT

### Parameters
_path:_ path of new file or folder
_newName:_name of file under same path as parent of existing file

### Response (JSON)

Will return a listing entry JSON object that reflects the renamed file or folder.  

   {"class":"org.irods.jargon.core.query.CollectionAndDataObjectListingEntry","collection":false,"count":0,"createdAt":null,"dataObject":false,"dataSize":0,"description":"","displayDataSize":"0 B","formattedAbsolutePath":"/","id":0,"lastResult":false,"modifiedAt":null,"nodeLabelDisplayValue":"","objectType":null,"ownerName":"","ownerZone":"","parentPath":"","pathOrName":"","specColType":{"enumType":"org.irods.jargon.core.pub.domain.ObjStat$SpecColType","name":"NORMAL"},"specialObjectPath":"","totalRecords":0,"userFilePermission":[]}
   
   
   
  xxxx
  
  
## Copy a new file or folder

**URL** irods-cloud-backend/copy

**Method** POST

### Parameters
_sourcePath:_ path of file or folder to be copied
_targetPath_: path of the target to which the file or folder will be copied
_resource_: optional iRODS resource for the copy, may be omitted and will take default resource
_overwrite_: true|false, will default to false if not provided

### Response (JSON)

Will return a listing entry JSON object that reflects the target file or folder. 

   {"class":"org.irods.jargon.core.query.CollectionAndDataObjectListingEntry","collection":false,"count":0,"createdAt":null,"dataObject":false,"dataSize":0,"description":"","displayDataSize":"0 B","formattedAbsolutePath":"/","id":0,"lastResult":false,"modifiedAt":null,"nodeLabelDisplayValue":"","objectType":null,"ownerName":"","ownerZone":"","parentPath":"","pathOrName":"","specColType":{"enumType":"org.irods.jargon.core.pub.domain.ObjStat$SpecColType","name":"NORMAL"},"specialObjectPath":"","totalRecords":0,"userFilePermission":[]}

   
## Star a file 

Add a star tag to a file

**URL** irods-cloud-backend/star

**Method** PUT

### Parameters
_path:_ path of the file to star

### Response (JSON)

n/a

## Unstar a file 

Remove a star tag from a file

**URL** irods-cloud-backend/star

**Method** DELETE

### Parameters
_path:_ path of the file to unstar

### Response (JSON)

n/a

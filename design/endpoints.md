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

  [{"class":"org.irods.jargon.vircoll.types.CollectionBasedVirtualCollection","description":"iRODS Collection at a given   path","i18Description":"virtual.collection.default.description","i18Name":"virtual.collection.default.name","i18icon":"virtual.collection.default.icon","pagingStyle":{"enumType":"org.irods.jargon.core.query.PagingAwareCollectionListing$PagingStyle","name":"SPLIT_COLLECTIONS_AND_FILES"},"parameters":{},"rootPath":"/","uniqueName":"root"},{"class":"org.irods.jargon.vircoll.types.CollectionBasedVirtualCollection","description":"iRODS Collection at a given path","i18Description":"virtual.collection.default.description","i18Name":"virtual.collection.default.name","i18icon":"virtual.collection.default.icon","pagingStyle":{"enumType":"org.irods.jargon.core.query.PagingAwareCollectionListing$PagingStyle","name":"SPLIT_COLLECTIONS_AND_FILES"},"parameters":{},"rootPath":"/test1/home/test1","uniqueName":"home"},{"class":"org.irods.jargon.vircoll.types.StarredFoldersVirtualCollection","description":"Files and folders marked as starred in iRODS","i18Description":"virtual.collection.description.starred","i18Name":"virtual.collection.name.starred","i18icon":"virtual.collection.icon.starred","pagingStyle":{"enumType":"org.irods.jargon.core.query.PagingAwareCollectionListing$PagingStyle","name":"CONTINUOUS"},"parameters":{},"uniqueName":"Starred Files"}]
 
## List contents of a virtual collection
**URL** irods-cloud-backend/virtualCollection/_vcName as URL Encoded String_<br>
**Method** GET

### Parameters

path=subpath if needed


### Response (JSON)
 {"class":"org.irods.jargon.core.query.PagingAwareCollectionListing","collectionAndDataObjectListingEntries":[{"class":"org.irods.jargon.core.query.CollectionAndDataObjectListingEntry","collection":true,"count":2,"createdAt":"2014-09-02T12:01:22Z","dataObject":false,"dataSize":0,"description":"","displayDataSize":"0 B","formattedAbsolutePath":"/test1","id":10000,"lastResult":true,"modifiedAt":"2014-09-02T12:01:22Z","nodeLabelDisplayValue":"test1","objectType":{"enumType":"org.irods.jargon.core.query.CollectionAndDataObjectListingEntry$ObjectType","name":"COLLECTION"},"ownerName":"rodsBoot","ownerZone":"test1","parentPath":"/","pathOrName":"/test1","specColType":{"enumType":"org.irods.jargon.core.pub.domain.ObjStat$SpecColType","name":"NORMAL"},"specialObjectPath":"","totalRecords":2,"userFilePermission":[]}],"pagingAwareCollectionListingDescriptor":{"class":"org.irods.jargon.core.query.PagingAwareCollectionListingDescriptor","collectionsComplete":true,"count":2,"dataObjectsComplete":true,"dataObjectsCount":0,"dataObjectsOffset":0,"dataObjectsTotalRecords":0,"objStat":null,"offset":0,"pageSizeUtilized":5000,"pagingStyle":null,"parentAbsolutePath":"/","pathComponents":[],"totalRecords":2}}

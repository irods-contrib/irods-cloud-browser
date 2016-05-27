package org.irods.jargon.idrop.web.services

import static org.mockito.Mockito.*
import static org.mockito.Mockito.*
import grails.test.mixin.*

import org.irods.jargon.core.connection.IRODSAccount
import org.irods.jargon.core.packinstr.TransferOptions
import org.irods.jargon.core.pub.CollectionAO
import org.irods.jargon.core.pub.CollectionAndDataObjectListAndSearchAO
import org.irods.jargon.core.pub.DataObjectAO
import org.irods.jargon.core.pub.DataTransferOperations
import org.irods.jargon.core.pub.IRODSAccessObjectFactory
import org.irods.jargon.core.pub.domain.ObjStat
import org.irods.jargon.core.pub.io.IRODSFile
import org.irods.jargon.core.pub.io.IRODSFileFactory
import org.irods.jargon.core.pub.io.IRODSFileInputStream
import org.irods.jargon.core.query.CollectionAndDataObjectListingEntry
import org.irods.jargon.core.transfer.DefaultTransferControlBlock
import org.irods.jargon.core.transfer.TransferControlBlock
import org.irods.jargon.core.transfer.TransferStatusCallbackListener
import org.irods.jargon.datautils.filesampler.FileSamplerService
import org.irods.jargon.zipservice.api.*
import org.junit.*
import org.mockito.Mockito

import spock.lang.Specification


/**
 * See the API for {@link grails.test.mixin.services.ServiceUnitTestMixin} for usage instructions
 */
@TestFor(FileService)
class FileServiceSpec extends Specification {

	void "should get obj stat"() {
		given:
		IRODSAccount irodsAccount = IRODSAccount.instance("host", 1247, "user", "password", "", "zone", "")
		String uniqueName = "root"
		def irodsAccessObjectFactory = mockFor(IRODSAccessObjectFactory)

		ObjStat objStat = new ObjStat()

		def  listAndSearchAO = mockFor(CollectionAndDataObjectListAndSearchAO)
		listAndSearchAO.demand.retrieveObjectStatForPath{ absPath -> return objStat }

		def listAndSearchAOMock = listAndSearchAO.createMock()
		irodsAccessObjectFactory.demand.getCollectionAndDataObjectListAndSearchAO{ act -> return listAndSearchAOMock }

		def iafMock = irodsAccessObjectFactory.createMock()

		FileService fileService = new FileService()
		fileService.irodsAccessObjectFactory = iafMock


		when:

		def actual = fileService.retrieveObjStatForFile("blah", irodsAccount)

		then:

		actual != null
	}

	void "should retrieve object for a given path that is a collection"() {
		given:
		IRODSAccount irodsAccount = IRODSAccount.instance("host", 1247, "user", "password", "", "zone", "")
		String uniqueName = "root"
		def irodsAccessObjectFactory = mockFor(IRODSAccessObjectFactory)

		ObjStat objStat = new ObjStat()
		objStat.objectType = CollectionAndDataObjectListingEntry.ObjectType.COLLECTION

		def  listAndSearchAO = mockFor(CollectionAndDataObjectListAndSearchAO)
		listAndSearchAO.demand.retrieveObjectStatForPath{ absPath -> return objStat }

		org.irods.jargon.core.pub.domain.Collection collection = new org.irods.jargon.core.pub.domain.Collection()
		def  collectionAO = mockFor(CollectionAO)
		collectionAO.demand.findByAbsolutePath{ absPath -> return collection }
		def collectionAOMock = collectionAO.createMock()


		def listAndSearchAOMock = listAndSearchAO.createMock()
		irodsAccessObjectFactory.demand.getCollectionAndDataObjectListAndSearchAO{ act -> return listAndSearchAOMock }
		irodsAccessObjectFactory.demand.getCollectionAO{ act -> return collectionAOMock }


		def iafMock = irodsAccessObjectFactory.createMock()

		FileService fileService = new FileService()
		fileService.irodsAccessObjectFactory = iafMock

		when:

		def actual = fileService.retrieveCatalogInfoForPath("blah", irodsAccount)

		then:

		actual != null
		actual instanceof org.irods.jargon.core.pub.domain.Collection
	}

	void "should retrieve object for a given path that is a data object"() {
		given:
		IRODSAccount irodsAccount = IRODSAccount.instance("host", 1247, "user", "password", "", "zone", "")
		String uniqueName = "root"
		def irodsAccessObjectFactory = mockFor(IRODSAccessObjectFactory)

		ObjStat objStat = new ObjStat()
		objStat.objectType = CollectionAndDataObjectListingEntry.ObjectType.DATA_OBJECT

		def  listAndSearchAO = mockFor(CollectionAndDataObjectListAndSearchAO)
		listAndSearchAO.demand.retrieveObjectStatForPath{ absPath -> return objStat }

		org.irods.jargon.core.pub.domain.DataObject dataObject = new org.irods.jargon.core.pub.domain.DataObject()
		def  dataObjectAO = mockFor(DataObjectAO)
		dataObjectAO.demand.findByAbsolutePath{ absPath -> return dataObject }
		def dataObjectAOMock = dataObjectAO.createMock()


		def listAndSearchAOMock = listAndSearchAO.createMock()
		irodsAccessObjectFactory.demand.getCollectionAndDataObjectListAndSearchAO{ act -> return listAndSearchAOMock }
		irodsAccessObjectFactory.demand.getDataObjectAO{ act -> return dataObjectAOMock }


		def iafMock = irodsAccessObjectFactory.createMock()

		FileService fileService = new FileService()
		fileService.irodsAccessObjectFactory = iafMock

		when:

		def actual = fileService.retrieveCatalogInfoForPath("blah", irodsAccount)

		then:

		actual != null
		actual instanceof org.irods.jargon.core.pub.domain.DataObject
	}

	void "should build a single file download for a single path"() {

		given:
		IRODSAccount irodsAccount = IRODSAccount.instance("host", 1247, "user", "password", "", "zone", "")
		String path = "/a/path/file.txt"
		def irodsAccessObjectFactory = mockFor(IRODSAccessObjectFactory)

		def inputStream = mockFor(IRODSFileInputStream)
		def inputStreamMock = inputStream.createMock()

		def irodsFile = mockFor(IRODSFile)
		irodsFile.demand.exists{ -> return true }
		irodsFile.demand.canRead{ -> return true }
		irodsFile.demand.length{ -> return 100L }
		irodsFile.demand.getName{ -> "hello" }
		irodsFile.demand.getName{ -> "hello" }
		def irodsFileMock = irodsFile.createMock()

		def objStat = new ObjStat()
		objStat.objectType = CollectionAndDataObjectListingEntry.ObjectType.DATA_OBJECT

		def collectionAndDataObjectListAndSearchAO = mockFor(CollectionAndDataObjectListAndSearchAO)
		collectionAndDataObjectListAndSearchAO.demand.retrieveObjectStatForPath{ pth -> return objStat }
		def collectionAndDataObjectListAndSearchAOMock = collectionAndDataObjectListAndSearchAO.createMock()

		def irodsFileFactory = mockFor(IRODSFileFactory)
		irodsFileFactory.demand.instanceIRODSFileInputStream{ path1 -> return inputStreamMock }
		irodsFileFactory.demand.instanceIRODSFile{ path2 -> return irodsFileMock }
		def irodsFileFactoryMock = irodsFileFactory.createMock()
		irodsAccessObjectFactory.demand.getCollectionAndDataObjectListAndSearchAO{ acct3 -> return collectionAndDataObjectListAndSearchAOMock }

		irodsAccessObjectFactory.demand.getIRODSFileFactory{ acct1 -> return irodsFileFactoryMock }
		irodsAccessObjectFactory.demand.getIRODSFileFactory{ acct2 -> return irodsFileFactoryMock }
		def irodsAccessObjectFactoryMock = irodsAccessObjectFactory.createMock()

		def jargonServiceFactoryService = mockFor(JargonServiceFactoryService)

		def jargonZipService = mockFor(JargonZipService)
		def jargonZipServiceMock = jargonZipService.createMock()

		jargonServiceFactoryService.demand.instanceJargonZipService{ act -> return jargonZipServiceMock }
		def jargonServiceFactoryServiceMock = jargonServiceFactoryService.createMock()

		FileService fileService = new FileService()
		fileService.irodsAccessObjectFactory = irodsAccessObjectFactoryMock
		fileService.jargonServiceFactoryService = jargonServiceFactoryServiceMock

		when:

		def actual = fileService.obtainInputStreamForDownloadSingleFile(path, irodsAccount)

		then:

		actual != null
		actual instanceof DownloadFileSpecification
	}

	void "should build a multi download for multiple paths"() {

		given:

		IRODSAccount irodsAccount = IRODSAccount.instance("host", 1247, "user", "password", "", "zone", "")
		List<String> paths = new ArrayList<String>()
		paths.add("/a/path/file.txt")
		paths.add("/a/path/file2.txt")
		def inputStream = mockFor(IRODSFileInputStream)
		def inputStreamMock = inputStream.createMock()
		def irodsAccessObjectFactory = mockFor(IRODSAccessObjectFactory)
		def irodsAccessObjectFactoryMock = irodsAccessObjectFactory.createMock()
		def jargonServiceFactoryService = mockFor(JargonServiceFactoryService)
		def length = 100L
		def bundleName = "bundle.tar"

		def jargonZipService = mockFor(JargonZipService)

		def bundleStreamWrapper = new BundleStreamWrapper(inputStreamMock, length, bundleName)
		jargonZipService.demand.obtainBundleAsInputStreamWithAdditionalMetadataGivenPaths{ paths1 -> return bundleStreamWrapper }
		def jargonZipServiceMock = jargonZipService.createMock()

		jargonServiceFactoryService.demand.instanceJargonZipService{ act -> return jargonZipServiceMock }
		def jargonServiceFactoryServiceMock = jargonServiceFactoryService.createMock()
		FileService fileService = new FileService()
		fileService.irodsAccessObjectFactory = irodsAccessObjectFactoryMock
		fileService.jargonServiceFactoryService = jargonServiceFactoryServiceMock

		when:

		def actual = fileService.obtainInputStreamForDownloadMultipleFiles(paths, irodsAccount)

		then:

		actual != null
		actual instanceof DownloadFileSpecification
		actual.length == length
		actual.fileName == bundleName
		actual.inputStream != null
	}

	void "should delete two files"() {
		given:
		IRODSAccount irodsAccount = IRODSAccount.instance("host", 1247, "user", "password", "", "zone", "")
		def irodsAccessObjectFactory = mockFor(IRODSAccessObjectFactory)

		def path1 = "/a/path/1.txt"
		def path2 = "/a/path/2/subdir"

		def irodsFileFactory = mockFor(IRODSFileFactory)

		def irodsFile1 = mockFor(IRODSFile)
		irodsFile1.demand.delete{ -> return true }
		irodsFile1.demand.delete{ -> return true }
		def irodsFile1Mock = irodsFile1.createMock()


		irodsFileFactory.demand.instanceIRODSFile{ pathIn1 -> return irodsFile1Mock }
		irodsFileFactory.demand.instanceIRODSFile{ pathIn2 -> return irodsFile1Mock }

		def irodsFileFactoryMock = irodsFileFactory.createMock()

		irodsAccessObjectFactory.demand.getIRODSFileFactory{ act1 -> return irodsFileFactoryMock }
		def irodsAccessObjectFactoryMock = irodsAccessObjectFactory.createMock()

		FileService fileService = new FileService()
		fileService.irodsAccessObjectFactory = irodsAccessObjectFactoryMock

		List<String> paths = new ArrayList<String>()
		paths.add(path1)
		paths.add(path2)

		when:

		fileService.delete(paths, false, irodsAccount)

		then:
		1 == 1
	}

	void "should create new folder and return a listing entry"() {
		given:
		IRODSAccount irodsAccount = IRODSAccount.instance("host", 1247, "user", "password", "", "zone", "")
		def irodsAccessObjectFactory = mockFor(IRODSAccessObjectFactory)

		def path = "/a/path/dir"

		def irodsFileFactory = mockFor(IRODSFileFactory)

		def irodsFile1 = mockFor(IRODSFile)
		irodsFile1.demand.mkdir{ -> return true }
		def irodsFile1Mock = irodsFile1.createMock()

		irodsFileFactory.demand.instanceIRODSFile{ pathIn1 -> return irodsFile1Mock }
		def irodsFileFactoryMock = irodsFileFactory.createMock()

		irodsAccessObjectFactory.demand.getIRODSFileFactory{ act1 -> return irodsFileFactoryMock }
		def listingEntry = new CollectionAndDataObjectListingEntry()
		def collectionAO = mockFor(CollectionAO)
		collectionAO.demand.getListingEntryForAbsolutePath{ pth1 -> return listingEntry }
		def collectionAOMock = collectionAO.createMock()

		irodsAccessObjectFactory.demand.getCollectionAO{ ia1 -> return collectionAOMock }

		def irodsAccessObjectFactoryMock = irodsAccessObjectFactory.createMock()

		FileService fileService = new FileService()
		fileService.irodsAccessObjectFactory = irodsAccessObjectFactoryMock

		when:

		def actual = fileService.newFolder(path, irodsAccount)

		then:
		actual != null
	}

	void "should rename a file"() {
		given:
		IRODSAccount irodsAccount = IRODSAccount.instance("host", 1247, "user", "password", "", "zone", "")
		def irodsAccessObjectFactory = mockFor(IRODSAccessObjectFactory)

		def path = "/a/path/dir"
		def pathParent = "/a/path"
		def newName = "newname"

		def irodsFileFactory = mockFor(IRODSFileFactory)

		IRODSFile irodsFile1 = Mockito.mock(IRODSFile)
		Mockito.when(irodsFile1.getParent()).thenReturn(pathParent)

		IRODSFile irodsFile2 = Mockito.mock(IRODSFile)
		Mockito.when(irodsFile2.getAbsolutePath()).thenReturn(path)

		def irodsFileFactoryMock = Mockito.mock(IRODSFileFactory.class)
		Mockito.when(irodsFileFactoryMock.instanceIRODSFile(path)).thenReturn(irodsFile1)
		Mockito.when(irodsFileFactoryMock.instanceIRODSFile(pathParent, newName)).thenReturn(irodsFile2)
		//irodsFileFactory.demand.instanceIRODSFile(0..99){String path1 -> return irodsFile1Mock}


		def listingEntry = new CollectionAndDataObjectListingEntry()
		def collectionAO = mockFor(CollectionAO)
		collectionAO.demand.getListingEntryForAbsolutePath{pth1 -> return listingEntry}
		def collectionAOMock = collectionAO.createMock()

		def dataTransferOperations = mockFor(DataTransferOperations)
		dataTransferOperations.demand.rename{f1,f2->return void}
		def dataTransferOperationsMock = dataTransferOperations.createMock()

		irodsAccessObjectFactory.demand.getDataTransferOperations{ia2 -> return dataTransferOperationsMock}
		irodsAccessObjectFactory.demand.getIRODSFileFactory(0..999){act1 -> return irodsFileFactoryMock}

		irodsAccessObjectFactory.demand.getCollectionAO{ia1 -> return collectionAOMock}

		def irodsAccessObjectFactoryMock = irodsAccessObjectFactory.createMock()

		FileService fileService = new FileService()
		fileService.irodsAccessObjectFactory = irodsAccessObjectFactoryMock

		when:

		def actual = fileService.rename(path, newName, irodsAccount)

		then:
		actual != null
	}

	void "should copy a file"() {
		given:
		IRODSAccount irodsAccount = IRODSAccount.instance("host", 1247, "user", "password", "", "zone", "")
		def irodsAccessObjectFactory = mockFor(IRODSAccessObjectFactory)

		def sourcePath = "/a/path/dir"
		def targetPath = "/another/path"
		def overwrite = true
		def resource = ""


		def listingEntry = new CollectionAndDataObjectListingEntry()
		def collectionAO = mockFor(CollectionAO)
		collectionAO.demand.getListingEntryForAbsolutePath{pth1 -> return listingEntry}
		def collectionAOMock = collectionAO.createMock()



		TransferControlBlock transferControlBlock = DefaultTransferControlBlock.instance()
		def transferOptions = new TransferOptions()
		transferControlBlock.transferOptions = transferOptions
		def dataTransferOperations = Mockito.mock(DataTransferOperations.class)
		TransferStatusCallbackListener cl = Mockito.mock(TransferStatusCallbackListener.class)
		//Mockito.when(dataTransferOperations.copy(sourcePath, sourcePath, "", cl, transferControlBlock)).thenReturn(void)

		irodsAccessObjectFactory.demand.getDataTransferOperations{ia2 -> return dataTransferOperations}
		irodsAccessObjectFactory.demand.getCollectionAO{ia1 -> return collectionAOMock}
		irodsAccessObjectFactory.demand.getIRODSFileFactory(0..999){act1 -> return irodsFileFactoryMock}
		irodsAccessObjectFactory.demand.buildDefaultTransferControlBlockBasedOnJargonProperties{-> return transferControlBlock}

		def irodsAccessObjectFactoryMock = irodsAccessObjectFactory.createMock()

		FileService fileService = new FileService()
		fileService.irodsAccessObjectFactory = irodsAccessObjectFactoryMock

		when:

		def actual = fileService.copy(sourcePath, targetPath, resource, overwrite, irodsAccount)

		then:
		actual != null
	}

	void "should move a file from source to target"() {
		given:
		IRODSAccount irodsAccount = IRODSAccount.instance("host", 1247, "user", "password", "", "zone", "")
		def irodsAccessObjectFactory = mockFor(IRODSAccessObjectFactory)

		def sourcePath = "/a/path/dir"
		def targetPath = "/another/path"
		def overwrite = true
		def resource = ""

		def listingEntry = new CollectionAndDataObjectListingEntry()
		def collectionAO = mockFor(CollectionAO)
		collectionAO.demand.getListingEntryForAbsolutePath{pth1 -> return listingEntry}
		def collectionAOMock = collectionAO.createMock()

		TransferControlBlock transferControlBlock = DefaultTransferControlBlock.instance()
		def transferOptions = new TransferOptions()
		transferControlBlock.transferOptions = transferOptions
		def dataTransferOperations = Mockito.mock(DataTransferOperations.class)
		TransferStatusCallbackListener cl = Mockito.mock(TransferStatusCallbackListener.class)
		//Mockito.when(dataTransferOperations.copy(sourcePath, sourcePath, "", cl, transferControlBlock)).thenReturn(void)

		irodsAccessObjectFactory.demand.getDataTransferOperations{ia2 -> return dataTransferOperations}
		irodsAccessObjectFactory.demand.getCollectionAO{ia1 -> return collectionAOMock}
		irodsAccessObjectFactory.demand.getIRODSFileFactory(0..999){act1 -> return irodsFileFactoryMock}

		def irodsAccessObjectFactoryMock = irodsAccessObjectFactory.createMock()

		FileService fileService = new FileService()
		fileService.irodsAccessObjectFactory = irodsAccessObjectFactoryMock

		when:

		def actual = fileService.move(sourcePath, targetPath, resource, irodsAccount)

		then:
		Mockito.verify(dataTransferOperations).move(sourcePath, targetPath)

		actual != null
	}

	void "should phymove a file from source to target resource"() {
		given:
		IRODSAccount irodsAccount = IRODSAccount.instance("host", 1247, "user", "password", "", "zone", "")
		def irodsAccessObjectFactory = mockFor(IRODSAccessObjectFactory)

		def sourcePath = "/a/path/dir"
		def targetPath = ""
		def resource = "resc"

		def listingEntry = new CollectionAndDataObjectListingEntry()
		def collectionAO = mockFor(CollectionAO)
		collectionAO.demand.getListingEntryForAbsolutePath{pth1 -> return listingEntry}
		def collectionAOMock = collectionAO.createMock()

		TransferControlBlock transferControlBlock = DefaultTransferControlBlock.instance()
		def transferOptions = new TransferOptions()
		transferControlBlock.transferOptions = transferOptions
		def dataTransferOperations = Mockito.mock(DataTransferOperations.class)
		TransferStatusCallbackListener cl = Mockito.mock(TransferStatusCallbackListener.class)
		//Mockito.when(dataTransferOperations.copy(sourcePath, sourcePath, "", cl, transferControlBlock)).thenReturn(void)

		irodsAccessObjectFactory.demand.getDataTransferOperations{ia2 -> return dataTransferOperations}
		irodsAccessObjectFactory.demand.getCollectionAO{ia1 -> return collectionAOMock}
		irodsAccessObjectFactory.demand.getIRODSFileFactory(0..999){act1 -> return irodsFileFactoryMock}

		def irodsAccessObjectFactoryMock = irodsAccessObjectFactory.createMock()

		FileService fileService = new FileService()
		fileService.irodsAccessObjectFactory = irodsAccessObjectFactoryMock

		when:

		def actual = fileService.move(sourcePath, targetPath, resource, irodsAccount)

		then:
		Mockito.verify(dataTransferOperations).physicalMove(sourcePath, resource)

		actual != null
	}


	void "should create String from file"() {
		given:
		IRODSAccount irodsAccount = IRODSAccount.instance("host", 1247, "user", "password", "", "zone", "")
		def irodsAccessObjectFactory = mockFor(IRODSAccessObjectFactory)

		def sourcePath = "/a/path/file.txt"
		def retString = "xxx"

		def fileSamplerService = mockFor(FileSamplerService)
		fileSamplerService.demand.convertFileContentsToString{pth,sz -> return retString}
		def fileSamplerServiceMock = fileSamplerService.createMock()

		def jargonServiceFactoryService = mockFor(JargonServiceFactoryService)
		jargonServiceFactoryService.demand.instanceFileSamplerService{ia -> return fileSamplerServiceMock}
		def jargonServiceFactoryServiceMock = jargonServiceFactoryService.createMock()

		def irodsAccessObjectFactoryMock = irodsAccessObjectFactory.createMock()

		FileService fileService = new FileService()
		fileService.irodsAccessObjectFactory = irodsAccessObjectFactoryMock
		fileService.jargonServiceFactoryService = jargonServiceFactoryServiceMock

		when:

		def actual = fileService.stringFromFile(sourcePath, irodsAccount)

		then:


		actual != null
	}

	void "should push a string to a file"() {
		given:
		IRODSAccount irodsAccount = IRODSAccount.instance("host", 1247, "user", "password", "", "zone", "")
		def irodsAccessObjectFactory = mockFor(IRODSAccessObjectFactory)

		def sourcePath = "/a/path/file.txt"
		def data = "xxx"

		def fileSamplerService = mockFor(FileSamplerService)
		fileSamplerService.demand.saveStringToFile{pth,dt -> return void}
		def fileSamplerServiceMock = fileSamplerService.createMock()

		def jargonServiceFactoryService = mockFor(JargonServiceFactoryService)
		jargonServiceFactoryService.demand.instanceFileSamplerService{ia -> return fileSamplerServiceMock}
		def jargonServiceFactoryServiceMock = jargonServiceFactoryService.createMock()

		def irodsAccessObjectFactoryMock = irodsAccessObjectFactory.createMock()

		FileService fileService = new FileService()
		fileService.irodsAccessObjectFactory = irodsAccessObjectFactoryMock
		fileService.jargonServiceFactoryService = jargonServiceFactoryServiceMock

		when:

		fileService.stringToFile(data, sourcePath, irodsAccount)

		then:
		1 == 1
	}
}

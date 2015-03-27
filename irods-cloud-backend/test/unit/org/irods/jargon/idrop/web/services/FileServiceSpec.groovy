package org.irods.jargon.idrop.web.services



import grails.test.mixin.*

import org.irods.jargon.core.connection.IRODSAccount
import org.irods.jargon.core.pub.CollectionAO
import org.irods.jargon.core.pub.CollectionAndDataObjectListAndSearchAO
import org.irods.jargon.core.pub.DataObjectAO
import org.irods.jargon.core.pub.IRODSAccessObjectFactory
import org.irods.jargon.core.pub.domain.ObjStat
import org.irods.jargon.core.query.CollectionAndDataObjectListingEntry.ObjectType
import org.junit.*

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
		listAndSearchAO.demand.retrieveObjectStatForPath{absPath -> return objStat}

		def listAndSearchAOMock = listAndSearchAO.createMock()
		irodsAccessObjectFactory.demand.getCollectionAndDataObjectListAndSearchAO{act -> return listAndSearchAOMock}

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
		objStat.setObjectType(ObjectType.COLLECTION)

		def  listAndSearchAO = mockFor(CollectionAndDataObjectListAndSearchAO)
		listAndSearchAO.demand.retrieveObjectStatForPath{absPath -> return objStat}

		org.irods.jargon.core.pub.domain.Collection collection = new org.irods.jargon.core.pub.domain.Collection()
		def  collectionAO = mockFor(CollectionAO)
		collectionAO.demand.findByAbsolutePath{absPath -> return collection}
		def collectionAOMock = collectionAO.createMock()


		def listAndSearchAOMock = listAndSearchAO.createMock()
		irodsAccessObjectFactory.demand.getCollectionAndDataObjectListAndSearchAO{act -> return listAndSearchAOMock}
		irodsAccessObjectFactory.demand.getCollectionAO{act -> return collectionAOMock}


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
		objStat.setObjectType(ObjectType.DATA_OBJECT)

		def  listAndSearchAO = mockFor(CollectionAndDataObjectListAndSearchAO)
		listAndSearchAO.demand.retrieveObjectStatForPath{absPath -> return objStat}

		org.irods.jargon.core.pub.domain.DataObject dataObject = new org.irods.jargon.core.pub.domain.DataObject()
		def  dataObjectAO = mockFor(DataObjectAO)
		dataObjectAO.demand.findByAbsolutePath{absPath -> return dataObject}
		def dataObjectAOMock = dataObjectAO.createMock()


		def listAndSearchAOMock = listAndSearchAO.createMock()
		irodsAccessObjectFactory.demand.getCollectionAndDataObjectListAndSearchAO{act -> return listAndSearchAOMock}
		irodsAccessObjectFactory.demand.getDataObjectAO{act -> return dataObjectAOMock}


		def iafMock = irodsAccessObjectFactory.createMock()

		FileService fileService = new FileService()
		fileService.irodsAccessObjectFactory = iafMock

		when:

		def actual = fileService.retrieveCatalogInfoForPath("blah", irodsAccount)

		then:

		actual != null
		actual instanceof org.irods.jargon.core.pub.domain.DataObject
	}
}

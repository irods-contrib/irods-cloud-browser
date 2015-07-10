package org.irods.jargon.idrop.web.services

import grails.test.mixin.*

import org.irods.jargon.core.connection.IRODSAccount
import org.irods.jargon.core.pub.CollectionAO
import org.irods.jargon.core.pub.DataObjectAO
import org.irods.jargon.core.pub.IRODSAccessObjectFactory
import org.irods.jargon.core.pub.domain.AvuData
import org.irods.jargon.core.pub.domain.ObjStat
import org.irods.jargon.core.query.MetaDataAndDomainData
import org.irods.jargon.core.query.CollectionAndDataObjectListingEntry.ObjectType
import org.junit.*
import org.mockito.Mockito

import spock.lang.Specification

/**
 * See the API for {@link grails.test.mixin.services.ServiceUnitTestMixin} for usage instructions
 */
@TestFor(MetadataService)
class MetadataServiceSpec extends Specification {
	void "should list avus for a collection"() {
		given:
		IRODSAccount irodsAccount = IRODSAccount.instance("host", 1247, "user", "password", "", "zone", "")
		String absPath = "/an/abs/path"

		def irodsAccessObjectFactory = mockFor(IRODSAccessObjectFactory)

		def collectionAO = mockFor(CollectionAO)
		def dataObjectAO = mockFor(DataObjectAO)

		List<MetaDataAndDomainData> avus = new ArrayList<MetaDataAndDomainData>()

		def myObjStat =  Mockito.mock(ObjStat.class)
		Mockito.when(myObjStat.isSomeTypeOfCollection()).thenReturn(true)
		dataObjectAO.demand.getObjectStatForAbsolutePath{pth -> return myObjStat}
		collectionAO.demand.findMetadataValuesForCollection{pth2 -> return avus}

		def metadataService = new MetadataService()

		irodsAccessObjectFactory.demand.getDataObjectAO{ia -> return dataObjectAO.createMock()}
		irodsAccessObjectFactory.demand.getCollectionAO{ia2 -> return collectionAO.createMock()}
		metadataService.irodsAccessObjectFactory = irodsAccessObjectFactory.createMock()

		when:

		def actual = metadataService.listAvus(absPath, irodsAccount)

		then:
		actual != null
	}

	void "should list avus for a data object"() {
		given:
		IRODSAccount irodsAccount = IRODSAccount.instance("host", 1247, "user", "password", "", "zone", "")
		String absPath = "/an/abs/path"

		def irodsAccessObjectFactory = mockFor(IRODSAccessObjectFactory)

		def collectionAO = mockFor(CollectionAO)
		def dataObjectAO = mockFor(DataObjectAO)

		List<MetaDataAndDomainData> avus = new ArrayList<MetaDataAndDomainData>()

		def myObjStat = new ObjStat()
		myObjStat.objectType == ObjectType.DATA_OBJECT
		dataObjectAO.demand.getObjectStatForAbsolutePath{pth -> return myObjStat}
		dataObjectAO.demand.findMetadataValuesForDataObject{pth2 -> return avus}

		def metadataService = new MetadataService()

		irodsAccessObjectFactory.demand.getDataObjectAO{ia -> return dataObjectAO.createMock()}
		irodsAccessObjectFactory.demand.getCollectionAO{ia2 -> return collectionAO.createMock()}
		metadataService.irodsAccessObjectFactory = irodsAccessObjectFactory.createMock()

		when:

		def actual = metadataService.listAvus(absPath, irodsAccount)

		then:
		actual != null
	}

	void "should add avu for a data object"() {
		given:
		IRODSAccount irodsAccount = IRODSAccount.instance("host", 1247, "user", "password", "", "zone", "")
		String absPath = "/an/abs/path"
		AvuData avuData = AvuData.instance("attr", "value", "unit")

		def irodsAccessObjectFactory = mockFor(IRODSAccessObjectFactory)

		def collectionAO = mockFor(CollectionAO)
		def dataObjectAO = mockFor(DataObjectAO)

		List<MetaDataAndDomainData> avus = new ArrayList<MetaDataAndDomainData>()

		def myObjStat = new ObjStat()
		myObjStat.objectType == ObjectType.DATA_OBJECT
		dataObjectAO.demand.getObjectStatForAbsolutePath{pth -> return myObjStat}
		dataObjectAO.demand.addAVUMetadata{pth2, avu2 -> }

		def metadataService = new MetadataService()

		irodsAccessObjectFactory.demand.getDataObjectAO{ia -> return dataObjectAO.createMock()}
		irodsAccessObjectFactory.demand.getCollectionAO{ia2 -> return collectionAO.createMock()}
		metadataService.irodsAccessObjectFactory = irodsAccessObjectFactory.createMock()

		when:

		metadataService.addAvu(absPath, avuData, irodsAccount)

		then:
		true
	}

	void "should add avu for a collection"() {
		given:
		IRODSAccount irodsAccount = IRODSAccount.instance("host", 1247, "user", "password", "", "zone", "")
		String absPath = "/an/abs/path"
		AvuData avuData = AvuData.instance("attr", "value", "unit")

		def irodsAccessObjectFactory = mockFor(IRODSAccessObjectFactory)

		def collectionAO = mockFor(CollectionAO)
		def dataObjectAO = mockFor(DataObjectAO)

		List<MetaDataAndDomainData> avus = new ArrayList<MetaDataAndDomainData>()

		def myObjStat =  Mockito.mock(ObjStat.class)
		Mockito.when(myObjStat.isSomeTypeOfCollection()).thenReturn(true)
		dataObjectAO.demand.getObjectStatForAbsolutePath{pth -> return myObjStat}
		collectionAO.demand.addAVUMetadata{pth2, avu2 -> }

		def metadataService = new MetadataService()

		irodsAccessObjectFactory.demand.getDataObjectAO{ia -> return dataObjectAO.createMock()}
		irodsAccessObjectFactory.demand.getCollectionAO{ia2 -> return collectionAO.createMock()}
		metadataService.irodsAccessObjectFactory = irodsAccessObjectFactory.createMock()

		when:

		metadataService.addAvu(absPath, avuData, irodsAccount)

		then:
		true
	}

	void "should modify avu for a collection"() {
		given:
		IRODSAccount irodsAccount = IRODSAccount.instance("host", 1247, "user", "password", "", "zone", "")
		String absPath = "/an/abs/path"
		AvuData oldAvuData = AvuData.instance("attr", "value", "unit")
		AvuData newAvuData = AvuData.instance("attr1", "value1", "unit1")


		def irodsAccessObjectFactory = mockFor(IRODSAccessObjectFactory)

		def collectionAO = mockFor(CollectionAO)
		def dataObjectAO = mockFor(DataObjectAO)

		List<MetaDataAndDomainData> avus = new ArrayList<MetaDataAndDomainData>()

		def myObjStat =  Mockito.mock(ObjStat.class)
		Mockito.when(myObjStat.isSomeTypeOfCollection()).thenReturn(true)
		dataObjectAO.demand.getObjectStatForAbsolutePath{pth -> return myObjStat}
		collectionAO.demand.modifyAVUMetadata{pth2, avu2, newAvu2 -> }

		def metadataService = new MetadataService()

		irodsAccessObjectFactory.demand.getDataObjectAO{ia -> return dataObjectAO.createMock()}
		irodsAccessObjectFactory.demand.getCollectionAO{ia2 -> return collectionAO.createMock()}
		metadataService.irodsAccessObjectFactory = irodsAccessObjectFactory.createMock()

		when:

		metadataService.updateAvu(absPath, oldAvuData, newAvuData, irodsAccount)

		then:
		true
	}

	void "should modify avu for a data object"() {
		given:
		IRODSAccount irodsAccount = IRODSAccount.instance("host", 1247, "user", "password", "", "zone", "")
		String absPath = "/an/abs/path"
		AvuData oldAvuData = AvuData.instance("attr", "value", "unit")
		AvuData newAvuData = AvuData.instance("attr1", "value1", "unit1")


		def irodsAccessObjectFactory = mockFor(IRODSAccessObjectFactory)

		def collectionAO = mockFor(CollectionAO)
		def dataObjectAO = mockFor(DataObjectAO)

		List<MetaDataAndDomainData> avus = new ArrayList<MetaDataAndDomainData>()

		def myObjStat =  Mockito.mock(ObjStat.class)
		Mockito.when(myObjStat.isSomeTypeOfCollection()).thenReturn(false)
		dataObjectAO.demand.getObjectStatForAbsolutePath{pth -> return myObjStat}
		dataObjectAO.demand.modifyAVUMetadata{pth2, avu2, newAvu2 -> }

		def metadataService = new MetadataService()

		irodsAccessObjectFactory.demand.getDataObjectAO{ia -> return dataObjectAO.createMock()}
		irodsAccessObjectFactory.demand.getCollectionAO{ia2 -> return collectionAO.createMock()}
		metadataService.irodsAccessObjectFactory = irodsAccessObjectFactory.createMock()

		when:

		metadataService.updateAvu(absPath, oldAvuData, newAvuData, irodsAccount)

		then:
		true
	}

	void "should delete avu for a collection"() {
		given:
		IRODSAccount irodsAccount = IRODSAccount.instance("host", 1247, "user", "password", "", "zone", "")
		String absPath = "/an/abs/path"
		AvuData avuData = AvuData.instance("attr", "value", "unit")


		def irodsAccessObjectFactory = mockFor(IRODSAccessObjectFactory)

		def collectionAO = mockFor(CollectionAO)
		def dataObjectAO = mockFor(DataObjectAO)

		List<MetaDataAndDomainData> avus = new ArrayList<MetaDataAndDomainData>()

		def myObjStat =  Mockito.mock(ObjStat.class)
		Mockito.when(myObjStat.isSomeTypeOfCollection()).thenReturn(true)
		dataObjectAO.demand.getObjectStatForAbsolutePath{pth -> return myObjStat}
		collectionAO.demand.deleteAVUMetadata{pth2, avu2 -> }

		def metadataService = new MetadataService()

		irodsAccessObjectFactory.demand.getDataObjectAO{ia -> return dataObjectAO.createMock()}
		irodsAccessObjectFactory.demand.getCollectionAO{ia2 -> return collectionAO.createMock()}
		metadataService.irodsAccessObjectFactory = irodsAccessObjectFactory.createMock()

		when:

		metadataService.deleteAvu(absPath, avuData, irodsAccount)

		then:
		true
	}

	void "should delete avu for a data object"() {
		given:
		IRODSAccount irodsAccount = IRODSAccount.instance("host", 1247, "user", "password", "", "zone", "")
		String absPath = "/an/abs/path"
		AvuData avuData = AvuData.instance("attr", "value", "unit")


		def irodsAccessObjectFactory = mockFor(IRODSAccessObjectFactory)

		def collectionAO = mockFor(CollectionAO)
		def dataObjectAO = mockFor(DataObjectAO)

		List<MetaDataAndDomainData> avus = new ArrayList<MetaDataAndDomainData>()

		def myObjStat =  Mockito.mock(ObjStat.class)
		Mockito.when(myObjStat.isSomeTypeOfCollection()).thenReturn(false)
		dataObjectAO.demand.getObjectStatForAbsolutePath{pth -> return myObjStat}
		dataObjectAO.demand.deleteAVUMetadata{pth2, avu2 -> }

		def metadataService = new MetadataService()

		irodsAccessObjectFactory.demand.getDataObjectAO{ia -> return dataObjectAO.createMock()}
		irodsAccessObjectFactory.demand.getCollectionAO{ia2 -> return collectionAO.createMock()}
		metadataService.irodsAccessObjectFactory = irodsAccessObjectFactory.createMock()

		when:

		metadataService.deleteAvu(absPath, avuData, irodsAccount)

		then:
		true
	}
}

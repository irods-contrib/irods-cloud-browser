package org.irods.jargon.idrop.web.services

import grails.test.mixin.*

import org.irods.jargon.core.connection.IRODSAccount
import org.irods.jargon.core.pub.CollectionAO
import org.irods.jargon.core.pub.IRODSAccessObjectFactory
import org.irods.jargon.mdquery.MetadataQuery
import org.irods.jargon.mdquery.serialization.MetadataQueryJsonService
import org.irods.jargon.vircoll.TemporaryQueryService
import org.irods.jargon.vircoll.UserVirtualCollectionProfile
import org.irods.jargon.vircoll.types.MetadataQueryVirtualCollection

import spock.lang.Specification

/**
 * See the API for {@link grails.test.mixin.services.ServiceUnitTestMixin} for usage instructions
 */
@TestFor(MetadataQueryService)
class MetadataQueryServiceSpec extends Specification {

	void "should find a metadata query by name "() {
		given:
		IRODSAccount irodsAccount = IRODSAccount.instance("host", 1247, "user", "password", "", "zone", "")
		String name = "foo"

		def irodsAccessObjectFactory = mockFor(IRODSAccessObjectFactory)

		def virtualCollectionService = mockFor(VirtualCollectionService)
		def userVirtualCollectionProfile = new UserVirtualCollectionProfile()
		def  metadataQuery = new MetadataQueryVirtualCollection("blah")
		metadataQuery.uniqueName = name
		userVirtualCollectionProfile.userRecentQueries.add(metadataQuery)
		virtualCollectionService.demand.virtualCollectionHomeListingForUser{ nm,ia -> return userVirtualCollectionProfile}
		def metadataQueryService = new MetadataQueryService()
		metadataQueryService.virtualCollectionService = virtualCollectionService.createMock()
		metadataQueryService.irodsAccessObjectFactory = irodsAccessObjectFactory.createMock()

		when:

		def actual = metadataQueryService.retrieveMetadataQuery(name, irodsAccount)

		then:
		actual != null
	}

	void "should store a metadata query "() {
		given:
		IRODSAccount irodsAccount = IRODSAccount.instance("host", 1247, "user", "password", "", "zone", "")
		String name = "foo"

		MetadataQuery testQuery = new MetadataQuery()
		MetadataQueryJsonService metadataQueryJsonService = new MetadataQueryJsonService()
		def testQueryJson = metadataQueryJsonService.jsonFromMetadataQuery(testQuery)
		def metadataQueryVirtualCollection = new MetadataQueryVirtualCollection(testQueryJson)

		def irodsAccessObjectFactory = mockFor(IRODSAccessObjectFactory)
		def collectionAO = mockFor(CollectionAO)
		irodsAccessObjectFactory.demand.getCollectionAO{iact -> return collectionAO.createMock()}

		def virtualCollectionService = mockFor(VirtualCollectionService)
		def metadataQueryService = new MetadataQueryService()
		metadataQueryService.virtualCollectionService = virtualCollectionService.createMock()
		metadataQueryService.irodsAccessObjectFactory = irodsAccessObjectFactory.createMock()
		def temporaryQueryServiceMock = mockFor(TemporaryQueryService)
		temporaryQueryServiceMock.demand.nameAndStoreTemporaryQuery{ mdq, un, maint ->
			return "foo"
		}

		def jargonServiceFactory = mockFor(JargonServiceFactoryService)
		jargonServiceFactory.demand.instanceTemporaryQueryService{ ia2 ->
			return temporaryQueryServiceMock.createMock()
		}
		metadataQueryService.jargonServiceFactoryService = jargonServiceFactory.createMock()

		when:

		def actual = metadataQueryService.storeMetadataTempQuery(testQueryJson, irodsAccount)

		then:
		actual != null
	}
}

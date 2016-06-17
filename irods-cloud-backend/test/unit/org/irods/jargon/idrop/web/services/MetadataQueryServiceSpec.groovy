package org.irods.jargon.idrop.web.services

import grails.test.mixin.*

import javax.servlet.http.HttpSession

import org.codehaus.groovy.grails.plugins.testing.GrailsMockHttpSession
import org.irods.jargon.core.connection.IRODSAccount
import org.irods.jargon.core.pub.CollectionAO
import org.irods.jargon.core.pub.IRODSAccessObjectFactory
import org.irods.jargon.mdquery.MetadataQuery
import org.irods.jargon.mdquery.serialization.MetadataQueryJsonService
import org.irods.jargon.vircoll.CollectionTypes
import org.irods.jargon.vircoll.TemporaryQueryService
import org.irods.jargon.vircoll.types.MetadataQueryMaintenanceService
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
		def  metadataQuery = new MetadataQueryVirtualCollection("blah")
		metadataQuery.uniqueName = name
		virtualCollectionService.demand.virtualCollectionDetails(String){ nm, ia, ses-> return metadataQuery}
		def metadataQueryService = new MetadataQueryService()
		metadataQueryService.virtualCollectionService = virtualCollectionService.createMock()
		metadataQueryService.irodsAccessObjectFactory = irodsAccessObjectFactory.createMock()

		def metadataQueryMaintenanceService = mockFor(MetadataQueryMaintenanceService)

		def theSession = mockFor(HttpSession)

		when:

		def actual = metadataQueryService.retrieveMetadataQuery(name, irodsAccount, theSession.createMock())

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
		temporaryQueryServiceMock.demand.addOrUpdateTemporaryQuery{ mdq, un, maint ->
			return "foo"
		}

		def metadataQueryMaintenanceService = mockFor(MetadataQueryMaintenanceService)
		def metadataQueryMaintMock = metadataQueryMaintenanceService.createMock()

		def jargonServiceFactoryService = mockFor(JargonServiceFactoryService)

		jargonServiceFactoryService.demand.instanceMetadataQueryMaintenanceService{ ia2 -> return metadataQueryMaintMock }

		jargonServiceFactoryService.demand.instanceTemporaryQueryService{ ia3 ->
			return temporaryQueryServiceMock.createMock()
		}

		metadataQueryService.jargonServiceFactoryService = jargonServiceFactoryService.createMock()

		def sess = new GrailsMockHttpSession()


		when:

		def actual = metadataQueryService.storeMetadataQuery(testQueryJson, irodsAccount, "", sess, "boo", CollectionTypes.TEMPORARY_QUERY)

		then:
		actual != null
	}
}

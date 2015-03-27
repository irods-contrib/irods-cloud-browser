package org.irods.jargon.idrop.web.services

import grails.test.mixin.*

import org.codehaus.groovy.grails.plugins.testing.GrailsMockHttpSession
import org.irods.jargon.core.connection.IRODSAccount
import org.irods.jargon.core.pub.IRODSAccessObjectFactory
import org.irods.jargon.core.query.PagingAwareCollectionListing
import org.irods.jargon.idrop.web.services.VirtualCollectionService.ListingType
import org.irods.jargon.vircoll.VirtualCollection
import org.irods.jargon.vircoll.VirtualCollectionDiscoveryService
import org.irods.jargon.vircoll.impl.VirtualCollectionFactoryImpl
import org.irods.jargon.vircoll.types.CollectionBasedVirtualCollection
import org.irods.jargon.vircoll.types.CollectionBasedVirtualCollectionExecutor

import spock.lang.Specification

/**
 * See the API for {@link grails.test.mixin.services.ServiceUnitTestMixin} for usage instructions
 */
@TestFor(VirtualCollectionService)
class VirtualCollectionServiceSpec  extends Specification  {

	void "test get vc cached in session"() {
		given:
		IRODSAccount irodsAccount = IRODSAccount.instance("host", 1247, "user", "password", "", "zone", "")
		String uniqueName = "hithere"
		def irodsAccessObjectFactory = mockFor(IRODSAccessObjectFactory)
		irodsAccessObjectFactory.demand.getEnvironmentalInfoAO{ irodsAcct -> return envMock }
		def iafMock = irodsAccessObjectFactory.createMock()
		PagingAwareCollectionListing listing = new PagingAwareCollectionListing()

		def collectionBasedVirtualCollectionExecutor = mockFor(CollectionBasedVirtualCollectionExecutor)
		collectionBasedVirtualCollectionExecutor.demand.queryAll{return listing}
		def execMock = collectionBasedVirtualCollectionExecutor.createMock()

		def virtualCollectionFactory = mockFor(VirtualCollectionFactoryImpl)
		virtualCollectionFactory.demand.instanceExecutorBased{vc -> return execMock}
		def factMock = virtualCollectionFactory.createMock()

		def jargonServiceFactoryService = mockFor(JargonServiceFactoryService)
		jargonServiceFactoryService.demand.instanceVirtualCollectionFactory{irodsAcct -> return factMock}

		def virtualCollectionExecutorFactoryCreatorServiceMock = jargonServiceFactoryService.createMock()

		def mockSession = new GrailsMockHttpSession()
		List<VirtualCollection> virColls = new ArrayList<VirtualCollection>()
		CollectionBasedVirtualCollection collBasedVirColl = new CollectionBasedVirtualCollection(uniqueName,"/a/path")
		virColls.add(collBasedVirColl)
		mockSession.virtualCollections = virColls

		VirtualCollectionService virtualCollectionService = new VirtualCollectionService()
		virtualCollectionService.irodsAccessObjectFactory = iafMock
		virtualCollectionService.jargonServiceFactoryService = virtualCollectionExecutorFactoryCreatorServiceMock

		when:

		def actual = virtualCollectionService.virtualCollectionDetails(uniqueName,irodsAccount, mockSession)

		then:

		actual != null
	}

	void "test get vc not cached in session but retrieved via listing"() {
		given:
		IRODSAccount irodsAccount = IRODSAccount.instance("host", 1247, "user", "password", "", "zone", "")
		String uniqueName = "root"
		def irodsAccessObjectFactory = mockFor(IRODSAccessObjectFactory)
		irodsAccessObjectFactory.demand.getEnvironmentalInfoAO{ irodsAcct -> return envMock }
		def iafMock = irodsAccessObjectFactory.createMock()
		PagingAwareCollectionListing listing = new PagingAwareCollectionListing()

		def collectionBasedVirtualCollectionExecutor = mockFor(CollectionBasedVirtualCollectionExecutor)
		collectionBasedVirtualCollectionExecutor.demand.queryAll{return listing}
		def execMock = collectionBasedVirtualCollectionExecutor.createMock()


		def virtualCollectionFactory = mockFor(VirtualCollectionFactoryImpl)
		virtualCollectionFactory.demand.instanceExecutorBasedOnVirtualCollection{vc -> return execMock}
		def factMock = virtualCollectionFactory.createMock()

		def jargonServiceFactoryService = mockFor(JargonServiceFactoryService)
		jargonServiceFactoryService.demand.instanceVirtualCollectionFactory{irodsAcct -> return factMock}


		List<VirtualCollection> virColls = new ArrayList<VirtualCollection>()
		CollectionBasedVirtualCollection collBasedVirColl = new CollectionBasedVirtualCollection(uniqueName,"/a/path")
		virColls.add(collBasedVirColl)
		def virtualCollectionDiscoveryService = mockFor(VirtualCollectionDiscoveryService)
		virtualCollectionDiscoveryService.demand.listDefaultUserCollections{return virColls}
		def discoveryMock = virtualCollectionDiscoveryService.createMock()

		jargonServiceFactoryService.demand.instanceVirtualCollectionDiscoveryService{irodsAcct -> return discoveryMock}

		def virtualCollectionExecutorFactoryCreatorServiceMock = jargonServiceFactoryService.createMock()

		def mockSession = new GrailsMockHttpSession()

		mockSession.virtualCollections = []

		VirtualCollectionService virtualCollectionService = new VirtualCollectionService()
		virtualCollectionService.irodsAccessObjectFactory = iafMock
		virtualCollectionService.jargonServiceFactoryService = virtualCollectionExecutorFactoryCreatorServiceMock

		when:

		def actual = virtualCollectionService.virtualCollectionDetails(uniqueName,irodsAccount, mockSession)

		then:

		actual != null
	}

	void "test create listing from collection based vc"() {
		given:
		IRODSAccount irodsAccount = IRODSAccount.instance("host", 1247, "user", "password", "", "zone", "")
		String uniqueName = "root"
		def irodsAccessObjectFactory = mockFor(IRODSAccessObjectFactory)
		irodsAccessObjectFactory.demand.getEnvironmentalInfoAO{ irodsAcct -> return envMock }
		def iafMock = irodsAccessObjectFactory.createMock()
		PagingAwareCollectionListing listing = new PagingAwareCollectionListing()

		List<VirtualCollection> virColls = new ArrayList<VirtualCollection>()
		CollectionBasedVirtualCollection collBasedVirColl = new CollectionBasedVirtualCollection(uniqueName,"/a/path")
		virColls.add(collBasedVirColl)

		def jargonServiceFactoryService = mockFor(JargonServiceFactoryService)
		def collectionBasedVirtualCollectionExecutor = mockFor(CollectionBasedVirtualCollectionExecutor)
		collectionBasedVirtualCollectionExecutor.demand.queryAll{return listing}
		def execMock = collectionBasedVirtualCollectionExecutor.createMock()
		def virtualCollectionFactory = mockFor(VirtualCollectionFactoryImpl)
		virtualCollectionFactory.demand.instanceExecutor{vc -> return execMock}

		def factMock = virtualCollectionFactory.createMock()

		def virtualCollectionDiscoveryService = mockFor(VirtualCollectionDiscoveryService)
		virtualCollectionDiscoveryService.demand.listDefaultUserCollections{return virColls}
		def discoveryMock = virtualCollectionDiscoveryService.createMock()


		//virtualCollectionFactoryCreatorService.demand.instanceVirtualCollectionDiscoveryService{irodsAcct -> return discoveryMock}
		jargonServiceFactoryService.demand.instanceVirtualCollectionFactory{irodsAcct -> return factMock}

		def mockSession = new GrailsMockHttpSession()

		mockSession.virtualCollections = virColls

		VirtualCollectionService virtualCollectionService = new VirtualCollectionService()
		virtualCollectionService.irodsAccessObjectFactory = iafMock
		def virtualCollectionFactoryCreatorServiceMock = jargonServiceFactoryService.createMock()

		virtualCollectionService.jargonServiceFactoryService = virtualCollectionFactoryCreatorServiceMock

		when:

		def actual = virtualCollectionService.virtualCollectionListing(uniqueName, "/a/path", ListingType.ALL, 0, irodsAccount, mockSession)

		then:

		actual != null
	}
}

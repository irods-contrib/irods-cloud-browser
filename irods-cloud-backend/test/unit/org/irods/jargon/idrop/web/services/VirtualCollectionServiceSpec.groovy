package org.irods.jargon.idrop.web.services

import grails.test.mixin.*

import org.codehaus.groovy.grails.plugins.testing.GrailsMockHttpSession
import org.irods.jargon.core.connection.IRODSAccount
import org.irods.jargon.core.pub.IRODSAccessObjectFactory
import org.irods.jargon.core.query.PagingAwareCollectionListing
import org.irods.jargon.idrop.web.services.VirtualCollectionService.ListingType
import org.irods.jargon.vircoll.AbstractVirtualCollection
import org.irods.jargon.vircoll.CollectionTypes
import org.irods.jargon.vircoll.UserVirtualCollectionProfile
import org.irods.jargon.vircoll.VirtualCollectionDiscoveryService
import org.irods.jargon.vircoll.impl.GenericVirtualCollectionMaintenanceService
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
		virtualCollectionFactory.demand.instanceExecutorBasedOnVirtualCollection{vc -> return execMock}
		def factMock = virtualCollectionFactory.createMock()

		def jargonServiceFactoryService = mockFor(JargonServiceFactoryService)
		jargonServiceFactoryService.demand.instanceVirtualCollectionExecutorFactory{irodsAcct -> return factMock}

		def virtualCollectionExecutorFactoryCreatorServiceMock = jargonServiceFactoryService.createMock()

		def mockSession = new GrailsMockHttpSession()
		List<AbstractVirtualCollection> virColls = new ArrayList<AbstractVirtualCollection>()
		CollectionBasedVirtualCollection collBasedVirColl = new CollectionBasedVirtualCollection(uniqueName,"/a/path")
		virColls.add(collBasedVirColl)
		def userVirtualCollectionProfile = new UserVirtualCollectionProfile();
		userVirtualCollectionProfile.userHomeCollections = virColls
		mockSession.virtualCollections = userVirtualCollectionProfile

		VirtualCollectionService virtualCollectionService = new VirtualCollectionService()
		virtualCollectionService.irodsAccessObjectFactory = iafMock
		virtualCollectionService.jargonServiceFactoryService = virtualCollectionExecutorFactoryCreatorServiceMock

		when:

		def actual = virtualCollectionService.virtualCollectionDetails(uniqueName,irodsAccount, mockSession)

		then:

		actual != null
	}

	void "test delete vc"() {
		given:
		IRODSAccount irodsAccount = IRODSAccount.instance("host", 1247, "user", "password", "", "zone", "")
		String[] uniqueName = ["xxxx"]
		def uniqueNamesList = new ArrayList<String>();
		def irodsAccessObjectFactory = mockFor(IRODSAccessObjectFactory)
		def iafMock = irodsAccessObjectFactory.createMock()

		def jargonServiceFactoryService = mockFor(JargonServiceFactoryService)
		def virtualCollectionMaintenanceService = mockFor(GenericVirtualCollectionMaintenanceService)
		virtualCollectionMaintenanceService.demand.deleteVirtualCollection{nm -> return void}
		def maintMock = virtualCollectionMaintenanceService.createMock()

		jargonServiceFactoryService.demand.instanceGenericVirtualCollectionMaintenanceService{irodsAcct -> return maintMock}

		def mockSession = new GrailsMockHttpSession()
		def userVirtualCollectionProfile = new UserVirtualCollectionProfile();
		mockSession.virtualCollections = userVirtualCollectionProfile

		VirtualCollectionService virtualCollectionService = new VirtualCollectionService()
		virtualCollectionService.irodsAccessObjectFactory = iafMock
		def virtualCollectionFactoryCreatorServiceMock = jargonServiceFactoryService.createMock()

		virtualCollectionService.jargonServiceFactoryService = virtualCollectionFactoryCreatorServiceMock

		when:

		def actual = virtualCollectionService.deleteVirtualCollections(uniqueName, irodsAccount, mockSession)

		then:

		1 == 1
	}

	void "test reclassify collection"() {
		given:
		IRODSAccount irodsAccount = IRODSAccount.instance("host", 1247, "user", "password", "", "zone", "")
		String[] uniqueName = ["xxxx"]
		def uniqueNamesList = new ArrayList<String>();
		def irodsAccessObjectFactory = mockFor(IRODSAccessObjectFactory)
		def iafMock = irodsAccessObjectFactory.createMock()

		List<AbstractVirtualCollection> virColls = new ArrayList<AbstractVirtualCollection>()
		CollectionBasedVirtualCollection collBasedVirColl = new CollectionBasedVirtualCollection("boo","/a/path")
		virColls.add(collBasedVirColl)
		def userVirtualCollectionProfile = new UserVirtualCollectionProfile()
		userVirtualCollectionProfile.userHomeCollections = virColls

		def jargonServiceFactoryService = mockFor(JargonServiceFactoryService)

		def virtualCollectionMaintenanceService = mockFor(GenericVirtualCollectionMaintenanceService)
		virtualCollectionMaintenanceService.demand.reclassifyVirtualCollection{ct,nm -> return void}
		def maintMock = virtualCollectionMaintenanceService.createMock()
		jargonServiceFactoryService.demand.instanceGenericVirtualCollectionMaintenanceService{ia -> return maintMock}
		def mockSession = new GrailsMockHttpSession()

		mockSession.virtualCollections = userVirtualCollectionProfile

		VirtualCollectionService virtualCollectionService = new VirtualCollectionService()
		virtualCollectionService.irodsAccessObjectFactory = iafMock
		def virtualCollectionFactoryCreatorServiceMock = jargonServiceFactoryService.createMock()

		virtualCollectionService.jargonServiceFactoryService = virtualCollectionFactoryCreatorServiceMock

		when:

		def actual = virtualCollectionService.moveVirtualCollections(uniqueName, CollectionTypes.TEMPORARY_QUERY,  irodsAccount,  mockSession)

		then:

		1 == 1
	}

	void "test create listing from collection based vc"() {
		given:
		IRODSAccount irodsAccount = IRODSAccount.instance("host", 1247, "user", "password", "", "zone", "")
		String uniqueName = "root"
		def irodsAccessObjectFactory = mockFor(IRODSAccessObjectFactory)
		def iafMock = irodsAccessObjectFactory.createMock()
		PagingAwareCollectionListing listing = new PagingAwareCollectionListing()

		List<AbstractVirtualCollection> virColls = new ArrayList<AbstractVirtualCollection>()
		CollectionBasedVirtualCollection collBasedVirColl = new CollectionBasedVirtualCollection(uniqueName,"/a/path")
		virColls.add(collBasedVirColl)
		def userVirtualCollectionProfile = new UserVirtualCollectionProfile()
		userVirtualCollectionProfile.userHomeCollections = virColls

		def jargonServiceFactoryService = mockFor(JargonServiceFactoryService)
		def collectionBasedVirtualCollectionExecutor = mockFor(CollectionBasedVirtualCollectionExecutor)
		collectionBasedVirtualCollectionExecutor.demand.queryAll{return listing}
		def execMock = collectionBasedVirtualCollectionExecutor.createMock()
		def virtualCollectionFactory = mockFor(VirtualCollectionFactoryImpl)
		virtualCollectionFactory.demand.instanceExecutorBasedOnVirtualCollection{vc -> return execMock}

		def factMock = virtualCollectionFactory.createMock()

		def virtualCollectionDiscoveryService = mockFor(VirtualCollectionDiscoveryService)
		virtualCollectionDiscoveryService.demand.userVirtualCollectionProfile{return userVirtualCollectionProfile}
		def discoveryMock = virtualCollectionDiscoveryService.createMock()

		//virtualCollectionFactoryCreatorService.demand.instanceVirtualCollectionDiscoveryService{irodsAcct -> return discoveryMock}
		jargonServiceFactoryService.demand.instanceVirtualCollectionExecutorFactory{irodsAcct -> return factMock}

		def mockSession = new GrailsMockHttpSession()

		mockSession.virtualCollections = userVirtualCollectionProfile

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

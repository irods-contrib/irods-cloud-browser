package org.irods.jargon.idrop.web.controllers

import grails.test.mixin.*

import org.codehaus.groovy.grails.plugins.testing.GrailsMockHttpSession
import org.irods.jargon.core.connection.IRODSAccount
import org.irods.jargon.core.query.PagingAwareCollectionListing
import org.irods.jargon.idrop.web.services.IrodsCollectionService
import org.irods.jargon.idrop.web.services.VirtualCollectionService
import org.irods.jargon.vircoll.AbstractVirtualCollection
import org.irods.jargon.vircoll.types.CollectionBasedVirtualCollection

import spock.lang.Specification

/**
 * See the API for {@link grails.test.mixin.web.ControllerUnitTestMixin} for usage instructions
 */
@TestFor(CollectionController)
class CollectionControllerSpec extends Specification {

	void "gets listing under virtual collection"() {
		given:

		def collectionService = mockFor(IrodsCollectionService)
		PagingAwareCollectionListing listing = new PagingAwareCollectionListing()
		collectionService.demand.collectionListing{ path, listingType, offset, irodsAccount ->
			return listing
		}
		controller.irodsCollectionService = collectionService.createMock()

		def vcServiceMock = mockFor(VirtualCollectionService)
		CollectionBasedVirtualCollection rootColl = new CollectionBasedVirtualCollection("/", "root")
		CollectionBasedVirtualCollection homeColl = new CollectionBasedVirtualCollection("/test/home/userhome", "home")
		def virtualCollections = new ArrayList<AbstractVirtualCollection>()
		virtualCollections.add(rootColl)
		virtualCollections.add(homeColl)
		def mockSession = new GrailsMockHttpSession()
		vcServiceMock.demand.virtualCollectionListing { vcName, path, listingTYpe, offset, irodsAccount, sess ->
			return listing
		}
		controller.virtualCollectionService = vcServiceMock.createMock()

		IRODSAccount testAccount = IRODSAccount.instance("host", 1247, "user", "password", "","zone", "")
		request.irodsAccount = testAccount
		params.path = "/a/path"
		params.offset = 0
		params.virtualCollection = 'root'

		when:
		controller.show()

		then:
		controller.response.status == 200
		log.info("responseText:${response.text}")
	}


	void "new folder should work correctly"() {
		given:

		def collectionService = mockFor(IrodsCollectionService)

		controller.irodsCollectionService = collectionService.createMock()

		IRODSAccount testAccount = IRODSAccount.instance("host", 1247, "user", "password", "","zone", "")
		request.irodsAccount = testAccount
		params.path = "/a/path"

		collectionService.demand.newFolder{ path, irodsAccount -> return }
		controller.irodsCollectionService = collectionService.createMock()

		when:
		controller.update()

		then:
		controller.response.status == 200
		log.info("responseText:${response.text}")
	}
}

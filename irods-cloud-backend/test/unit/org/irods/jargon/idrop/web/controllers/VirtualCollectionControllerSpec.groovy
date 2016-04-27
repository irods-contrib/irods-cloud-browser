package org.irods.jargon.idrop.web.controllers

import grails.test.mixin.*

import org.codehaus.groovy.grails.plugins.testing.GrailsMockHttpSession
import org.irods.jargon.core.connection.IRODSAccount
import org.irods.jargon.idrop.web.services.VirtualCollectionService
import org.irods.jargon.vircoll.AbstractVirtualCollection
import org.irods.jargon.vircoll.types.CollectionBasedVirtualCollection

import spock.lang.Specification


/**
 * See the API for {@link grails.test.mixin.web.ControllerUnitTestMixin} for
 * usage instructions
 */
@TestFor(VirtualCollectionController)
class VirtualCollectionControllerSpec extends Specification {

	void testListVirtualCollections() {
		given:

		def vcServiceMock = mockFor(VirtualCollectionService)

		CollectionBasedVirtualCollection rootColl = new CollectionBasedVirtualCollection("/", "root")
		CollectionBasedVirtualCollection homeColl = new CollectionBasedVirtualCollection("/test/home/userhome", "home")
		def virtualCollections = new ArrayList<AbstractVirtualCollection>()
		virtualCollections.add(rootColl)
		virtualCollections.add(homeColl)
		def mockSession = new GrailsMockHttpSession()

		vcServiceMock.demand.virtualCollectionHomeListingForUser { irodsAccount, sess -> return virtualCollections }

		controller.virtualCollectionService = vcServiceMock.createMock()
		IRODSAccount testAccount = IRODSAccount.instance("host", 1247, "user", "password", "","zone", "")
		request.irodsAccount = testAccount


		when:
		controller.index()

		then:
		controller.response.status == 200
		log.info("responseText:${response.text}")
	}

	void testDeleteVirtualCollection() {
		given:

		def vcServiceMock = mockFor(VirtualCollectionService)
		def mockSession = new GrailsMockHttpSession()
		def name = "vcname"

		vcServiceMock.demand.deleteVirtualCollections {nme, irodsAccount, sess -> return null }

		controller.virtualCollectionService = vcServiceMock.createMock()

		IRODSAccount testAccount = IRODSAccount.instance("host", 1247, "user", "password", "","zone", "")
		request.irodsAccount = testAccount
		params.name = name;


		when:
		controller.delete()

		then:
		controller.response.status == 204
		log.info("responseText:${response.text}")
	}

	void testMoveVirtualCollection() {
		given:

		def vcServiceMock = mockFor(VirtualCollectionService)
		def mockSession = new GrailsMockHttpSession()
		def name = "vcname"

		vcServiceMock.demand.moveVirtualCollections {nme, typ, irodsAccount, sess -> return null }

		controller.virtualCollectionService = vcServiceMock.createMock()

		IRODSAccount testAccount = IRODSAccount.instance("host", 1247, "user", "password", "","zone", "")
		request.irodsAccount = testAccount
		params.name = name;
		params.collType = "SHARED"

		when:
		controller.save()

		then:
		controller.response.status == 200
		log.info("responseText:${response.text}")
	}
}

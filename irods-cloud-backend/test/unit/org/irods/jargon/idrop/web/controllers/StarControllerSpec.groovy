package org.irods.jargon.idrop.web.controllers



import grails.test.mixin.*

import org.irods.jargon.core.connection.IRODSAccount
import org.irods.jargon.idrop.web.services.StarService
import org.junit.*

import spock.lang.Specification

/**
 * See the API for {@link grails.test.mixin.web.ControllerUnitTestMixin} for usage instructions
 */
@TestFor(StarController)
class StarControllerSpec extends Specification {

	void "star controller removing a star to a collection"() {
		given:

		def path = "/a/path"
		def starService = mockFor(StarService)
		starService.demand.removeStar{path1,irodsAccount1->}
		def starServiceMock = starService.createMock()

		IRODSAccount testAccount = IRODSAccount.instance("host", 1247, "user", "password", "","zone", "")
		request.irodsAccount = testAccount
		params.path = path
		controller.starService = starServiceMock

		when:
		controller.delete()

		then:
		controller.response.status == 204
	}

	void "star controller adding a star to a collection"() {
		given:

		def path = "/a/path"
		def starService = mockFor(StarService)
		starService.demand.addStar{path1,irodsAccount1->}
		def starServiceMock = starService.createMock()

		IRODSAccount testAccount = IRODSAccount.instance("host", 1247, "user", "password", "","zone", "")
		request.irodsAccount = testAccount
		params.path = path
		controller.starService = starServiceMock

		when:
		controller.update()

		then:
		controller.response.status == 204
	}
}

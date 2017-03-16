package org.irods.jargon.idrop.web.controllers

import grails.test.mixin.*

import org.irods.jargon.core.connection.IRODSAccount
import org.irods.jargon.core.pub.domain.UserFilePermission
import org.irods.jargon.idrop.web.services.AclService

import spock.lang.Specification

/**
 * See the API for {@link grails.test.mixin.web.ControllerUnitTestMixin} for usage instructions
 */
@TestFor(AclController)
class AclControllerSpec extends Specification {

	def setup() {
	}

	def cleanup() {
	}

	void "test gets acl listing under collection"() {
		given:

		def aclService = mockFor(AclService)
		def listing = new ArrayList<UserFilePermission>()

		aclService.demand.listUserAcls { usr,iac -> return listing }

		controller.aclService = aclService.createMock()


		IRODSAccount testAccount = IRODSAccount.instance("host", 1247, "user", "password", "","zone", "")
		request.irodsAccount = testAccount
		params.path = "/a/path"


		when:
		controller.show()

		then:
		controller.response.status == 200
		log.info("responseText:${response.text}")
	}
}

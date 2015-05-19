package org.irods.jargon.idrop.web.controllers

import grails.test.mixin.*

import org.irods.jargon.core.connection.IRODSAccount
import org.irods.jargon.idrop.web.authsession.UserSessionContext
import org.irods.jargon.idrop.web.services.UserService
import org.irods.jargon.idrop.web.controllers.UserController

import spock.lang.Specification

/**
 * See the API for {@link grails.test.mixin.web.ControllerUnitTestMixin} for
 * usage instructions
 */
@TestFor(UserController)
class UserControllerSpec extends Specification {

	/*
	 * Get the logged in identity of the user
	 */
	void testIndex() {
		def userServiceMock = mockFor(UserService)

		userServiceMock.demand.getLoggedInIdentity { session -> return new UserSessionContext() }
		controller.userService = userServiceMock.createMock()
		IRODSAccount testAccount = IRODSAccount.instance("host", 1247, "user", "password", "","zone", "")
		request.irodsAccount = testAccount

		when:
		controller.index()

		then:
		controller.response.status == 200
		def respText = response.text
		log.info("responseText:${response.text}")
		controller.response.text.contains "{\"defaultStorageResource\":null"
	}
}

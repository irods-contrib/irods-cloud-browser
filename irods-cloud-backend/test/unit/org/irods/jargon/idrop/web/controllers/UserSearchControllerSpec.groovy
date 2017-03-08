package org.irods.jargon.idrop.web.controllers

import grails.test.mixin.*

import org.irods.jargon.core.connection.IRODSAccount
import org.irods.jargon.core.pub.domain.User
import org.irods.jargon.core.pub.domain.UserGroup
import org.irods.jargon.idrop.web.services.UserService

import spock.lang.Specification

/**
 * See the API for {@link grails.test.mixin.web.ControllerUnitTestMixin} for usage instructions
 */
@TestFor(UserSearchController)
class UserSearchControllerSpec extends Specification {

	void "should list users"() {
		given:


		def userService = mockFor(UserService)
		List<User> users = new ArrayList<User>()
		userService.demand.listUsers{ p1, ia1 -> return users }

		IRODSAccount testAccount = IRODSAccount.instance("host", 1247, "user", "password", "","zone", "")
		request.irodsAccount = testAccount
		params.userName = "user"
		params.group = false
		controller.userService = userService.createMock()

		when:
		controller.show()

		then:
		controller.response.status == 200
	}

	void "should list users groups"() {
		given:


		def userService = mockFor(UserService)
		List<UserGroup> users = new ArrayList<UserGroup>()
		userService.demand.listUserGroups{ p1, ia1 -> return users }

		IRODSAccount testAccount = IRODSAccount.instance("host", 1247, "user", "password", "","zone", "")
		request.irodsAccount = testAccount
		params.userName = "user"
		params.group = true
		controller.userService = userService.createMock()

		when:
		controller.show()

		then:
		controller.response.status == 200
	}
}

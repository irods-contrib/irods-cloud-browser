package org.irods.jargon.idrop.web.services

import grails.test.mixin.*

import org.codehaus.groovy.grails.plugins.testing.GrailsMockHttpSession
import org.irods.jargon.core.connection.IRODSAccount
import org.irods.jargon.core.connection.IRODSServerProperties
import org.irods.jargon.core.connection.auth.AuthResponse
import org.irods.jargon.core.pub.EnvironmentalInfoAO
import org.irods.jargon.core.pub.IRODSAccessObjectFactory
import org.irods.jargon.core.pub.UserAO
import org.irods.jargon.core.pub.UserGroupAO
import org.irods.jargon.core.pub.domain.User
import org.irods.jargon.core.pub.domain.UserGroup
import org.junit.Before


/**
 * See the API for {@link grails.test.mixin.services.ServiceUnitTestMixin} for
 * usage instructions
 */
@TestFor(UserService)
class UserServiceSpec {

	@Before
	void setup() {
	}

	void testGetLoggedIdentity() {
		IRODSServerProperties irodsServerProperties = IRODSServerProperties.instance(IRODSServerProperties.IcatEnabled.ICAT_ENABLED, 1000, "rods4.1.10", "api1", "zone")
		def environmentalInfoAO = mockFor(EnvironmentalInfoAO)
		environmentalInfoAO.demand.getIRODSServerProperties { irodsAccount -> return irodsServerProperties }
		def envMock = environmentalInfoAO.createMock()

		def irodsAccessObjectFactory = mockFor(IRODSAccessObjectFactory)
		irodsAccessObjectFactory.demand.getEnvironmentalInfoAO{ irodsAccount -> return envMock }
		def iafMock = irodsAccessObjectFactory.createMock()
		EnvironmentServicesService envSvc = new EnvironmentServicesService()
		envSvc.irodsAccessObjectFactory = iafMock

		def mockSession = new GrailsMockHttpSession()

		IRODSAccount testAcct = IRODSAccount.instance("host", 1247, "xxx", "xxx", "xxx", "xxx", "xxx")

		def authResponse = new AuthResponse()
		authResponse.setAuthenticatedIRODSAccount(testAcct)
		authResponse.setAuthenticatingIRODSAccount(testAcct)
		mockSession.authenticationSession = authResponse

		UserService userService = new UserService()
		userService.environmentServicesService = envSvc
		userService.irodsAccessObjectFactory = iafMock

		def actual = userService.getLoggedInIdentity(mockSession)

		assertNotNull(actual)
	}

	void "should list users based on query"() {
		IRODSServerProperties irodsServerProperties = IRODSServerProperties.instance(IRODSServerProperties.IcatEnabled.ICAT_ENABLED, 1000, "rods4.1.10", "api1", "zone")
		def queryString = "ab"
		List<User> users = new ArrayList<User>()
		def userAO = mockfor(UserAO)
		userAO.demand.findByName{ nm -> return users}


		def irodsAccessObjectFactory = mockFor(IRODSAccessObjectFactory)
		irodsAccessObjectFactory.demand.getUserAO{ irodsAccount -> return userAO.createMock() }
		def iafMock = irodsAccessObjectFactory.createMock()
		UserService userService = new UserService()
		userService.irodsAccessObjectFactory = iafMock

		IRODSAccount testAcct = IRODSAccount.instance("host", 1247, "xxx", "xxx", "xxx", "xxx", "xxx")

		def authResponse = new AuthResponse()
		authResponse.setAuthenticatedIRODSAccount(testAcct)
		authResponse.setAuthenticatingIRODSAccount(testAcct)

		def actual = userService.listUsers(queryString, testAcct)

		assertNotNull(actual)
	}

	void "should list user groups based on query"() {
		IRODSServerProperties irodsServerProperties = IRODSServerProperties.instance(IRODSServerProperties.IcatEnabled.ICAT_ENABLED, 1000, "rods4.1.10", "api1", "zone")
		def queryString = "ab"
		List<UserGroup> users = new ArrayList<UserGroup>()
		def userGroupAO = mockfor(UserGroupAO)
		userGroupAO.demand.findUserGroups{ nm -> return users}

		def irodsAccessObjectFactory = mockFor(IRODSAccessObjectFactory)
		irodsAccessObjectFactory.demand.getUserGroupAO{ irodsAccount -> return userGroupAO.createMock() }
		def iafMock = irodsAccessObjectFactory.createMock()
		UserService userService = new UserService()
		userService.irodsAccessObjectFactory = iafMock

		IRODSAccount testAcct = IRODSAccount.instance("host", 1247, "xxx", "xxx", "xxx", "xxx", "xxx")

		def authResponse = new AuthResponse()
		authResponse.setAuthenticatedIRODSAccount(testAcct)
		authResponse.setAuthenticatingIRODSAccount(testAcct)

		def actual = userService.listUserGroups(queryString, testAcct)

		assertNotNull(actual)
	}

	void "should list users and groups based on query"() {
		IRODSServerProperties irodsServerProperties = IRODSServerProperties.instance(IRODSServerProperties.IcatEnabled.ICAT_ENABLED, 1000, "rods4.1.10", "api1", "zone")
		def queryString = "ab"

		List<UserGroup> userGroups = new ArrayList<UserGroup>()
		def userGroupAO = mockfor(UserGroupAO)
		userGroupAO.demand.findUserGroups{ nm -> return userGroups}

		List<User> users = new ArrayList<User>()
		def userAO = mockfor(UserAO)
		userAO.demand.findByName{ nm -> return users}



		def irodsAccessObjectFactory = mockFor(IRODSAccessObjectFactory)
		irodsAccessObjectFactory.demand.getUserGroupAO{ irodsAccount -> return userGroupAO.createMock() }
		irodsAccessObjectFactory.demand.getUserAO{ irodsAccount -> return userAO.createMock() }

		def iafMock = irodsAccessObjectFactory.createMock()
		UserService userService = new UserService()
		userService.irodsAccessObjectFactory = iafMock

		IRODSAccount testAcct = IRODSAccount.instance("host", 1247, "xxx", "xxx", "xxx", "xxx", "xxx")

		def authResponse = new AuthResponse()
		authResponse.setAuthenticatedIRODSAccount(testAcct)
		authResponse.setAuthenticatingIRODSAccount(testAcct)

		def actual = userService.listUserGroups(queryString, testAcct)

		assertNotNull(actual)
	}
}



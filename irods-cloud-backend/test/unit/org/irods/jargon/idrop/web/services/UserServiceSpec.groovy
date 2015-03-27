package org.irods.jargon.idrop.web.services

import grails.test.mixin.*

import org.codehaus.groovy.grails.plugins.testing.GrailsMockHttpSession
import org.irods.jargon.core.connection.IRODSAccount
import org.irods.jargon.core.connection.IRODSServerProperties
import org.irods.jargon.core.connection.auth.AuthResponse
import org.irods.jargon.core.pub.EnvironmentalInfoAO
import org.irods.jargon.core.pub.IRODSAccessObjectFactory
import org.junit.Before
import org.irods.jargon.idrop.web.services.UserService
import org.irods.jargon.idrop.web.services.EnvironmentServicesService


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
		IRODSServerProperties irodsServerProperties = IRODSServerProperties.instance(IRODSServerProperties.IcatEnabled.ICAT_ENABLED, 100, "v1", "api1", "zone")
		def environmentalInfoAO = mockFor(EnvironmentalInfoAO)
		environmentalInfoAO.demand.getIRODSServerProperties {irodsAccount -> return irodsServerProperties}
		def envMock = environmentalInfoAO.createMock()

		def irodsAccessObjectFactory = mockFor(IRODSAccessObjectFactory)
		irodsAccessObjectFactory.demand.getEnvironmentalInfoAO{irodsAccount -> return envMock}
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
}

package org.irods.jargon.idrop.web.services


import grails.test.mixin.*

import org.irods.jargon.core.connection.IRODSAccount
import org.irods.jargon.core.connection.auth.AuthResponse
import org.irods.jargon.core.pub.IRODSAccessObjectFactory
import org.junit.Before

import spock.lang.Specification


/**
 * See the API for {@link grails.test.mixin.services.ServiceUnitTestMixin} for
 * usage instructions
 */
@TestFor(AuthenticationService)
class AuthenticationServiceTests extends Specification {



	void  "test authenticate irods account"() {

		given:

		AuthResponse authResponse = new AuthResponse()
		def irodsAccessObjectFactory = mockFor(IRODSAccessObjectFactory)
		irodsAccessObjectFactory.demand.authenticateIRODSAccount{irodsAccount -> return authResponse}
		irodsAccessObjectFactory = irodsAccessObjectFactory.createMock()
		AuthenticationService authenticationService = new AuthenticationService()
		authenticationService.irodsAccessObjectFactory = irodsAccessObjectFactory
		IRODSAccount irodsAccount = IRODSAccount.instance("host", 1247,
				"user", "xxx", "", "zone", "")

		when:

		AuthResponse actual = authenticationService.authenticate(irodsAccount)

		then:

		assertNotNull(actual)
		log.info("actual response:${actual}")
	}

	void "test generate an xrsf token"() {
		given:

		AuthenticationService authenticationService = new AuthenticationService()

		when:

		def actual = authenticationService.generateXSRFToken()

		then:

		assertNotNull(actual)
	}
}



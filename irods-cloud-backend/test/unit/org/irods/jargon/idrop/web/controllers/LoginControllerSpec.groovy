package org.irods.jargon.idrop.web.controllers

import grails.test.mixin.*

import org.irods.jargon.core.connection.AuthScheme
import org.irods.jargon.core.connection.IRODSAccount
import org.irods.jargon.core.connection.IRODSServerProperties
import org.irods.jargon.core.connection.auth.AuthResponse
import org.irods.jargon.idrop.web.services.AuthenticationService
import org.irods.jargon.idrop.web.services.EnvironmentServicesService

import spock.lang.Specification

/**
 * See the API for {@link grails.test.mixin.web.ControllerUnitTestMixin} for usage instructions
 */
@TestFor(LoginController)
//@Mock([AuthenticationFilters, ConnectionClosingFilterFilters])

class LoginControllerSpec extends Specification  {

	/*
	 void "test authenticate with a invalid credential"() {
	 given:
	 def authMock = mockFor(AuthenticationService)
	 authMock.demand.authenticate { irodsAccount ->
	 throw new AuthenticationException("no way")
	 }
	 controller.authenticationService = authMock.createMock()
	 mockCommandObject(LoginCommand)
	 Map mp = [host:'', port: 'port', zone:'zone', userName:'userName', password:'password', defaultStorageResource:'defaultresc', authType:AuthScheme.STANDARD]
	 def loginCommand = new LoginCommand(mp) 
	 loginCommand.host = "host"
	 loginCommand.port = 1247
	 loginCommand.zone = "zone"
	 loginCommand.userName = "userName"
	 loginCommand.password = "password"
	 loginCommand.defaultStorageResource = "defaultStorageResource"
	 loginCommand.authType = AuthScheme.STANDARD
	 when:
	 controller.save(loginCommand)
	 then:
	 thrown(AuthenticationException)
	 }
	 */

	/*
	 void "test authenticate with a null command"() {
	 given:
	 def authMock = mockFor(AuthenticationService)
	 controller.authenticationService = authMock.createMock()
	 LoginCommand loginCommand = null
	 when:
	 controller.save(loginCommand)
	 then:
	 thrown(IllegalArgumentException)
	 }
	 */
	void "test authenticate with a valid credential"() {
		given:
		IRODSAccount testAcct = IRODSAccount.instance("host", 1247, "xxx", "xxx", "xxx", "xxx", "xxx")
		def authMock = mockFor(AuthenticationService)
		AuthResponse authResponse = new AuthResponse()
		authResponse.authenticatedIRODSAccount = testAcct
		authResponse.authenticatingIRODSAccount = testAcct
		authMock.demand.authenticate { irodsAccount -> return authResponse }
		def authToken = "foo"
		authMock.demand.generateXSRFToken{->return authToken}

		controller.authenticationService = authMock.createMock()

		IRODSServerProperties irodsServerProperties = IRODSServerProperties.instance(IRODSServerProperties.IcatEnabled.ICAT_ENABLED, 100, "v1", "api1", "zone")

		def envMock = mockFor(EnvironmentServicesService)
		envMock.demand.getIrodsServerProperties { irodsAccount -> return irodsServerProperties}
		controller.environmentServicesService = envMock.createMock()

		Map mp = [host: 'host', port: 1247, zone:'zone', userName:'userName', password:'password', defaultStorageResource:'defaultresc', authType:AuthScheme.STANDARD]

		mockCommandObject(LoginCommand)
		def loginCommand = new LoginCommand(mp)

		loginCommand.validate()

		when: "parameters are sent for login with valid"

		controller.save(loginCommand)

		then:
		controller.response.status == 200
		controller.session.authenticationSession != null
		log.info("response:${response.text}")
		assert '{"defaultStorageResource":"","serverVersion":"v1","userName":"xxx","zone":"xxx"}' == response.text
	}

	void "test authenticate with a missing user gives validation error"() {
		given:
		def authMock = mockFor(AuthenticationService)
		authMock.demand.authenticate { irodsAccount ->
			return new AuthResponse()
		}

		controller.authenticationService = authMock.createMock()

		LoginCommand loginCommand = new LoginCommand()
		loginCommand.host = "host"
		loginCommand.port = 1247
		loginCommand.zone = "zone"
		loginCommand.userName = ""
		loginCommand.password = "password"
		loginCommand.defaultStorageResource = "defaultStorageResource"
		loginCommand.authType = AuthScheme.STANDARD

		assert !loginCommand.validate()
	}
}

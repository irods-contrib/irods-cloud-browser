package org.irods.jargon.idrop.web.services

import org.irods.jargon.core.connection.IRODSServerProperties
import org.irods.jargon.core.pub.IRODSAccessObjectFactory
import org.irods.jargon.idrop.web.authsession.UserSessionContext

class UserService {

	IRODSAccessObjectFactory irodsAccessObjectFactory
	EnvironmentServicesService environmentServicesService


	/**
	 * Get the logged in identity from the session information
	 * @return
	 */
	def getLoggedInIdentity(session) {

		if (!session) {
			throw new IllegalArgumentException("no session provided")
		}

		def authResponse =  session.authenticationSession

		if (!authResponse) {
			return null
		}

		UserSessionContext userSessionContext = new UserSessionContext()
		userSessionContext.userName = authResponse.authenticatedIRODSAccount.userName
		userSessionContext.zone = authResponse.authenticatedIRODSAccount.zone

		log.info("getting irodsServerProperties")

		IRODSServerProperties irodsServerProperties = environmentServicesService.getIrodsServerProperties(authResponse.authenticatedIRODSAccount)

		userSessionContext.defaultStorageResource = authResponse.authenticatedIRODSAccount.defaultStorageResource
		userSessionContext.serverVersion = irodsServerProperties.relVersion
		return userSessionContext
	}
}

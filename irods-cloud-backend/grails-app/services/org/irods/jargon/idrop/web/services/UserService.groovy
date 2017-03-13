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
		userSessionContext.serverVersion = irodsServerProperties.apiVersion
		return userSessionContext
	}

	/**
	 * List all the users based on the (optional) search term
	 * @param userSearchTerm 
	 * @param irodsAccount
	 * @return
	 */
	def listUsers(userSearchTerm, irodsAccount) {

		log.info("listUsers()")

		if (!userSearchTerm) {
			userSearchTerm = ""
		}

		if (!irodsAccount) {
			throw new IllegalArgumentException("irodsAccount")
		}

		log.info("userSearchTerm:${userSearchTerm}")

		def userAO = irodsAccessObjectFactory.getUserAO(irodsAccount)
		return userAO.findUsersLike(userSearchTerm)
	}

	/**
	 * List user groups by search term, blank term lists all
	 * @param userSearchTerm
	 * @param irodsAccount
	 * @return
	 */
	def listUserGroups(userSearchTerm, irodsAccount) {
		log.info("listUserGroups()")
		if (!userSearchTerm) {
			userSearchTerm = ""
		}

		if (!irodsAccount) {
			throw new IllegalArgumentException("irodsAccount")
		}

		log.info("userSearchTerm:${userSearchTerm}")

		def userGroupAO = irodsAccessObjectFactory.getUserGroupAO(irodsAccount)
		return userGroupAO.findUserGroups(userSearchTerm)
		//return userGroupAO.
	}
}

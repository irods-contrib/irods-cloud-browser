package org.irods.jargon.idrop.web.services

import java.security.SecureRandom

import org.irods.jargon.core.connection.IRODSAccount
import org.irods.jargon.core.connection.auth.AuthResponse
import org.irods.jargon.core.pub.IRODSAccessObjectFactory
import org.irods.jargon.core.utils.Base64

class AuthenticationService {

	static transactional = false

	IRODSAccessObjectFactory irodsAccessObjectFactory

	SecureRandom secureRandom = new SecureRandom()

	def authenticate(IRODSAccount irodsAccount) {

		log.info("authenticate()")
		if (!irodsAccount) {
			throw new IllegalArgumentException("null irodsAccount")
		}

		log.info("IRODSAccount ${irodsAccount}")
		AuthResponse authResponse = irodsAccessObjectFactory.authenticateIRODSAccount(irodsAccount)

		log.info("authenticated successfully")
		return authResponse
	}

	/**
	 * Generate a random token for use in XSRF headers
	 * @return <code>String</code> with a Base64 encoded random token
	 */
	def generateXSRFToken() {
		log.info("genratingXSRFToken()")
		byte[] randByte = new byte[256]
		secureRandom.nextBytes(randByte)
		return Base64.toString(randByte)
	}
}

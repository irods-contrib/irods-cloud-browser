package org.irods.jargon.idrop.web.controllers


import grails.converters.JSON
import grails.rest.RestfulController

import javax.servlet.http.Cookie

import org.irods.jargon.core.connection.AuthScheme
import org.irods.jargon.core.connection.IRODSAccount
import org.irods.jargon.core.connection.IRODSServerProperties
import org.irods.jargon.core.connection.auth.AuthResponse
import org.irods.jargon.core.exception.JargonException
import org.irods.jargon.core.pub.IRODSAccessObjectFactory
import org.irods.jargon.idrop.web.authsession.UserSessionContext
import org.irods.jargon.idrop.web.services.AuthenticationService
import org.irods.jargon.idrop.web.services.EnvironmentServicesService
import org.irods.jargon.idrop.web.utils.SessionUtils
/**
 * Handle logout management
 */
class LogoutController extends RestfulController {

	static responseFormats = ['json']

	IRODSAccessObjectFactory irodsAccessObjectFactory
	AuthenticationService authenticationService
	EnvironmentServicesService environmentServicesService


	/**
	 * POST action will cause a logout
	 */
	def save() {
		SessionUtils.clearState(session)
		session.invalidate()
		log.info("done")
		render(status:204)
	}
}

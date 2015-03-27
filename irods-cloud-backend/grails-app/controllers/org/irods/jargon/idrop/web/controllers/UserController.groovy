package org.irods.jargon.idrop.web.controllers

import grails.converters.JSON
import grails.rest.RestfulController

import org.irods.jargon.core.pub.IRODSAccessObjectFactory
import org.irods.jargon.idrop.web.services.UserService

class UserController extends RestfulController {

	static responseFormats = ['json']
	IRODSAccessObjectFactory irodsAccessObjectFactory
	UserService userService

	/**
	 * Retrieve info on logged in user, eventually expanding to include profile info
	 */
	def index() {
		log.info("index()")
		def irodsAccount = request.irodsAccount
		if (!irodsAccount) throw new IllegalStateException("null irodsAccount")

		render userService.getLoggedInIdentity(session) as JSON
	}
}

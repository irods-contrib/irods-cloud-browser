package org.irods.jargon.idrop.web.controllers

import grails.converters.JSON
import grails.rest.RestfulController

import org.irods.jargon.core.pub.IRODSAccessObjectFactory
import org.irods.jargon.idrop.web.services.AclService

/**
 * Controller for ACL operations
 * @author Mike Conway - DICE
 *
 */
class AclController extends RestfulController {

	static responseFormats = ['json']
	IRODSAccessObjectFactory irodsAccessObjectFactory
	AclService aclService

	/**
	 * Obtain a listing of acls for an iRODS path, maps to a GET
	 *
	 * @return
	 */
	def show() {
		log.info("show")
		def irodsAccount = request.irodsAccount
		if (!irodsAccount) throw new IllegalStateException("no irodsAccount in request")

		def path = params.path
		if (!path) path = ""

		log.info("path:${path}")
		def aclListing = aclService.listUserAcls(path, irodsAccount)
		log.info("acls:${aclListing}")
		render aclListing as JSON
	}

	def index() { }
}

package org.irods.jargon.idrop.web.controllers

import grails.converters.JSON
import grails.rest.RestfulController

import org.irods.jargon.core.exception.JargonException
import org.irods.jargon.core.protovalues.FilePermissionEnum
import org.irods.jargon.core.pub.IRODSAccessObjectFactory
import org.irods.jargon.idrop.web.services.AclService
import org.irods.jargon.idrop.web.services.UserService

/**
 * Controller for ACL operations
 * @author Mike Conway - DICE
 *
 */
class AclController extends RestfulController {

	static responseFormats = ['json']
	IRODSAccessObjectFactory irodsAccessObjectFactory
	AclService aclService
	UserService userService

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

	/**
	 * POST method to update acls
	 */
	def save() {
		log.info("save")
		def irodsAccount = request.irodsAccount
		if (!irodsAccount) throw new IllegalStateException("no irodsAccount in request")

		def path = params.path
		if (!path) path = ""

		log.info("path:${path}")

		def userName = params.userName
		if (!userName) userName = ""

		log.info("userName:${userName}")

		def zone = params.zone
		if (!zone) zone = ""

		log.info("zone:${zone}")

		def permission = params.permission
		if (!permission) permission = ""

		log.info("permission:${permission}")

		def fileAccessPermission
		if (permission == "READ") {
			fileAccessPermission = FilePermissionEnum.READ
		} else if (permission == "WRITE") {
			fileAccessPermission = FilePermissionEnum.WRITE
		} else if (permission == "OWN") {
			fileAccessPermission = FilePermissionEnum.OWN
		} else if (permission == "NONE") {
			fileAccessPermission = FilePermissionEnum.NONE
		} else {
			log.error("unknown file permission:${permission}")
			throw new JargonException("unknown file permission")
		}

		def recursive = params.recursive
		if (!recursive) recursive = false

		log.info("recursive:${recursive}")

		log.info("updating...")
		userService.setAcl(zone, path,userName, fileAccessPermission, recursive, irodsAccount)
	}
}

package org.irods.jargon.idrop.web.controllers

import grails.converters.JSON
import grails.rest.RestfulController

import org.irods.jargon.core.exception.JargonException
import org.irods.jargon.core.pub.IRODSAccessObjectFactory
import org.irods.jargon.idrop.web.services.VirtualCollectionService

/**
 * Handle iRODS virtual collections
 */
class VirtualCollectionController extends RestfulController {

	static responseFormats = ['json']
	IRODSAccessObjectFactory irodsAccessObjectFactory
	VirtualCollectionService virtualCollectionService

	/**
	 * Get user listing of virtual collections, responds to a get with no vc name
	 */
	def index() {
		log.info("index()...get virtual collections for user")
		def irodsAccount = request.irodsAccount
		if (!irodsAccount) throw new IllegalStateException("no irodsAccount in request")
		log.info("getting virtual colls")
		def virColls = virtualCollectionService.virtualCollectionHomeListingForUser(irodsAccount,session)
		log.info("virColls:${virColls}")
		render virColls as JSON
	}

	/**
	 * Get info on a particular virtual collection, responds to a get with a vc name included
	 */
	def show() {
		log.info("index()...get virtual collections for user")
		def irodsAccount = request.irodsAccount
		if (!irodsAccount) throw new IllegalStateException("no irodsAccount in request")

		def vcName = params.name

		if (!vcName) {
			log.error("missing vcName")
			throw new JargonException("missing virtualCollection")
		}

		log.info("vcName:${vcName}")

		def virtualCollection = virtualCollectionService.virtualCollectionDetails(vcName, irodsAccount, session)
		log.info("virtualCollection:${virtualCollection}")
		render virtualCollection as JSON
	}
}

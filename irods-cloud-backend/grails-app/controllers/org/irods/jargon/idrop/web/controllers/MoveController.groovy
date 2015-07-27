package org.irods.jargon.idrop.web.controllers

import org.irods.jargon.core.pub.IRODSAccessObjectFactory
import org.irods.jargon.idrop.web.services.FileService
import grails.converters.JSON


/**
 * Controller for move operations
 * <p/>
 * For the backend, we are not striving for purity of REST, sorry...we have a REST API for that.  What we want here are minimal sized controllers with minimal manipulation needed
 * from the javascript side, so small controllers, simple urls, simple parameters are the rule
 * 
 * @author Mike Conway - DICE
 *
 */
class MoveController {

	static responseFormats = ['json']
	FileService fileService
	IRODSAccessObjectFactory irodsAccessObjectFactory

	/**
	 * POST method causes a move to be made
	 *
	 * Modes
	 *
	 *<ul>
	 *<li>
	 * source moved to target, resource can be provided
	 *</li>
	 *<li>
	 * source, no target, resource provided this is a phymove
	 *</li>
	 *<li>
	 * source, same target, resource provided, this is a phymove
	 *</li>
	 *</ul>
	 * otherwise it's an error
	 * @return
	 */
	def save() {
		log.info("save()")
		log.info("move action")
		def irodsAccount = request.irodsAccount
		if (!irodsAccount) throw new IllegalStateException("no irodsAccount in request")

		def sourcePath = params.sourcePath
		if (!sourcePath) {
			throw new IllegalArgumentException("null sourcePath")
		}

		def resource = params.resource
		if (!resource) {
			log.info("no resource, assume blank")
			resource = ""
		}

		log.info("sourcePath:${sourcePath}")

		def targetPath = params.targetPath
		if (!targetPath) {
			targetPath = ""
		}

		/*
		 def overwrite = params.overwrite
		 if (!overwrite) {
		 log.info("overwrite not specified, assume false")
		 overwrite = false
		 }*/

		log.info("targetPath:${targetPath}")

		def listingEntry = fileService.move(sourcePath, targetPath, resource,  irodsAccount)
		log.info("move completed to ${listingEntry}")
		render listingEntry as JSON
	}
}

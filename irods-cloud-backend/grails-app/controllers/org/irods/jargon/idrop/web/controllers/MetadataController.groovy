package org.irods.jargon.idrop.web.controllers

import grails.converters.JSON

import org.irods.jargon.core.pub.IRODSAccessObjectFactory

/**
 * Controller for metadata operations
 * l controllers, simple urls, simple parameters are the rule
 * 
 * @author Mike Conway - DICE
 *
 */
class MetadataController {

	static responseFormats = ['json']
	IRODSAccessObjectFactory irodsAccessObjectFactory

	/**
	 * POST method 
	 */
	def save() {
		log.info("save()")
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

		def overwrite = params.overwrite
		if (!overwrite) {
			log.info("overwrite not specified, assume false")
			overwrite = false
		}

		log.info("targetPath:${targetPath}")

		def listingEntry = fileService.move(resource, targetPath, resource,  irodsAccount)
		log.info("move completed to ${listingEntry}")
		render listingEntry as JSON
	}
}

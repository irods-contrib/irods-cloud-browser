package org.irods.jargon.idrop.web.controllers

import grails.converters.JSON

import org.irods.jargon.idrop.web.services.FileService

/**
 * Handles renames of files and folders
 * <p/>
 * Yes, this is not 'pure' REST.  We've opted for smaller/tighter controllers and not a lot of parameter gymnastics.  If you want pure REST, use the REST api!
 * 
 * @author Mike Conway - DICE
 *
 */
class RenameController {
	FileService fileService

	/**
	 * POST will be a rename action, this renames a file in the same parent collection as the given new name
	 * @return
	 */
	def save() {
		log.info("save()")
		def irodsAccount = request.irodsAccount
		if (!irodsAccount) throw new IllegalStateException("no irodsAccount in request")
		def path = params.path
		if (!path) {
			throw new IllegalArgumentException("path is missing")
		}
		def newName = params.newName
		if (!newName) {
			throw new IllegalArgumentException("newName is missing")
		}
		def listingEntry = fileService.rename(path, newName, irodsAccount)
		log.info("renamed to:${listingEntry}")
		render listingEntry as JSON
	}
}

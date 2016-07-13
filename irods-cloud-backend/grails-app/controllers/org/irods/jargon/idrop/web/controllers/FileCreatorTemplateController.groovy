package org.irods.jargon.idrop.web.controllers

import grails.converters.JSON
import grails.rest.RestfulController

import org.irods.jargon.core.pub.IRODSAccessObjectFactory
import org.irods.jargon.idrop.web.services.FileCreatorTemplateService

/**
 * Controller for functions to list file templates and create new files based on those templates.  For example, create a new XML file and place
 * in irods with starter data
 * @author Mike Conway - DICE
 *
 */
class FileCreatorTemplateController extends RestfulController {
	static responseFormats = ['json']
	IRODSAccessObjectFactory irodsAccessObjectFactory
	FileCreatorTemplateService fileCreatorTemplateService

	def index() {
		log.info("index()")
		show()
	}
	/**
	 * GET operation gets the list of available templates
	 * @return
	 */
	def show() {
		log.info("index() gets list of templates")
		def irodsAccount = request.irodsAccount
		if (!irodsAccount) throw new IllegalStateException("no irodsAccount in request")
		render fileCreatorTemplateService.listAllTemplates(irodsAccount) as JSON
	}

	/**
	 * PUT method to add a new file by type
	 * params:
	 *  parentPath
	 *  fileName
	 *  templateUniqueIdentifier
	 * @return
	 */
	def update() {
		log.info("update() for PUT")
		def irodsAccount = request.irodsAccount
		if (!irodsAccount) throw new IllegalStateException("no irodsAccount in request")

		def parentPath = params.parentPath
		if (!parentPath) {
			throw new IllegalArgumentException("null parentPath")
		}

		def fileName = params.fileName
		if (!fileName) {
			throw new IllegalArgumentException("null fileName")
		}

		def templateUniqueIdentifier = params.templateUniqueIdentifier
		if (!templateUniqueIdentifier) {
			throw new IllegalArgumentException("null templateUniqueIdentifier")
		}

		log.info("parentPath:${parentPath}")
		log.info("fileName:${fileName}")
		log.info("templateUniqueIdentifier:${templateUniqueIdentifier}")

		def templateCreatedFile = fileCreatorTemplateService.createFileByTemplate(irodsAccount, parentPath, fileName, templateUniqueIdentifier)
		log.info("templateCreatedFile:${templateCreatedFile}")
		render templateCreatedFile as JSON
	}
}

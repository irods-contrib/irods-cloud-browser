package org.irods.jargon.idrop.web.services

import org.irods.jargon.core.connection.IRODSAccount
import org.irods.jargon.core.pub.IRODSAccessObjectFactory
import org.irods.jargon.filetemplate.FileTemplateService


/**
 * Service for listing available file templates and creating files based on those templates.  Templates are simply
 * a device for creating new files of a given type with the ability to define a template that prefills a file with data.
 * 
 * @author Mike Conway
 *
 */class FileCreatorTemplateService {

	static transactional = false
	IRODSAccessObjectFactory irodsAccessObjectFactory
	JargonServiceFactoryService jargonServiceFactoryService

	/**
	 * List all file templates
	 * @param irodsAccount
	 * @return
	 */
	def listAllTemplates(IRODSAccount irodsAccount) {

		log.info("listAlltemplates()")


		if (!irodsAccount) {
			throw new IllegalArgumentException("null irodsAccount")
		}

		FileTemplateService fileTemplateService = jargonServiceFactoryService.instanceFileTemplateService(irodsAccount)
		return fileTemplateService.listAvailableFileTemplates()
	}

	/**
	 * Create a new file with the given template
	 * @param irodsAccount
	 * @param parentPath
	 * @param fileName
	 * @param templateUniqueId
	 * @return
	 */
	def createFileByTemplate(IRODSAccount irodsAccount, String parentPath, String fileName, String templateUniqueId) {

		log.info("createFileByTemplate()")

		if (!irodsAccount) {
			throw new IllegalArgumentException("null irodsAccount")
		}

		if (!parentPath) {
			throw new IllegalArgumentException("null or empty parentPath")
		}

		if (!fileName) {
			throw new IllegalArgumentException("null or empty fileName")
		}

		if (!templateUniqueId) {
			throw new IllegalArgumentException("null or empty templateUniqueId")
		}

		log.info("parentPath:${parentPath}")
		log.info("fileName:${fileName}")
		log.info("templateUniqueId:${templateUniqueId}")

		FileTemplateService fileTemplateService = jargonServiceFactoryService.instanceFileTemplateService(irodsAccount)
		return fileTemplateService.createFileBasedOnTemplateUniqueIdentifier(parentPath, fileName, templateUniqueId)
	}
}

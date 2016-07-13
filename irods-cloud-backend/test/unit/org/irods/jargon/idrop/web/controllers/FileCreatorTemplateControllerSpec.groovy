package org.irods.jargon.idrop.web.controllers

import grails.test.mixin.*

import org.irods.jargon.core.connection.IRODSAccount
import org.irods.jargon.filetemplate.FileTemplate
import org.irods.jargon.filetemplate.TemplateCreatedFile
import org.irods.jargon.idrop.web.services.FileCreatorTemplateService

import spock.lang.Specification

/**
 * See the API for {@link grails.test.mixin.web.ControllerUnitTestMixin} for usage instructions
 */
@TestFor(FileCreatorTemplateController)
class FileCreatorTemplateControllerSpec extends Specification {

	def setup() {
	}

	def cleanup() {
	}

	void "should list all available templates"() {

		given:
		IRODSAccount testAccount = IRODSAccount.instance("host", 1247, "user", "password", "","zone", "")
		request.irodsAccount = testAccount
		def fileCreatorTemplateService = mockFor(FileCreatorTemplateService)
		FileTemplate fileTemplate = new FileTemplate()
		fileTemplate.defaultExtension = ".txt"
		fileTemplate.i18nTemplateName = "template.text"
		fileTemplate.infoType = ""
		fileTemplate.mimeType = "text/plain"
		fileTemplate.templateName = "text.template"
		fileTemplate.templateUniqueIdentifier = "a.unique.name"
		def templates = new ArrayList<FileTemplate>()
		templates.add(fileTemplate)
		fileCreatorTemplateService.demand.listAllTemplates{ia -> return templates}
		def serviceMock =
				controller.fileCreatorTemplateService = fileCreatorTemplateService.createMock()

		when:
		controller.index()

		then:

		controller.response.status == 200
		controller.response.text != null
		log.info("responseText:${response.text}")
	}

	void "should add a file based on a template"() {
		given:

		def parentPath = "/a/path"
		def fileName = "fileName"
		def templateUniqueId = "unique.id"

		TemplateCreatedFile templateCreatedFile = new TemplateCreatedFile()
		templateCreatedFile.fileName = fileName
		templateCreatedFile.fileTemplate = new FileTemplate()
		templateCreatedFile.parentCollectionAbsolutePath = parentPath

		def fileCreatorTemplateService = mockFor(FileCreatorTemplateService)
		fileCreatorTemplateService.demand.createFileByTemplate{ia, ppath, fname, id -> return templateCreatedFile}
		def serviceMock =
				controller.fileCreatorTemplateService = fileCreatorTemplateService.createMock()



		IRODSAccount testAccount = IRODSAccount.instance("host", 1247, "user", "password", "","zone", "")
		request.irodsAccount = testAccount
		params.parentPath = parentPath
		params.fileName = fileName
		params.templateUniqueIdentifier = templateUniqueId


		when:
		controller.update()

		then:
		controller.response.status == 200
	}
}

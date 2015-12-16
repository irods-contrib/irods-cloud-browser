package org.irods.jargon.idrop.web.services

import grails.test.mixin.TestFor

import org.irods.jargon.core.connection.IRODSAccount
import org.irods.jargon.core.pub.IRODSAccessObjectFactory
import org.irods.jargon.filetemplate.FileTemplate
import org.irods.jargon.filetemplate.FileTemplateService

import spock.lang.Specification

/**
 * See the API for {@link grails.test.mixin.services.ServiceUnitTestMixin} for usage instructions
 */
@TestFor(FileCreatorTemplateService)
class FileCreatorTemplateServiceSpec extends Specification {

	void "should get a list of templates"() {
		given:
		IRODSAccount irodsAccount = IRODSAccount.instance("host", 1247, "user", "password", "", "zone", "")
		String absPath = "/a/b/c.txt"
		def irodsAccessObjectFactory = mockFor(IRODSAccessObjectFactory)
		def irodsAccessObjectFactoryMock = irodsAccessObjectFactory.createMock()

		def fileTemplateService = mockFor(FileTemplateService)
		def fileTemplates = new ArrayList<FileTemplate>()
		fileTemplateService.demand.listAvailableFileTemplates{-> return fileTemplates}
		def fileTemplateServiceMock = fileTemplateService.createMock()

		def jargonServiceFactoryService = mockFor(JargonServiceFactoryService)
		jargonServiceFactoryService.demand.instanceFileTemplateService{act1 -> return fileTemplateServiceMock}
		def jargonServiceFactoryServiceMock = jargonServiceFactoryService.createMock()

		def fileCreatorTemplateService = new FileCreatorTemplateService()
		fileCreatorTemplateService.irodsAccessObjectFactory = irodsAccessObjectFactoryMock
		fileCreatorTemplateService.jargonServiceFactoryService = jargonServiceFactoryServiceMock


		when:

		def actual = fileCreatorTemplateService.listAlltemplates(irodsAccount)

		then:

		actual != null
	}
}

package org.irods.jargon.idrop.web.controllers

import grails.test.mixin.*

import org.irods.jargon.core.connection.IRODSAccount
import org.irods.jargon.idrop.web.services.FileService

import spock.lang.Specification

/**
 * See the API for {@link grails.test.mixin.web.ControllerUnitTestMixin} for usage instructions
 */
@TestFor(FileEditController)
class FileEditControllerSpec extends Specification {

	def "should get string from file"() {
		given:

		def data = "xxxxx"
		def fileService = mockFor(FileService)
		fileService.demand.stringFromFile{pth, ia -> return data}
		controller.fileService = fileService.createMock()


		IRODSAccount testAccount = IRODSAccount.instance("host", 1247, "user", "password", "","zone", "")
		request.irodsAccount = testAccount
		params.irodsPath = "/a/path"

		when:
		controller.show()

		then:
		controller.response.status == 200
		log.info("responseText:${response.text}")
		response.text.length() > 0
	}

	def "should put string to file"() {
		given:

		def data = "xxxxx"
		def path = "/a/path"
		def fileService = mockFor(FileService)
		fileService.demand.stringToFile{dta, pth, ia -> return data}
		controller.fileService = fileService.createMock()


		IRODSAccount testAccount = IRODSAccount.instance("host", 1247, "user", "password", "","zone", "")
		request.irodsAccount = testAccount
		params.irodsPath = path
		params.data = data

		when:
		controller.save()

		then:
		controller.response.status == 200
	}
}

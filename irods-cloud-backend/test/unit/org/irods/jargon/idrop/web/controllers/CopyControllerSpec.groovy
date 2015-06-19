package org.irods.jargon.idrop.web.controllers

import grails.test.mixin.*

import org.irods.jargon.core.connection.IRODSAccount
import org.irods.jargon.core.query.CollectionAndDataObjectListingEntry
import org.irods.jargon.idrop.web.services.FileService

import spock.lang.Specification

/**
 * See the API for {@link grails.test.mixin.web.ControllerUnitTestMixin} for usage instructions
 */
@TestFor(CopyController)
class CopyControllerSpec extends Specification {

	void "test copy"() {

		given:

		def fileService = mockFor(FileService)
		def entry = new CollectionAndDataObjectListingEntry()
		fileService.demand.copy{sourcePath, targetPath, resc, overwrite, irodsAccount -> return entry}
		controller.fileService = fileService.createMock()

		def testAccount = IRODSAccount.instance("host", 1247, "user", "password", "","zone", "")
		request.irodsAccount = testAccount
		params.sourcePath = "/a/path"
		params.targetPath = "/another/path"
		params.overwrite = true

		when:
		controller.save()

		then:
		controller.response.status == 200
		log.info("responseText:${response.text}")
	}
}

package org.irods.jargon.idrop.web.controllers

import grails.test.mixin.*

import org.irods.jargon.core.connection.IRODSAccount
import org.irods.jargon.core.query.CollectionAndDataObjectListingEntry
import org.irods.jargon.idrop.web.services.FileService

import spock.lang.Specification

/**
 * See the API for {@link grails.test.mixin.web.ControllerUnitTestMixin} for usage instructions
 */
@TestFor(MoveController)
class MoveControllerSpec extends Specification {

	void "test move"() {

		given:

		def fileService = mockFor(FileService)
		def entry = new CollectionAndDataObjectListingEntry()
		fileService.demand.move{sourcePath, targetPath, resc, irodsAccount -> return entry}
		controller.fileService = fileService.createMock()

		def testAccount = IRODSAccount.instance("host", 1247, "user", "password", "","zone", "")
		request.irodsAccount = testAccount
		params.sourcePath = "/a/path"
		params.targetPath = "/another/path"

		when:
		controller.save()

		then:
		controller.response.status == 200
		log.info("responseText:${response.text}")
	}

	void "test phymove"() {

		given:

		def fileService = mockFor(FileService)
		def entry = new CollectionAndDataObjectListingEntry()
		fileService.demand.move{sourcePath, targetPath, resc, irodsAccount -> return entry}
		controller.fileService = fileService.createMock()

		def testAccount = IRODSAccount.instance("host", 1247, "user", "password", "","zone", "")
		request.irodsAccount = testAccount
		params.sourcePath = "/a/path"
		params.targetPath = ""
		params.resource = "resc"
		when:
		controller.save()

		then:
		controller.response.status == 200
		log.info("responseText:${response.text}")
	}
}

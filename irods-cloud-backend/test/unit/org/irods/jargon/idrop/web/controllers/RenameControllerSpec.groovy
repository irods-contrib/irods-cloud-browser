package org.irods.jargon.idrop.web.controllers

import grails.test.mixin.TestFor

import org.irods.jargon.core.connection.IRODSAccount
import org.irods.jargon.core.query.CollectionAndDataObjectListingEntry
import org.irods.jargon.idrop.web.services.FileService

import spock.lang.Specification

/**
 * See the API for {@link grails.test.mixin.web.ControllerUnitTestMixin} for usage instructions
 */
@TestFor(RenameController)
class RenameControllerSpec extends Specification {

	void "rename returns a listing entry"() {
		given:

		def fileService = mockFor(FileService)
		def listingEntry = new CollectionAndDataObjectListingEntry()
		fileService.demand.rename{path, newpath, irodsAccount -> return listingEntry}
		controller.fileService = fileService.createMock()

		IRODSAccount testAccount = IRODSAccount.instance("host", 1247, "user", "password", "","zone", "")
		request.irodsAccount = testAccount
		params.path = "/a/path"
		params.newName = "newPath"

		when:
		controller.save()

		then:
		controller.response.status == 200
		controller.response.text != null
		log.info("responseText:${response.text}")
	}
}

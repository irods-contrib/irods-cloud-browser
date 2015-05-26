package org.irods.jargon.idrop.web.controllers

import grails.test.mixin.*

import org.irods.jargon.core.connection.IRODSAccount
import org.irods.jargon.core.query.CollectionAndDataObjectListingEntry
import org.irods.jargon.dataprofile.DataProfile
import org.irods.jargon.idrop.web.services.DataProfileMidTierService
import org.irods.jargon.idrop.web.services.FileService
import org.junit.*

import spock.lang.Specification

/**
 * See the API for {@link grails.test.mixin.web.ControllerUnitTestMixin} for usage instructions
 */
@TestFor(FileController)
class FileControllerSpec extends Specification {

	void "shold get a collection object for a path"() {
		given:

		def fileService = mockFor(FileService)
		org.irods.jargon.core.pub.domain.Collection collection = new org.irods.jargon.core.pub.domain.Collection()
		fileService.demand.retrieveCatalogInfoForPath{path, irodsAccount -> return collection}
		controller.fileService = fileService.createMock()

		DataProfile dataProfile = new DataProfile()
		def dataProfileMidTierService = mockFor(DataProfileMidTierService)
		dataProfileMidTierService.demand.retrieveDataProfile{pathval, irodsAccountVal -> return dataProfile}
		def dataProfileMidTierServiceMock = dataProfileMidTierService.createMock()
		controller.dataProfileMidTierService = dataProfileMidTierServiceMock

		IRODSAccount testAccount = IRODSAccount.instance("host", 1247, "user", "password", "","zone", "")
		request.irodsAccount = testAccount
		params.path = "/a/path"


		when:
		controller.index()

		then:
		controller.response.status == 200
		log.info("responseText:${response.text}")
	}

	void "shold create new folder and return a listing"() {
		given:

		def fileService = mockFor(FileService)
		def listingEntry = new CollectionAndDataObjectListingEntry()
		fileService.demand.newFolder{path, irodsAccount -> return listingEntry}
		controller.fileService = fileService.createMock()

		IRODSAccount testAccount = IRODSAccount.instance("host", 1247, "user", "password", "","zone", "")
		request.irodsAccount = testAccount
		params.path = "/a/path"
		params.collection = true


		when:
		controller.update()

		then:
		controller.response.status == 200
		controller.response.text != null
		log.info("responseText:${response.text}")
	}


	void "shold get delete for a single path path"() {
		given:

		def fileService = mockFor(FileService)
		fileService.demand.delete{path, force, irodsAccount -> }
		controller.fileService = fileService.createMock()

		IRODSAccount testAccount = IRODSAccount.instance("host", 1247, "user", "password", "","zone", "")
		request.irodsAccount = testAccount
		params.path = "/a/path"
		params.force = false


		when:
		controller.delete()

		then:
		controller.response.status == 204
	}

	void "shold get delete for a multiple paths"() {
		given:

		def fileService = mockFor(FileService)
		fileService.demand.delete{path, force, irodsAccount -> }
		controller.fileService = fileService.createMock()

		IRODSAccount testAccount = IRODSAccount.instance("host", 1247, "user", "password", "","zone", "")
		request.irodsAccount = testAccount
		params.path = ["path", "path"]
		params.force = false


		when:
		controller.delete()

		then:
		controller.response.status == 204
	}
}

package org.irods.jargon.idrop.web.controllers

import grails.test.mixin.*

import org.irods.jargon.core.connection.IRODSAccount
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
}

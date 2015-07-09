package org.irods.jargon.idrop.web.controllers



import grails.test.mixin.*

import org.irods.jargon.core.connection.IRODSAccount
import org.irods.jargon.core.pub.domain.AvuData
import org.irods.jargon.idrop.web.services.MetadataService
import org.junit.*

import spock.lang.Specification

/**
 * See the API for {@link grails.test.mixin.web.ControllerUnitTestMixin} for usage instructions
 */
@TestFor(MetadataController)
class MetadataControllerSpec extends Specification {

	void "should add an avu to a collection"() {
		given:

		def path = "/a/path"
		def attrib = "attr"
		def value = "value"
		def unit = "unit"
		def avuData = AvuData.instance(attrib, value, unit)
		def metadataService = mockFor(MetadataService)
		metadataService.demand.addAvu{path1,avuData1, irodsAccount1->}
		def metadataServiceMock = metadataService.createMock()

		IRODSAccount testAccount = IRODSAccount.instance("host", 1247, "user", "password", "","zone", "")
		request.irodsAccount = testAccount
		params.irodsAbsolutePath = path
		params.attribute = attrib
		params.value = value
		params.unit = unit
		controller.metadataService = metadataServiceMock

		when:
		controller.update()

		then:
		controller.response.status == 200
	}

	void "should add an avu to a collection blank unit"() {
		given:

		def path = "/a/path"
		def attrib = "attr"
		def value = "value"
		def unit = ""
		def avuData = AvuData.instance(attrib, value, unit)
		def metadataService = mockFor(MetadataService)
		metadataService.demand.addAvu{path1,avuData1, irodsAccount1->}
		def metadataServiceMock = metadataService.createMock()

		IRODSAccount testAccount = IRODSAccount.instance("host", 1247, "user", "password", "","zone", "")
		request.irodsAccount = testAccount
		params.irodsAbsolutePath = path
		params.attribute = attrib
		params.value = value
		params.unit = unit
		controller.metadataService = metadataServiceMock

		when:
		controller.update()

		then:
		controller.response.status == 200
	}

	void "should delete an avu from a collection blank unit"() {
		given:

		def path = "/a/path"
		def attrib = "attr"
		def value = "value"
		def unit = ""
		def avuData = AvuData.instance(attrib, value, unit)
		def metadataService = mockFor(MetadataService)
		metadataService.demand.deleteAvu{path1,avuData1, irodsAccount1->}
		def metadataServiceMock = metadataService.createMock()

		IRODSAccount testAccount = IRODSAccount.instance("host", 1247, "user", "password", "","zone", "")
		request.irodsAccount = testAccount
		params.irodsAbsolutePath = path
		params.attribute = attrib
		params.value = value
		params.unit = unit
		controller.metadataService = metadataServiceMock

		when:
		controller.delete()

		then:
		controller.response.status == 204
	}

	void "should update an avu for a collection"() {
		given:

		def path = "/a/path"
		def attrib = "attr"
		def value = "value"
		def unit = ""
		def newAttrib = "attr"
		def newValue = "value"
		def newUnit = "hello"
		def avuData = AvuData.instance(attrib, value, unit)
		def avuData2 = AvuData.instance(newAttrib, newValue, newUnit)
		def metadataService = mockFor(MetadataService)
		metadataService.demand.updateAvu{path1,avuData1,avuData1n, irodsAccount1->}
		def metadataServiceMock = metadataService.createMock()

		IRODSAccount testAccount = IRODSAccount.instance("host", 1247, "user", "password", "","zone", "")
		request.irodsAccount = testAccount
		params.irodsAbsolutePath = path
		params.attribute = attrib
		params.value = value
		params.unit = unit
		params.newAttribute = attrib
		params.newValue = value
		params.newUnit = unit
		controller.metadataService = metadataServiceMock

		when:
		controller.save()

		then:
		controller.response.status == 200
	}
}

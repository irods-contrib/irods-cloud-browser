package org.irods.jargon.idrop.web.controllers

import grails.converters.JSON
import grails.test.mixin.*

import org.irods.jargon.core.connection.IRODSAccount
import org.irods.jargon.idrop.web.services.MetadataQueryService

import spock.lang.Specification

/**
 * See the API for {@link grails.test.mixin.web.ControllerUnitTestMixin} for usage instructions
 */
@TestFor(MetadataQueryController)
class MetadataQueryControllerSpec extends Specification {

	void "should post a query"() {
		given:


		def metadataQueryService = mockFor(MetadataQueryService)

		def metadataQueryVcName = new MetadataQueryVcName()
		metadataQueryService.demand.storeMetadataQuery{ qry, irodsAccount1, typ-> return metadataQueryVcName}

		def metadataQueryServiceMock = metadataQueryService.createMock()

		IRODSAccount testAccount = IRODSAccount.instance("host", 1247, "user", "password", "","zone", "")
		request.irodsAccount = testAccount
		request.JSON = metadataQueryVcName as JSON

		controller.metadataQueryService = metadataQueryServiceMock

		when:
		controller.save()

		then:
		log.info("controller response:${controller.response.text}")
		controller.response.text != null
	}
}

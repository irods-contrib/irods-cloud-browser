package org.irods.jargon.idrop.web.services



import grails.test.mixin.*

import org.irods.jargon.core.connection.IRODSAccount
import org.irods.jargon.core.pub.IRODSAccessObjectFactory
import org.irods.jargon.dataprofile.DataProfile
import org.irods.jargon.dataprofile.DataProfileService
import org.junit.*

import spock.lang.Specification

/**
 * See the API for {@link grails.test.mixin.services.ServiceUnitTestMixin} for usage instructions
 */
@TestFor(DataProfileMidTierService)
class DataProfileMidTierServiceSpec extends Specification {


	void "shold obtain a dataprofile for a data object"() {
		given:
		IRODSAccount irodsAccount = IRODSAccount.instance("host", 1247, "user", "password", "", "zone", "")
		String absPath = "/a/b/c.txt"
		def irodsAccessObjectFactory = mockFor(IRODSAccessObjectFactory)
		def irodsAccessObjectFactoryMock = irodsAccessObjectFactory.createMock()

		def dataProfile = new DataProfile()
		def dataProfileFactoryService = mockFor(DataProfileFactoryService)

		def dataProfileService = mockFor(DataProfileService)
		dataProfileService.demand.retrieveDataProfile{ requestedPath -> return dataProfile }
		def dataProfileServiceMock = dataProfileService.createMock()

		dataProfileFactoryService.demand.instanceDataProfileService{ dpAct -> return dataProfileServiceMock }
		def dataProfileFactoryServiceMock = dataProfileFactoryService.createMock()

		def dataProfileMidTierService = new DataProfileMidTierService()
		dataProfileMidTierService.irodsAccessObjectFactory =irodsAccessObjectFactoryMock
		dataProfileMidTierService.dataProfileFactoryService = dataProfileFactoryServiceMock

		when:

		def actual = dataProfileMidTierService.retrieveDataProfile(absPath, irodsAccount)

		then:

		actual != null
	}
}

package org.irods.jargon.idrop.web.services



import grails.test.mixin.*

import org.irods.jargon.core.connection.IRODSAccount
import org.irods.jargon.usertagging.starring.IRODSStarringService
import org.junit.*

import spock.lang.Specification

/**
 * See the API for {@link grails.test.mixin.services.ServiceUnitTestMixin} for usage instructions
 */
@TestFor(StarService)
class StarServiceSpec extends Specification {
	void "should star a file"() {
		given:
		IRODSAccount irodsAccount = IRODSAccount.instance("host", 1247, "user", "password", "", "zone", "")
		String absPath = "/an/abs/path"

		def irodsStarringService = mockFor(IRODSStarringService)
		irodsStarringService.demand.starFileOrCollection{ab,descr ->}
		def irodsStarringServiceMock = irodsStarringService.createMock()


		def jargonServiceFactoryService = mockFor(JargonServiceFactoryService)
		jargonServiceFactoryService.demand.instanceStarringService{act1 -> return irodsStarringServiceMock}
		def jargonServiceFactoryServiceMock = jargonServiceFactoryService.createMock()

		def starService = new StarService()
		starService.jargonServiceFactoryService = jargonServiceFactoryServiceMock

		when:

		starService.addStar(absPath, irodsAccount)

		then:

		true
	}

	void "should unstar a file"() {
		given:
		IRODSAccount irodsAccount = IRODSAccount.instance("host", 1247, "user", "password", "", "zone", "")
		String absPath = "/an/abs/path"

		def irodsStarringService = mockFor(IRODSStarringService)
		irodsStarringService.demand.unstarFileOrCollection{ab ->}
		def irodsStarringServiceMock = irodsStarringService.createMock()


		def jargonServiceFactoryService = mockFor(JargonServiceFactoryService)
		jargonServiceFactoryService.demand.instanceStarringService{act1 -> return irodsStarringServiceMock}
		def jargonServiceFactoryServiceMock = jargonServiceFactoryService.createMock()

		def starService = new StarService()
		starService.jargonServiceFactoryService = jargonServiceFactoryServiceMock

		when:

		starService.removeStar(absPath, irodsAccount)

		then:

		true
	}
}

package org.irods.jargon.idrop.web.services

import grails.test.mixin.TestFor

import org.irods.jargon.core.connection.IRODSAccount
import org.irods.jargon.core.pub.CollectionAO
import org.irods.jargon.core.pub.DataObjectAO
import org.irods.jargon.core.pub.IRODSAccessObjectFactory
import org.irods.jargon.core.pub.domain.ObjStat
import org.irods.jargon.core.pub.domain.UserFilePermission
import org.mockito.Mockito

import spock.lang.Specification

/**
 * See the API for {@link grails.test.mixin.services.ServiceUnitTestMixin} for usage instructions
 */
@TestFor(AclService)
class AclServiceSpec extends Specification {

	def setup() {
	}

	def cleanup() {
	}

	void "test should list collection acls"() {

		given:
		def irodsAccount = IRODSAccount.instance("host", 1247, "user", "password", "", "zone", "")
		String absPath = "/an/abs/path"

		def irodsAccessObjectFactory = mockFor(IRODSAccessObjectFactory)

		def collectionAO = mockFor(CollectionAO)
		def dataObjectAO = mockFor(DataObjectAO)

		List<UserFilePermission> acls = new ArrayList<UserFilePermission>()
		def myObjStat =  Mockito.mock(ObjStat.class)
		Mockito.when(myObjStat.isSomeTypeOfCollection()).thenReturn(true)
		dataObjectAO.demand.getObjectStatForAbsolutePath{pth -> return myObjStat}
		collectionAO.demand.listPermissionsForCollection{pth2 -> return acls}

		def aclService = new AclService()
		irodsAccessObjectFactory.demand.getDataObjectAO{ia -> return dataObjectAO.createMock()}
		irodsAccessObjectFactory.demand.getCollectionAO{ia2 -> return collectionAO.createMock()}
		aclService.irodsAccessObjectFactory = irodsAccessObjectFactory.createMock()

		when:

		def actual = aclService.listUserAcls("absPath", irodsAccount)

		then:
		actual != null
	}
}

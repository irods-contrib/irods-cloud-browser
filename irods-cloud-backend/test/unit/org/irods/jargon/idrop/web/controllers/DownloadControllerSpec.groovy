package org.irods.jargon.idrop.web.controllers



import grails.test.mixin.*

import org.irods.jargon.core.connection.IRODSAccount
import org.irods.jargon.core.pub.IRODSAccessObjectFactory
import org.irods.jargon.core.pub.Stream2StreamAO
import org.irods.jargon.core.pub.io.IRODSFileFactory
import org.irods.jargon.idrop.web.services.DownloadFileSpecification
import org.irods.jargon.idrop.web.services.FileService
import org.junit.*

import spock.lang.Specification

/**
 * See the API for {@link grails.test.mixin.web.ControllerUnitTestMixin} for usage instructions
 */
@TestFor(DownloadController)
class DownloadControllerSpec extends Specification {

	void testDownload() {
		given:


		IRODSAccount testAccount = IRODSAccount.instance("host", 1247, "user", "password", "","zone", "")
		request.irodsAccount = testAccount
		params.path = "/a/path"

		def irodsAccessObjectFactory = mockFor(IRODSAccessObjectFactory)

		def irodsFileFactory = mockFor(IRODSFileFactory)
		def irodsFileFactoryMock = irodsFileFactory.createMock()
		irodsAccessObjectFactory.demand.getIRODSFileFactory{irodsAcct -> return irodsFileFactoryMock}



		def stream2StreamAO = mockFor(Stream2StreamAO)
		stream2StreamAO.demand.streamToStreamCopyUsingStandardIO{is1, os2 -> return null}
		def stream2StreamAOMock = stream2StreamAO.createMock()
		irodsAccessObjectFactory.demand.getStream2StreamAO{irodsAcct2 -> return stream2StreamAOMock}
		def irodsAccessObjectFactoryMock = irodsAccessObjectFactory.createMock()
		controller.irodsAccessObjectFactory = irodsAccessObjectFactoryMock

		def inputStream = mockFor(InputStream)
		def inputStreamMock = inputStream.createMock()

		def fileService = mockFor(FileService)
		DownloadFileSpecification dfs = new DownloadFileSpecification()
		dfs.bundleFileName = "blah"
		dfs.contentDispositionHeader = "foo"
		dfs.length = 100L
		dfs.type = "bar"
		dfs.inputStream = inputStreamMock
		fileService.demand.obtainInputStreamForDownloadSingleFile{p1,a1 -> return dfs}
		def fileServiceMock = fileService.createMock()
		controller.fileService = fileServiceMock

		when:
		controller.show()

		then:
		controller.response.status == 200
		log.info("responseText:${response.text}")
	}
}

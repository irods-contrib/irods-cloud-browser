package org.irods.jargon.idrop.web.controllers



import grails.test.mixin.*

import org.irods.jargon.core.connection.IRODSAccount
import org.irods.jargon.core.pub.IRODSAccessObjectFactory
import org.irods.jargon.core.pub.Stream2StreamAO
import org.irods.jargon.core.pub.TransferStatistics
import org.irods.jargon.core.pub.io.IRODSFileFactory
import org.irods.jargon.core.pub.io.IRODSFileInputStream
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

		def factory = mockFor(IRODSAccessObjectFactory)
		def irodsFileFactory = mockFor(IRODSFileFactory)

		def irodsFileInputStream = mockFor(IRODSFileInputStream)
		irodsFileInputStream.demand.read{b -> return -1}
		def irodsFileInputStreamMock = irodsFileInputStream.createMock()
		def dfs = new DownloadFileSpecification()
		dfs.fileName = "file"
		dfs.inputStream = irodsFileInputStreamMock
		dfs.length = 100L
		dfs.type = "blah"

		def fileService = mockFor(FileService)
		fileService.demand.obtainInputStreamForDownloadSingleFile{pth1, act1 -> return dfs}
		def fileServiceMock = fileService.createMock()

		def stream2StreamAO = mockFor(Stream2StreamAO)
		stream2StreamAO.demand.streamToStreamCopyUsingStandardIO{is, bos -> return new TransferStatistics()}
		def stream2StreamAOMock = stream2StreamAO.createMock()

		factory.demand.getStream2StreamAO{act -> return stream2StreamAOMock}
		def mockFactory = factory.createMock()

		controller.irodsAccessObjectFactory = mockFactory
		controller.fileService = fileServiceMock

		when:
		controller.show()

		then:
		controller.response.status == 200
		log.info("responseText:${response.text}")
	}
}

package org.irods.jargon.idrop.web.controllers

import grails.rest.RestfulController

import org.irods.jargon.core.exception.JargonException
import org.irods.jargon.core.pub.IRODSAccessObjectFactory
import org.irods.jargon.core.pub.Stream2StreamAO
import org.irods.jargon.idrop.web.services.DownloadFileSpecification
import org.irods.jargon.idrop.web.services.FileService
import org.irods.jargon.idrop.web.services.JargonServiceFactoryService

class DownloadController extends RestfulController {

	static responseFormats = ['json']
	IRODSAccessObjectFactory irodsAccessObjectFactory
	JargonServiceFactoryService jargonServiceFactoryService
	FileService fileService

	/**
	 * Download a file from iRODS
	 * 
	 */
	def show() {

		log.info("show")
		def irodsAccount = request.irodsAccount
		if (!irodsAccount) throw new IllegalStateException("no irodsAccount in request")

		def path = params.path
		if (!path) {
			log.error("no path in request ")
			throw new JargonException("no path in request")
		}

		DownloadFileSpecification dfs
		if (path instanceof String[]) {
			log.info("multiple paths, create a zip")
			List<String> pathList = new ArrayList<String>()
			path.each{pathElem -> pathList.add(pathElem)}
			dfs = fileService.obtainInputStreamForDownloadMultipleFiles(pathList, irodsAccount)
		} else {
			log.info("single path for download")
			dfs = fileService.obtainInputStreamForDownloadSingleFile(path, irodsAccount)
		}
		log.info("got download file data")


		def length =  dfs.length
		log.info("file length = ${length}")
		log.info("opened input stream")

		//response.setContentType("application/octet-stream")
		response.setContentLength((int) length)
		//response.setHeader("Content-disposition",dfs.contentDispositionHeader)  tweaking for #160
		response.setHeader("Content-disposition", "inline;filename=\"${dfs.fileName}\"")
		Stream2StreamAO stream2Stream = irodsAccessObjectFactory.getStream2StreamAO(irodsAccount)
		def stats = stream2Stream
				.streamToStreamCopyUsingStandardIO(dfs.inputStream, new BufferedOutputStream(response.outputStream))
		log.info("transferStats:${stats}")
	}
}

package org.irods.jargon.idrop.web.controllers

import grails.rest.RestfulController

import org.irods.jargon.core.exception.JargonException
import org.irods.jargon.core.pub.IRODSAccessObjectFactory
import org.irods.jargon.core.pub.Stream2StreamAO
import org.irods.jargon.core.pub.io.IRODSFile
import org.irods.jargon.core.pub.io.IRODSFileFactory
import org.irods.jargon.core.pub.io.IRODSFileInputStream

class DownloadController extends RestfulController {

	static responseFormats = ['json']
	IRODSAccessObjectFactory irodsAccessObjectFactory

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

		IRODSFileFactory irodsFileFactory = irodsAccessObjectFactory.getIRODSFileFactory(irodsAccount)
		IRODSFileInputStream irodsFileInputStream = irodsFileFactory.instanceIRODSFileInputStream(path)
		IRODSFile irodsFile = irodsFileFactory.instanceIRODSFile(path)
		def length =  irodsFile.length()
		def name = irodsFile.getName()
		log.info("file length = ${length}")
		log.info("opened input stream")

		response.setContentType("application/octet-stream")
		response.setContentLength((int) length)
		response.setHeader("Content-disposition", "attachment;filename=\"${name}\"")

		//response.outputStream << irodsFileInputStream // Performing a binary stream copy

		Stream2StreamAO stream2Stream = irodsAccessObjectFactory.getStream2StreamAO(irodsAccount)
		def stats = stream2Stream
				.streamToStreamCopyUsingStandardIO(irodsFileInputStream, new BufferedOutputStream(response.outputStream, 32768))
		log.info("transferStats:${stats}")



	}
}

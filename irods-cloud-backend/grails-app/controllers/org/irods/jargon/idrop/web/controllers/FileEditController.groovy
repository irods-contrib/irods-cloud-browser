package org.irods.jargon.idrop.web.controllers

import grails.rest.RestfulController

import org.irods.jargon.idrop.web.services.FileService

/**
 * Controller supporting codemirror editing, manage file data as String to put into codemirror
 * @author Mike Conway - DICE
 *
 */
class FileEditController extends RestfulController {

	FileService fileService
	static responseFormats = ['text']


	def index() {
		log.info("index()")
		show()
	}

	/**
	 * GET operation gets a file as a String
	 * parms 
	 *   irodsPath - irods path
	 * @return
	 */
	def show() {
		log.info("index() gets content of a file")
		def irodsAccount = request.irodsAccount
		def irodsPath = params.irodsPath
		if (!irodsAccount) throw new IllegalArgumentException("no irodsAccount in request")
		if (!irodsPath) throw new IllegalArgumentException("no irodsPath in request")
		log.info("irodsPath:${irodsPath}")
		String responseData = fileService.stringFromFile(irodsPath, irodsAccount)
		render responseData
	}

	/**
	 * POST handling file upload from a string
	 * parms
	 * 	data - string contents
	 *  irodsPath - file path
	 */
	def save() {
		log.info("save action in file controller")
		def irodsAccount = request.irodsAccount
		if (!irodsAccount) throw new IllegalStateException("no irodsAccount in request")
		def irodsPath = params.irodsPath
		if (!irodsPath) throw new IllegalArgumentException("no irodsPath in request")
		log.info("irodsPath:${irodsPath}")
		def data = params.data
		if (!irodsPath) throw new IllegalArgumentException("no irodsPath in request")
		fileService.stringToFile(data, irodsPath, irodsAccount)
		render(status:200)
	}
}

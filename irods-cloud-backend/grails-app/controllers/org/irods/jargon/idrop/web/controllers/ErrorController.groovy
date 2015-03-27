package org.irods.jargon.idrop.web.controllers

import grails.converters.*

import com.sun.jndi.cosnaming.ExceptionMapper

/**
 * General error controller returns a REST depiction of the error
 * @author mikeconway
 *
 */
class ErrorController {

	def index() {

		def exception = request.exception.cause

		def message
		if (!exception) {
			message = ExceptionMapper.mapException(exception)
		} else {
			message = "Unknown exception"
		}

		log.error("error controller triggered for exception:${exception}")

		response.status = 500
		render([error: exception] as JSON)
	}
}


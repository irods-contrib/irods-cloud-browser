package org.irods.jargon.idrop.web.controllers

import grails.rest.RestfulController

import org.irods.jargon.idrop.web.services.StarService

/**
 * Implements REST actions for managing 'star' notations on files and folders
 * @author Mike Conway - DICE
 *
 */
class StarController extends RestfulController {

	StarService starService
	static responseFormats = ['json']

	/**
	 * DELETE method to unstar a file or collection, this is idempotent, and returns a 204 (succss no data)
	 * @return
	 */
	def delete() {
		log.info("delete()...respond to delete that removes a star")
		def path = params.path
		if (!path) {
			throw new IllegalArgumentException("null path")
		}

		log.info("path:${path}")

		def irodsAccount = request.irodsAccount

		if (!irodsAccount) {
			throw new IllegalArgumentException("null irodsAccount")
		}

		log.info("irodsAccount:${irodsAccount}")

		starService.removeStar(path, irodsAccount)
		log.info("star remove successfull")
		render(status:204)
	}

	/**
	 * PUT method to star a file or collection, this is idempotent, and returns a 204 (succss no data)
	 * @return
	 */
	def update() {
		log.info("update()...respond to put that adds a star")
		def path = params.path
		if (!path) {
			throw new IllegalArgumentException("null path")
		}

		log.info("path:${path}")

		def irodsAccount = request.irodsAccount

		if (!irodsAccount) {
			throw new IllegalArgumentException("null irodsAccount")
		}

		log.info("irodsAccount:${irodsAccount}")

		starService.addStar(path, irodsAccount)
		log.info("star added successfull")
		render(status:204)
	}
}

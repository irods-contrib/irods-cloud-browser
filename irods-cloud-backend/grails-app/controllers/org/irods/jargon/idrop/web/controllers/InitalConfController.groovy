package org.irods.jargon.idrop.web.controllers

import grails.rest.RestfulController

/**
 * Simple controller to obtain any static configuration from the back end server that can configure the browser behavior. This is basic global
 * configuration prior to obtaining any user-specific information after logging in.  This might include login presets, 
 * theme information, and the like
 * @author Mike Conway - DICE
 *
 */
class InitalConfController extends RestfulController {

	static responseFormats = ['json']

	/**
	 * Obtain a listing of collection contents
	 * 
	 * note that the path is overloaded to have a virtual collection name, then a collection path (url encoded) and then parameters to tune the listing/paging behavior
	 * 
	 * TODO: listing type and path with paging semantics
	 * 
	 * @return
	 */
	def show() {
		log.info("show")

		//render pagingAwareCollectionListing as JSON
	}
}

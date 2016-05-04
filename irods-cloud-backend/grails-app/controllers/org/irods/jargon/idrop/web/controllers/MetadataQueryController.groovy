package org.irods.jargon.idrop.web.controllers

import grails.converters.JSON

import org.irods.jargon.core.pub.IRODSAccessObjectFactory
import org.irods.jargon.idrop.web.services.MetadataQueryService
import org.irods.jargon.vircoll.CollectionTypes

/**
 * Controller for storing and retrieving metadata queries as virtual collections
 * @author Mike Conway - DICE
 *
 */
class MetadataQueryController {

	static responseFormats = ['json']
	IRODSAccessObjectFactory irodsAccessObjectFactory
	MetadataQueryService metadataQueryService

	/**
	 * Get the iRODS catalog info for the given path
	 */
	def index() {

		log.info("index")
		show()
	}

	/**
	 * GET method. Retrieve the metadata query given the virtual collection unique name.  The <code>uniqueName</code> parameter is required
	 * @return
	 */
	def show() {
		log.info("show()")

		def irodsAccount = request.irodsAccount
		if (!irodsAccount) throw new IllegalStateException("no irodsAccount in request")

		def uniqueName = params.uniqueName
		if (!uniqueName) {
			log.error("uniqueName is missing")
			throw new IllegalArgumentException("uniqueName is missing")
		}

		render metadataQueryService.retrieveMetadataQuery(uniqueName, irodsAccount, session) as JSON
	}

	/**
	 * POST method to store a metadata query.  The JSON is posted in the body like this: https://hello-angularjs.appspot.com/angularjs-http-service-ajax-post-json-data-code-example
	 * @return
	 */
	def save() {


		log.info("save()")

		def irodsAccount = request.irodsAccount
		if (!irodsAccount) throw new IllegalStateException("no irodsAccount in request")

		log.info("getting json")
		def jsonObject = request.JSON
		if (!jsonObject) {
			log.error("no json body for query")
			throw new IllegalArgumentException("missing json body")
		}

		def vcName = params.uniqueName
		if (!vcName) {
			log.info("no vcName provided, will auto-generate")
			vcName = ""
		}

		def collectionType = CollectionTypes.TEMPORARY_QUERY
		def collectionTypeName = params.collection
		if (!collectionTypeName) {
			log.info("no collection, use temp")
			collectionType = CollectionTypes.TEMPORARY_QUERY
		} else if (collectionTypeName == CollectionTypes.USER_HOME.name) {
			log.info("user home coll type")
			collectionType = CollectionTypes.USER_HOME
		}

		def description = params.description

		log.error("storing:${jsonObject}")
		vcName = metadataQueryService.storeMetadataQuery(jsonObject.toString(), irodsAccount, vcName, session, description, collectionType)
		def metadataQueryResponse = new MetadataQueryVcName()
		metadataQueryResponse.vcName = vcName
		log.info("response:${metadataQueryResponse}")

		render metadataQueryResponse as JSON
	}
}

class MetadataQueryVcName {
	String vcName
}

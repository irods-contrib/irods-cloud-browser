

package org.irods.jargon.idrop.web.controllers

import grails.converters.JSON
import grails.rest.RestfulController

import org.irods.jargon.core.exception.JargonException
import org.irods.jargon.core.pub.IRODSAccessObjectFactory
import org.irods.jargon.idrop.web.services.VirtualCollectionService
import org.irods.jargon.vircoll.CollectionTypes

/**
 * Handle iRODS virtual collections
 */
class VirtualCollectionController extends RestfulController {

	static responseFormats = ['json']
	IRODSAccessObjectFactory irodsAccessObjectFactory
	VirtualCollectionService virtualCollectionService


	/**
	 * Get user listing of virtual collections, responds to a get with no vc name
	 */
	def index() {
		log.info("index()...get virtual collections for user")
		def irodsAccount = request.irodsAccount
		if (!irodsAccount) throw new IllegalStateException("no irodsAccount in request")
		log.info("getting virtual colls")
		def virColls = virtualCollectionService.virtualCollectionHomeListingForUser(irodsAccount,session)
		log.info("virColls:${virColls}")
		render virColls as JSON
	}

	/**
	 * Get info on a particular virtual collection, responds to a get with a vc name included
	 */
	def show() {
		log.info("index()...get virtual collections for user")
		def irodsAccount = request.irodsAccount
		if (!irodsAccount) throw new IllegalStateException("no irodsAccount in request")

		def vcName = params.name

		if (!vcName) {
			log.error("missing vcName")
			throw new JargonException("missing virtualCollection")
		}

		log.info("vcName:${vcName}")

		def virtualCollection = virtualCollectionService.virtualCollectionDetails(vcName, irodsAccount, session)
		log.info("virtualCollection:${virtualCollection}")
		render virtualCollection as JSON
	}


	def save() {
		log.info("save() responds to post to update a  vc")
		def irodsAccount = request.irodsAccount
		if (!irodsAccount) throw new IllegalStateException("no irodsAccount in request")
		def vcName = params.name
		if (!vcName) throw new IllegalArgumentException("no name")

		log.info("uniqueName:${vcName}")
		def vcNames = new ArrayList<String>()
		if (vcName instanceof String[]) {
			log.info("multiple names, move each each")
			vcName.each{vc -> vcNames.add(vc)}
		} else {
			log.info("single path for move")
			vcNames.add(vcName)
		}

		def collTypeString =  params.collType
		if (!collTypeString) throw new IllegalArgumentException("no collTypeString")
		log.info("collTypeString:${collTypeString}")
		def collType = CollectionTypes.findTypeByString(collTypeString)

		virtualCollectionService.moveVirtualCollections(vcNames.toArray(new String[vcNames.size()]), collType, irodsAccount, session)
		render(status: 200, text: 'moved ${vcNames}')
	}

	/**
	 * Delete a virtual collection.  
	 * 
	 * Params
	 * 
	 * uniqueName can be one, or an array of names, each will be deleted
	 */
	def delete() {
		log.info("delete")

		def irodsAccount = request.irodsAccount
		if (!irodsAccount) throw new IllegalStateException("no irodsAccount in request")


		def vcName = params.name
		if (!vcName) throw new IllegalArgumentException("no name")

		log.info("uniqueName:${vcName}")
		def vcNames = new ArrayList<String>()
		if (vcName instanceof String[]) {
			log.info("multiple names, delete each")
			vcName.each{vc -> vcNames.add(vc)}
		} else {
			log.info("single path for delete")
			vcNames.add(vcName)
		}

		virtualCollectionService.deleteVirtualCollections(vcNames.toArray(new String[vcNames.size()]), irodsAccount, session)
		render(status: 204, text: 'deleted vc ${vcNames}')
	}
}

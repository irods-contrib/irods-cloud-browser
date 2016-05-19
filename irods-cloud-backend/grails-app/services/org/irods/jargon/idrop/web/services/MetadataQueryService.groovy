package org.irods.jargon.idrop.web.services

/**
 * Service to support the storage of metadata queries and their execution.
 * <p/>
 * Note that 'execution' in this system means storage as a temporary virtual collection for execution in the
 * browse view, so there is actually a disintermediation.
 */
import javax.servlet.http.HttpSession

import org.irods.jargon.core.connection.IRODSAccount
import org.irods.jargon.core.pub.IRODSAccessObjectFactory
import org.irods.jargon.mdquery.MetadataQuery
import org.irods.jargon.mdquery.serialization.MetadataQueryJsonService
import org.irods.jargon.vircoll.CollectionTypes
import org.irods.jargon.vircoll.exception.VirtualCollectionException
import org.irods.jargon.vircoll.types.MetadataQueryVirtualCollection

class MetadataQueryService {

	IRODSAccessObjectFactory irodsAccessObjectFactory
	JargonServiceFactoryService jargonServiceFactoryService
	static transactional = false

	/**
	 * Injected virtualCollectionService
	 */
	VirtualCollectionService virtualCollectionService

	/**
	 * Get the metadata query with the given unique name, note that a {@link DataNotFoundException} exception is thrown if the given query cannot be found
	 * @param queryName <code>String</code> with the unique name for the query
	 * @param irodsAccount {@link IRODSAccount} for the user
	 * @param theSession {@link HttpSession} that holds a cache of vcs
	 * @return JSON string that is an {@link MetadataQuery} or <code>null</code> if not found
	 */
	def retrieveMetadataQuery(String queryName, IRODSAccount irodsAccount, HttpSession theSession) {
		log.info("retrieveMetadataQuery")
		if (!queryName) {
			throw new IllegalArgumentException("Null queryName")
		}
		if (!irodsAccount) {
			throw new IllegalArgumentException("Null irodsAccount")
		}

		log.info("retrieving query:${queryName}")

		log.info("get user vc profile")

		def query = virtualCollectionService.virtualCollectionDetails(queryName, irodsAccount, theSession)

		if (query == null) {
			log.error("query not found.. return empty")
			return new MetadataQueryVirtualCollection()
		} else if (!(query instanceof MetadataQueryVirtualCollection)) {
			log.error("query is not a metadata query")
			throw new VirtualCollectionException("retrieved query is not a metadata query")
		} else {
			return query
		}
	}


	/**
	 * Delete the metadata query
	 * @param uniqueName <code>String</code> with the name of the VC to delete
	 * @param theSession {@link HttpSession} that holds a cache of vcs
	 * @return
	 */
	def deleteMetadataQuery(String uniqueName, HttpSession theSession) {
		log.info("deleteVirtualCollection")
		if (!uniqueName) {
			throw new IllegalArgumentException("missing uniqueName")
		}
		if (!theSession) {
			throw new IllegalArgumentException("missing session")
		}

		log.info("delete vc with uniqueName:${uniqueName}")
		def metadataQueryMaintenanceService = jargonServiceFactoryService.instanceMetadataQueryMaintenanceService(irodsAccount)
		metadataQueryMaintenanceService.deleteVirtualCollection(uniqueName)
		theSession.virtualCollections = null
		log.info("delete done")
	}

	/**
	 * Move a collection from one category to another
	 * @param uniqueName <code>String</code> 
	 * @param collectionType
	 * @param theSession
	 * @return
	 */
	def recategorizeQuery(String uniqueName,CollectionTypes collectionType, HttpSession theSession) {
		log.info("recategorizeQuery()")
		if (!uniqueName) {
			throw new IllegalArgumentException("missing uniqueName")
		}
		if (!theSession) {
			throw new IllegalArgumentException("missing session")
		}

		log.info("recategorize vc with uniqueName:${uniqueName} to type: ${collectionType}")
		def metadataQueryMaintenanceService = jargonServiceFactoryService.instanceMetadataQueryMaintenanceService(irodsAccount)
		metadataQueryMaintenanceService.reclassifyVirtualCollection(collectionType, uniqueName)
		log.info("reclassified collection!")
	}



	/**
	 * Store a query string (a jsonized metadata query) in a temporary virtual collection and get back the name of that vc. 
	 * @param metadataQuery <code>String</code> with a json metadata query
	 * @param irodsAccount
	 * @param vcName <code>String</code> that is optional (blank if not specified) that will be the unique name.  If not specified, it will be auto-generated.
	 * @param theSession {@link HttpSession} that holds a cache of vcs
	 * @param description <code>String</code> with the user assignable name of the vc, if not provided, will use the unique name
	 * @param collectionType {@link CollectionTypes} enum value for the category of collection
	 * @return <code>String</code> with the name of the virtual collection 
	 * @deprecated this needs to go away because it assumes it's a temp query, need an add and an update
	 */

	def storeMetadataQuery(String metadataQuery, IRODSAccount irodsAccount, String vcName, HttpSession theSession, String description, CollectionTypes collectionType) {
		log.info("storeMetadataTempQuery")
		if (!metadataQuery) {
			throw new IllegalArgumentException("Null or empty metadataQuery")
		}
		if (!irodsAccount) {
			throw new IllegalArgumentException("Null irodsAccount")
		}
		if (!collectionType) {
			throw new IllegalArgumentException("null collectionType")
		}

		log.info("storing temp query:${metadataQuery} ")
		MetadataQueryJsonService metadataQueryJsonService = new MetadataQueryJsonService()
		log.info("try to deserialize as a validation step")
		MetadataQuery validateMetadataQuery = metadataQueryJsonService.metadataQueryFromJson(metadataQuery);
		MetadataQueryVirtualCollection metadataQueryVirtualCollection = new MetadataQueryVirtualCollection(metadataQuery);
		if (vcName) {
			metadataQueryVirtualCollection.uniqueName = vcName
		}

		if (description) {
			metadataQueryVirtualCollection.description = description
		} else {
			metadataQueryVirtualCollection.description = "Metadata Query:" + System.currentTimeMillis()
		}

		def metadataQueryMaintenanceService = jargonServiceFactoryService.instanceMetadataQueryMaintenanceService(irodsAccount)
		def temporaryQueryService = jargonServiceFactoryService.instanceTemporaryQueryService(irodsAccount)
		theSession.virtualCollections = null

		if (collectionType == CollectionTypes.TEMPORARY_QUERY) {
			log.info("ading temp query")
			return temporaryQueryService.addOrUpdateTemporaryQuery(metadataQueryVirtualCollection, irodsAccount.getUserName(), metadataQueryMaintenanceService)
		} else {
			log.info("updating existing query")
			return metadataQueryMaintenanceService.addOrUpdateVirtualCollection(virtualCollection, collectionType, virtualCollection.uniqueName)
		}
	}
}

package org.irods.jargon.idrop.web.services

/**
 * Service to support the storage of metadata queries and their execution.
 * <p/>
 * Note that 'execution' in this system means storage as a temporary virtual collection for execution in the
 * browse view, so there is actually a disintermediation.
 */
import org.irods.jargon.core.connection.IRODSAccount
import org.irods.jargon.core.exception.DataNotFoundException
import org.irods.jargon.core.pub.IRODSAccessObjectFactory
import org.irods.jargon.mdquery.MetadataQuery
import org.irods.jargon.mdquery.serialization.MetadataQueryJsonService
import org.irods.jargon.vircoll.VirtualCollectionProfileUtils
import org.irods.jargon.vircoll.exception.VirtualCollectionException
import org.irods.jargon.vircoll.types.MetadataQueryMaintenanceService
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
	 * @return JSON string that is an {@link MetadataQuery} or <code>null</code> if not found
	 */
	def retrieveMetadataQuery(String queryName, IRODSAccount irodsAccount) {
		log.info("retrieveMetadataQuery")
		if (!queryName) {
			throw new IllegalArgumentException("Null queryName")
		}
		if (!irodsAccount) {
			throw new IllegalArgumentException("Null irodsAccount")
		}

		log.info("retrieving query:${queryName}")

		log.info("get user vc profile")

		def vcProfile = virtualCollectionService.virtualCollectionHomeListingForUser(irodsAccount.getUserName(), irodsAccount)

		def query = VirtualCollectionProfileUtils.findVirtualCollectionInTempQueries(queryName, vcProfile)
		if (query == null) {
			log.error("query not found")
			throw new DataNotFoundException("no query found")
		}
		if (!(query instanceof MetadataQueryVirtualCollection)) {
			log.error("query is not a metadata query")
			throw new VirtualCollectionException("retrieved query is not a metadata query")
		}

		return query.queryString
	}

	/**
	 * Store a query string (a jsonized metadata query) in a temporary virtual collection and get back the name of that vc
	 * @param metadataQuery <code>String</code> with a json metadata query
	 * @param irodsAccount
	 * @param vcName <code>String</code> that is optional (blank if not specified) that will be the unique name.  If not specified, it will be auto-generated.
	 * @return <code>String</code> with the name of the virtual collection 
	 */
	def storeMetadataTempQuery(String metadataQuery, IRODSAccount irodsAccount, String vcName) {
		log.info("storeMetadataTempQuery")
		if (!metadataQuery) {
			throw new IllegalArgumentException("Null or empty metadataQuery")
		}
		if (!irodsAccount) {
			throw new IllegalArgumentException("Null irodsAccount")
		}

		log.info("storing temp query:${metadataQuery} ")
		MetadataQueryJsonService metadataQueryJsonService = new MetadataQueryJsonService()
		log.info("try to deserialize as a validation step")
		MetadataQuery validateMetadataQuery = metadataQueryJsonService.metadataQueryFromJson(metadataQuery);
		MetadataQueryVirtualCollection metadataQueryVirtualCollection = new MetadataQueryVirtualCollection(metadataQuery);
		if (vcName) {
			metadataQueryVirtualCollection.uniqueName = vcName
		}
		def metadataQueryMaintenanceService = new MetadataQueryMaintenanceService(irodsAccessObjectFactory, irodsAccount)
		def temporaryQueryService = jargonServiceFactoryService.instanceTemporaryQueryService(irodsAccount)
		return temporaryQueryService.nameAndStoreTemporaryQuery(metadataQueryVirtualCollection, irodsAccount.getUserName(), metadataQueryMaintenanceService)
	}
}

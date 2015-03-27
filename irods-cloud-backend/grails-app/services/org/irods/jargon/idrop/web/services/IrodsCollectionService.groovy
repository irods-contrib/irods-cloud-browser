package org.irods.jargon.idrop.web.services

import org.irods.jargon.core.connection.IRODSAccount
import org.irods.jargon.core.pub.CollectionAndDataObjectListAndSearchAO
import org.irods.jargon.core.pub.IRODSAccessObjectFactory
import org.irods.jargon.core.pub.io.IRODSFile
import org.irods.jargon.core.pub.io.IRODSFileFactory
import org.irods.jargon.idrop.web.services.VirtualCollectionService.ListingType

/**
 * Service for navigating and manipulating iRODS collections.
 * @author Mike Conway
 *
 */
class IrodsCollectionService {

	static transactional = false
	IRODSAccessObjectFactory irodsAccessObjectFactory
	JargonServiceFactoryService jargonServiceFactoryService

	/**
	 * Generate a collection listing 
	 * @param absoluteParentPath
	 * @param listingType
	 * @param offset
	 * @param irodsAccount
	 * @return
	 */
	def collectionListing(String absoluteParentPath, ListingType listingType, int offset, IRODSAccount irodsAccount) {

		log.info("collectionListing()")

		if (!absoluteParentPath) {
			absoluteParentPath = "/"
		}

		if (!listingType) {
			throw new IllegalArgumentException("null or empty listingType")
		}

		if (!irodsAccount) {
			throw new IllegalArgumentException("null irodsAccount")
		}
		log.info("getting listing for path:${absoluteParentPath}")
		log.info("listing type:${listingType}, offset:${offset}")

		CollectionAndDataObjectListAndSearchAO collectionAndDataObjectListAndSearchAO = irodsAccessObjectFactory.getCollectionAndDataObjectListAndSearchAO(irodsAccount)

		// right now just does full listing..need to add paging
		return collectionAndDataObjectListAndSearchAO.listDataObjectsAndCollectionsUnderPathProducingPagingAwareCollectionListing(absoluteParentPath)

	}

	/**
	 * Create a new folder at the given path
	 * @param absolutePath absolute path to folder to be created
	 * @param irodsAccount user info for request
	 * @return {@link CollectionAndDataObjectListingEntry} for new folder
	 */
	def newFolder(String absolutePath, IRODSAccount irodsAccount)  {
		log.info("newFolder()")

		if (!absolutePath) {
			throw new IllegalArgumentException("null absolutePath")
		}

		if (!irodsAccount) {
			throw new IllegalArgumentException("null irodsAccount")
		}

		log.info("absolutePath:${absolutePath}")
		log.info("irodsAccount:${irodsAccount}")

		IRODSFileFactory irodsFileFactory = irodsAccessObjectFactory.getIRODSFileFactory(irodsAccount)
		IRODSFile newFolderFile = irodsFileFactory.instanceIRODSFile(absolutePath)
		newFolderFile.mkdirs()
		log.info("create done")
		CollectionAndDataObjectListAndSearchAO collectionAndDataObjectListAndSearchAO = irodsAccessObjectFactory.getCollectionAndDataObjectListAndSearchAO(irodsAccount)
		return collectionAndDataObjectListAndSearchAO.getCollectionAndDataObjectListingEntryAtGivenAbsolutePath(newFolderFile.getAbsolutePath())
	}
}

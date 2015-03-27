package org.irods.jargon.idrop.web.services

import org.irods.jargon.core.connection.IRODSAccount
import org.irods.jargon.core.exception.JargonException
import org.irods.jargon.core.pub.CollectionAO
import org.irods.jargon.core.pub.CollectionAndDataObjectListAndSearchAO
import org.irods.jargon.core.pub.DataObjectAO
import org.irods.jargon.core.pub.IRODSAccessObjectFactory
import org.irods.jargon.core.pub.domain.ObjStat

/**
 * Service for iRODS files (collections and data objects) dealing with file details and operations
 * @author Mike Conway - DICE
 *
 */
class FileService {

	static transactional = false
	IRODSAccessObjectFactory irodsAccessObjectFactory

	/**
	 * Get an objStat for a given path
	 * @param path
	 * @param irodsAccount
	 * @return
	 * @throws FileNotFoundException
	 * @throws JargonException
	 */
	ObjStat retrieveObjStatForFile(String path, IRODSAccount irodsAccount) throws FileNotFoundException, JargonException {
		log.info("retrieveObjStatForFile()")

		if (!path) {
			throw new IllegalArgumentException("null or empty path")
		}

		if (!irodsAccount) {
			throw new IllegalArgumentException("null or empty irodsAccount")
		}

		log.info("path:${path}")

		CollectionAndDataObjectListAndSearchAO listAndSearch = irodsAccessObjectFactory.getCollectionAndDataObjectListAndSearchAO(irodsAccount)
		ObjStat objStat = listAndSearch.retrieveObjectStatForPath(path)
		log.info("objStat:${objStat}")
		return objStat
	}

	/**
	 * Given the path, return the appropriate object from the iRODS catalog
	 * @param path
	 * @param irodsAccount
	 * @return
	 * @throws FileNotFoundException
	 * @throws JargonException
	 */
	Object retrieveCatalogInfoForPath(String path, IRODSAccount irodsAccount) throws FileNotFoundException, JargonException {

		log.info("retrieveCatalogInfoForPath()")

		if (!path) {
			throw new IllegalArgumentException("null or empty path")
		}

		if (!irodsAccount) {
			throw new IllegalArgumentException("null or empty irodsAccount")
		}

		log.info("path:${path}")

		ObjStat objStat = retrieveObjStatForFile(path, irodsAccount)

		if (objStat.isSomeTypeOfCollection()) {
			log.info("treat as collection")
			CollectionAO collectionAO = irodsAccessObjectFactory.getCollectionAO(irodsAccount)
			return collectionAO.findByAbsolutePath(path)
		} else {
			log.info("treat as data object")
			DataObjectAO dataObjectAO = irodsAccessObjectFactory.getDataObjectAO(irodsAccount)
			return dataObjectAO.findByAbsolutePath(path)
		}
	}
}

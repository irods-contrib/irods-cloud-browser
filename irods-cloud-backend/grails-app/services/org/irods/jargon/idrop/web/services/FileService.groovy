package org.irods.jargon.idrop.web.services

import org.irods.jargon.core.connection.IRODSAccount
import org.irods.jargon.core.exception.JargonException
import org.irods.jargon.core.pub.CollectionAO
import org.irods.jargon.core.pub.CollectionAndDataObjectListAndSearchAO
import org.irods.jargon.core.pub.DataObjectAO
import org.irods.jargon.core.pub.IRODSAccessObjectFactory
import org.irods.jargon.core.pub.domain.ObjStat
import org.irods.jargon.core.pub.io.IRODSFile
import org.irods.jargon.core.pub.io.IRODSFileInputStream

/**
 * Service for iRODS files (collections and data objects) dealing with file details and operations
 * @author Mike Conway - DICE
 *
 */
class FileService {

	static transactional = false
	IRODSAccessObjectFactory irodsAccessObjectFactory
	JargonServiceFactoryService jargonServiceFactoryService

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

	/**
	 * Receive a handle to an input stream for a single file download
	 * @param path 
	 * @param irodsAccount
	 * @return
	 * @throws FileNotFoundException
	 * @throws JargonException
	 */
	InputStream obtainInputStreamForDownloadSingleFile(String path, IRODSAccount irodsAccount) throws FileNotFoundException, JargonException {
		log.info("obtainInputStreamForDownloadSingleFile")
		if (!path) {
			throw new IllegalArgumentException("null or missing path")
		}
		if (!irodsAccount) {
			throw new IllegalArgumentException("null irodsAccount")
		}
		log.info("path:${path}")
		log.info("irodsAccount:${irodsAccount}")

		IRODSFileInputStream irodsFileInputStream = irodsFileFactory.instanceIRODSFileInputStream(path)
		IRODSFile irodsFile = irodsFileFactory.instanceIRODSFile(path)
		if (!irodsFile.exists()) {
			throw new FileNotFoundException("file does not exist")
		}
		if (!irodsFile.canRead()) {
			throw new FileNotFoundException("no access to the file")
		}
		def length =  irodsFile.length()
		def name = irodsFile.getName()
		log.info("file length = ${length}")
		log.info("opened input stream")

		def dls = new DownloadFileSpecification()
		dls.setContentDispositionHeader("Content-disposition", "attachment;filename=\"${irodsFile.name}\"")
		dls.setLength(length)
		dls.setType("application/octet-stream") // TODO: later add mime type?
		dls.setInputStream(irodsFileInputStream)
		return dls
	}

	/**
	 * Receive a handle to an input stream for a multiple file download, which will be some kind of bundle
	 * @param paths
	 * @param irodsAccount
	 * @return
	 * @throws FileNotFoundException
	 * @throws JargonException
	 */
	InputStream obtainInputStreamForDownloadMultipleFiles(String[] paths, IRODSAccount irodsAccount) throws FileNotFoundException, JargonException {
		log.info("obtainInputStreamForDownloadMultipleFiles")
	}
}

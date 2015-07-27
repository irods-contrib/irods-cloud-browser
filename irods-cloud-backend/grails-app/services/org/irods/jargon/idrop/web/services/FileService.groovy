package org.irods.jargon.idrop.web.services

import org.irods.jargon.core.connection.IRODSAccount
import org.irods.jargon.core.exception.JargonException
import org.irods.jargon.core.packinstr.TransferOptions.ForceOption
import org.irods.jargon.core.pub.CollectionAO
import org.irods.jargon.core.pub.CollectionAndDataObjectListAndSearchAO
import org.irods.jargon.core.pub.DataObjectAO
import org.irods.jargon.core.pub.IRODSAccessObjectFactory
import org.irods.jargon.core.pub.domain.ObjStat
import org.irods.jargon.core.pub.io.IRODSFile
import org.irods.jargon.core.query.CollectionAndDataObjectListingEntry



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
	DownloadFileSpecification obtainInputStreamForDownloadSingleFile(String path, IRODSAccount irodsAccount) throws FileNotFoundException, JargonException {
		log.info("obtainInputStreamForDownloadSingleFile")
		if (!path) {
			throw new IllegalArgumentException("null or missing path")
		}
		if (!irodsAccount) {
			throw new IllegalArgumentException("null irodsAccount")
		}
		log.info("path:${path}")
		log.info("irodsAccount:${irodsAccount}")

		def irodsFileInputStream = irodsAccessObjectFactory.getIRODSFileFactory(irodsAccount).instanceIRODSFileInputStream(path)
		IRODSFile irodsFile = irodsAccessObjectFactory.getIRODSFileFactory(irodsAccount).instanceIRODSFile(path)
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
		dls.contentDispositionHeader = "attachment;filename=\"${irodsFile.name}\""
		dls.length = length
		dls.type = "application/octet-stream"
		dls.inputStream =  irodsFileInputStream
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
	DownloadFileSpecification obtainInputStreamForDownloadMultipleFiles(List<String> paths, IRODSAccount irodsAccount) throws FileNotFoundException, JargonException {
		log.info("obtainInputStreamForDownloadMultipleFiles")
		if (!paths) {
			throw new IllegalArgumentException("null or missing paths")
		}
		if (!irodsAccount) {
			throw new IllegalArgumentException("null irodsAccount")
		}
		log.info("getting zip service and building bundle file")
		def jargonZipService = jargonServiceFactoryService.instanceJargonZipService(irodsAccount)

		def bundleStreamWrapper = jargonZipService.obtainBundleAsInputStreamWithAdditionalMetadataGivenPaths(paths)
		log.info("..retrieved bundle file as input stream")

		def dls = new DownloadFileSpecification()
		dls.contentDispositionHeader = "attachment;filename=\"${bundleStreamWrapper.bundleFileName}\""
		dls.length = bundleStreamWrapper.length
		dls.type = "application/octet-stream"
		dls.inputStream =  bundleStreamWrapper.inputStream
		dls.bundleFileName = bundleStreamWrapper.bundleFileName

		return dls
	}

	/**
	 * Delete irods files/folders, taking a list of files so multi-selects can be supported
	 * @param paths <code>List<String></code> of file paths
	 * @param force <code>boolean</code> whether to force delete
	 * @param irodsAccount
	 * @throws JargonException
	 */
	void delete(List<String> paths, boolean force, IRODSAccount irodsAccount) throws JargonException {
		log.info("delete()")
		if (!paths) {
			throw new IllegalArgumentException("path is missing")
		}
		if (!irodsAccount) {
			throw new IllegalArgumentException("irodsAccount is missing")
		}
		log.info("force:${force}")
		def irodsFileFactory = irodsAccessObjectFactory.getIRODSFileFactory(irodsAccount)
		def irodsFile
		paths.each{ pathElem ->
			log.info("deleting:${pathElem}")
			irodsFile = irodsFileFactory.instanceIRODSFile(pathElem)
			log.info("irodsFile for delete:${irodsFile}")
			if (force) {
				irodsFile.deleteWithForceOption()
			} else {
				irodsFile.delete()
			}
		}
		log.info("done")
	}

	/**
	 * Idempotent method to create a directory and return a listing entry.  This is so that the entry can easily be 
	 * inserted into an interface
	 * @param path <code>String</code> with an iRODS path
	 * @param irodsAccount
	 * @return <code>CollectionAndDataObjectListingEntry</code> with the 
	 * @throws JargonException
	 */
	CollectionAndDataObjectListingEntry newFolder(String path, IRODSAccount irodsAccount) throws JargonException {
		log.info("newFolder()")
		if (!path) {
			throw new IllegalArgumentException("null or empty path")
		}
		if (!irodsAccount) {
			throw new IllegalArgumentException("irodsAccount is missing")
		}
		def irodsFile = irodsAccessObjectFactory.getIRODSFileFactory(irodsAccount).instanceIRODSFile(path)
		irodsFile.mkdir()

		log.info("dir made, return a listing entry")
		def collectionAO = irodsAccessObjectFactory.getCollectionAO(irodsAccount)
		def listingEntry = collectionAO.getListingEntryForAbsolutePath(path)
		return listingEntry
	}

	/**
	 * Rename a file to a new name within the same parent collection
	 * @param path <code>String</code> with an iRODS path that is the existing path of the file or collection
	 * @param newName <code>String</code> with the new name, in the existing parent collection (this is different from a move)
	 * @param irodsAccount
	 * @return {@link CollectionAndDataObjectListingEntry} that is the new location
	 * @throws JargonException
	 */
	CollectionAndDataObjectListingEntry rename(String path, String newName, IRODSAccount irodsAccount) throws JargonException {
		log.info("rename()")
		if (!path) {
			throw new IllegalArgumentException("null or empty path")
		}
		if (!newName) {
			throw new IllegalArgumentException("null or empty newName")
		}
		if (!irodsAccount) {
			throw new IllegalArgumentException("irodsAccount is missing")
		}

		log.info("path:${path}")
		log.info("newName:${newName}")

		def dataTransferOperations = irodsAccessObjectFactory.getDataTransferOperations(irodsAccount)
		def irodsFileFactory = irodsAccessObjectFactory.getIRODSFileFactory(irodsAccount)
		def sourceFile = irodsFileFactory.instanceIRODSFile(path)
		def targetFile = irodsFileFactory.instanceIRODSFile(sourceFile.parent, newName)
		log.info("target is:${targetFile}...doing move...")
		dataTransferOperations.move(sourceFile, targetFile)
		log.info("move completed")
		def collectionAO = irodsAccessObjectFactory.getCollectionAO(irodsAccount)
		def listingEntry = collectionAO.getListingEntryForAbsolutePath(targetFile.absolutePath)
		log.info("entry for new file:${listingEntry}")
		return listingEntry
	}

	/**
	 * Copy the file or collection from source to target
	 * @param sourcePath irods path to source of copy
	 * @param targetPath irods path to target of copy
	 * @param overwrite indicates whether force is done
	 * @param targetResource indicates resource for copy target, may be left blank to take default
	 * @param irodsAccount
	 * @return {@link CollectionAndDataObjectListingEntry} that is the newly copied file or dir
	 * @throws JargonException
	 */
	CollectionAndDataObjectListingEntry copy(String sourcePath, String targetPath, String targetResource, boolean overwrite, irodsAccount) throws JargonException {
		log.info("rename()")
		if (!sourcePath) {
			throw new IllegalArgumentException("null or empty sourcePath")
		}
		if (!targetPath) {
			throw new IllegalArgumentException("null or empty targetPath")
		}
		if (!irodsAccount) {
			throw new IllegalArgumentException("irodsAccount is missing")
		}

		log.info("sourcePath:${sourcePath}")
		log.info("targetPath:${targetPath}")
		log.info("overwrite:${overwrite}")
		def dataTransferOperations = irodsAccessObjectFactory.getDataTransferOperations(irodsAccount)
		def collectionAO = irodsAccessObjectFactory.getCollectionAO(irodsAccount)
		def transferControlBlock = irodsAccessObjectFactory.buildDefaultTransferControlBlockBasedOnJargonProperties()

		if (overwrite) {
			transferControlBlock.transferOptions.forceOption = ForceOption.USE_FORCE
		} else {
			transferControlBlock.transferOptions.forceOption = ForceOption.NO_FORCE
		}

		log.info("starting copy...")

		dataTransferOperations.copy(sourcePath, targetResource, targetPath, null, transferControlBlock)

		log.info("copy complete")

		def listingEntry = collectionAO.getListingEntryForAbsolutePath(targetPath)
		log.info("entry for new file:${listingEntry}")
		return listingEntry
	}

	/**
	 * Move the file or collection from source to target
	 * <p/>
	 * The move can either be from source to target, or to move the source to a specified physical resource
	 * 
	 * @param sourcePath irods path to source of move
	 * @param targetPath irods path to target of move
	 * @param overwrite indicates whether force is done
	 * @param targetResource indicates resource for move target, may be left blank to take default
	 * @param irodsAccount
	 * @return {@link CollectionAndDataObjectListingEntry} that is the newly copied file or dir
	 * @throws JargonException
	 */
	CollectionAndDataObjectListingEntry move(String sourcePath, String targetPath, String targetResource, irodsAccount) throws JargonException {
		log.info("move()")
		if (!sourcePath) {
			throw new IllegalArgumentException("null or empty sourcePath")
		}
		if (targetPath == null) {
			targetPath = ""
		}
		if (!irodsAccount) {
			throw new IllegalArgumentException("irodsAccount is missing")
		}
		if (targetResource == null) {
			targetResource = ""
		}

		log.info("sourcePath:${sourcePath}")
		log.info("targetPath:${targetPath}")
		log.info("targetResource:${targetResource}")

		/*
		 * Modes
		 *
		 * source moved to target, resource can be provided
		 *
		 * source, no target, resource provided this is a phymove
		 *
		 * source, same target, resource provided, this is a phymove
		 *
		 * otherwise it's an error
		 *
		 */

		if (!targetPath && !targetResource) {
			log.error("targetPath not provided, resource not provided. If a phymove, specify the resource")
			throw new JargonException("No target path or resource provided")
		}

		if (targetPath == sourcePath && !targetResource) {
			log.error("resource not provided for a physical move")
			throw new JargonException("No target path or resource provided")
		}

		def dataTransferOperations = irodsAccessObjectFactory.getDataTransferOperations(irodsAccount)
		def collectionAO = irodsAccessObjectFactory.getCollectionAO(irodsAccount)

		log.info("starting move...")
		def listingEntry = null
		if (sourcePath == targetPath || targetPath == "") {
			log.info("phymove operation")
			dataTransferOperations.physicalMove(sourcePath, targetResource)
			listingEntry = collectionAO.getListingEntryForAbsolutePath(sourcePath)
		} else {
			log.info("move operation")
			dataTransferOperations.move(sourcePath, targetPath)
			listingEntry = collectionAO.getListingEntryForAbsolutePath(targetPath)
		}

		log.info("move complete")
		log.info("entry for new file:${listingEntry}")
		return listingEntry
	}
}

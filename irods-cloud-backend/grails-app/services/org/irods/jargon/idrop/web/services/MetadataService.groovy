package org.irods.jargon.idrop.web.services

import org.irods.jargon.core.connection.IRODSAccount
import org.irods.jargon.core.pub.IRODSAccessObjectFactory
import org.irods.jargon.core.pub.domain.AvuData

/**
 * Handle CRUD on irods AVU metadata
 * @author Mike Conway (DICE)
 */
class MetadataService {

	IRODSAccessObjectFactory irodsAccessObjectFactory
	static transactional = false

	/**
	 * Add an AVU associated with the given path
	 * @param irodsAbsolutePath <code>String</code> with irodsAbsolutePath
	 * @param avuData {@link AvuData} to add
	 * @param irodsAccount {@link IRODSAccount} for operation
	 * @return
	 */
	def addAvu(String irodsAbsolutePath, avuData, irodsAccount) {
		log.info("addAvus")
		if (!irodsAbsolutePath) {
			throw new IllegalArgumentException("null or empty irodsAbsolutePath")
		}

		if (!avuData) {
			throw new IllegalArgumentException("null or empty avuData")
		}

		if (!irodsAccount) {
			throw new IllegalArgumentException("null irodsAccount")
		}

		log.info("absPath:${irodsAbsolutePath}")
		log.info("avuData:${avuData}")
		log.info("irodsAccount:${irodsAccount}")

		def dataObjectAO = irodsAccessObjectFactory.getDataObjectAO(irodsAccount)
		def objStat = dataObjectAO.getObjectStatForAbsolutePath(irodsAbsolutePath)
		if (objStat.isSomeTypeOfCollection()) {
			log.info("collection AVUs")
			def collectionAO = irodsAccessObjectFactory.getCollectionAO(irodsAccount)
			collectionAO.addAVUMetadata(irodsAbsolutePath, avuData)
		} else {
			log.info("data object AVUs")
			dataObjectAO.addAVUMetadata(irodsAbsolutePath, avuData)
		}
	}

	/**
	 * List AVUs for a given data object or collection
	 * @return
	 */
	def listAvus(String irodsAbsolutePath, irodsAccount) {
		log.info("listAvus")
		if (!irodsAbsolutePath) {
			throw new IllegalArgumentException("null or empty irodsAbsolutePath")
		}

		if (!irodsAccount) {
			throw new IllegalArgumentException("null irodsAccount")
		}

		log.info("irodsAbsolutePath:${irodsAbsolutePath}")
		log.info("irodsAccount:${irodsAccount}")

		def dataObjectAO = irodsAccessObjectFactory.getDataObjectAO(irodsAccount)
		def objStat = dataObjectAO.getObjectStatForAbsolutePath(irodsAbsolutePath)
		log.info("objStat:${objStat}")
		def avus
		if (objStat.isSomeTypeOfCollection()) {
			log.info("collection AVUs")
			def collectionAO = irodsAccessObjectFactory.getCollectionAO(irodsAccount)
			avus = collectionAO.findMetadataValuesForCollection(irodsAbsolutePath)
		} else {
			log.info("data object AVUs")
			avus = dataObjectAO.findMetadataValuesForDataObject(irodsAbsolutePath)
		}
		log.info("avus:${avus}")
		return avus
	}

	/**
	 * Update an AVU associated with the given path
	 * @param irodsAbsolutePath <code>String</code> with irodsAbsolutePath
	 * @param oldAvuData {@link AvuData} as it exists
	 * @param newAvuData {@link AvuData} with updates
	 * @param irodsAccount {@link IRODSAccount} for operation
	 * @return
	 */
	def updateAvu(String irodsAbsolutePath, AvuData oldAvuData, AvuData newAvuData, IRODSAccount irodsAccount) {
		log.info("addAvus")
		if (!irodsAbsolutePath) {
			throw new IllegalArgumentException("null or empty irodsAbsolutePath")
		}

		if (!oldAvuData) {
			throw new IllegalArgumentException("null or empty oldAvuData")
		}

		if (!newAvuData) {
			throw new IllegalArgumentException("null or empty newAvuData")
		}

		if (!irodsAccount) {
			throw new IllegalArgumentException("null irodsAccount")
		}

		log.info("absPath:${irodsAbsolutePath}")
		log.info("oldAvuData:${oldAvuData}")
		log.info("newAvuData:${newAvuData}")

		log.info("irodsAccount:${irodsAccount}")

		def dataObjectAO = irodsAccessObjectFactory.getDataObjectAO(irodsAccount)
		def objStat = dataObjectAO.getObjectStatForAbsolutePath(irodsAbsolutePath)
		if (objStat.isSomeTypeOfCollection()) {
			log.info("collection AVUs")
			def collectionAO = irodsAccessObjectFactory.getCollectionAO(irodsAccount)
			collectionAO.modifyAVUMetadata(irodsAbsolutePath, oldAvuData, newAvuData)
		} else {
			log.info("data object AVUs")
			dataObjectAO.modifyAVUMetadata(irodsAbsolutePath, oldAvuData, newAvuData)
		}
	}

	/**
	 * Delete an AVU associated with the given path
	 * @param irodsAbsolutePath <code>String</code> with irodsAbsolutePath
	 * @param avuData {@link AvuData} to delete
	 * @param irodsAccount {@link IRODSAccount} for operation
	 * @return
	 */
	def deleteAvu(String irodsAbsolutePath, AvuData avuData, IRODSAccount irodsAccount) {
		log.info("deleteAvu")
		if (!irodsAbsolutePath) {
			throw new IllegalArgumentException("null or empty irodsAbsolutePath")
		}

		if (!avuData) {
			throw new IllegalArgumentException("null or empty avuData")
		}

		if (!irodsAccount) {
			throw new IllegalArgumentException("null irodsAccount")
		}

		log.info("absPath:${irodsAbsolutePath}")
		log.info("avuData:${avuData}")

		log.info("irodsAccount:${irodsAccount}")

		def dataObjectAO = irodsAccessObjectFactory.getDataObjectAO(irodsAccount)
		def objStat = dataObjectAO.getObjectStatForAbsolutePath(irodsAbsolutePath)
		if (objStat.isSomeTypeOfCollection()) {
			log.info("collection AVUs")
			def collectionAO = irodsAccessObjectFactory.getCollectionAO(irodsAccount)
			collectionAO.deleteAVUMetadata(irodsAbsolutePath, avuData)
		} else {
			log.info("data object AVUs")
			dataObjectAO.deleteAVUMetadata(irodsAbsolutePath, avuData)
		}
	}
}



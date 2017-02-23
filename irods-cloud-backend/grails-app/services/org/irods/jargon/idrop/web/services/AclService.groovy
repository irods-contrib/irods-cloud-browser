package org.irods.jargon.idrop.web.services

/**
 * Service to manage iRODS ACLs and inheritance
 */
import org.irods.jargon.core.connection.IRODSAccount
import org.irods.jargon.core.pub.IRODSAccessObjectFactory


class AclService {


	IRODSAccessObjectFactory irodsAccessObjectFactory
	static transactional = false

	/**
	 * List ACLs for the given user on the given iRODS Path
	 * @param userName <code>String</code> with the user name
	 * @param irodsAbsolutePath  <code>String</code> with the 
	 * @param irodsAccount {@link IRODSAccount} for the logged in user
	 * @return <List> of {@link MetaDataAndDomainData}
	 */
	def listUserAcls(String userName, String irodsAbsolutePath, IRODSAccount irodsAccount) {
		log.info("listUserAcls")
		if (!userName) {
			throw new IllegalArgumentException("null or empty userName")
		}

		if (!irodsAbsolutePath) {
			throw new IllegalArgumentException("null irodsAbsolutePath")
		}

		if (!irodsAccount == null) {
			throw new IllegalArgumentException("null irodsAccount")
		}

		log.info("userName:${userName}")
		log.info("irodsAbsolutePath:${irodsAbsolutePath}")

		def dataObjectAO = irodsAccessObjectFactory.getDataObjectAO(irodsAccount)
		def objStat = dataObjectAO.getObjectStatForAbsolutePath(irodsAbsolutePath)
		if (objStat.isSomeTypeOfCollection()) {
			log.info("collection Acls")
			def collectionAO = irodsAccessObjectFactory.getCollectionAO(irodsAccount)
			return collectionAO.findMetadataValueForCollectionById(objStat, 0)
		} else {
			log.info("data object Acls")
			return dataObjectAO.findMetadataValueForDataObjectById(objStat, 0)
		}
	}
}

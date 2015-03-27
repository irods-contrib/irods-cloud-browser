package org.irods.jargon.idrop.web.services

import org.irods.jargon.core.connection.IRODSAccount
import org.irods.jargon.core.pub.IRODSAccessObjectFactory
import org.irods.jargon.dataprofile.DataProfile

/**
 * Mid-tier wrapper for the {@link DataProfileService} which can gather summary information that characterizes an iRODS file or collection
 * @author Mike Conway - DICE
 *
 */
class DataProfileMidTierService {

	static transactional = false
	IRODSAccessObjectFactory irodsAccessObjectFactory
	DataProfileFactoryService dataProfileFactoryService

	/**
	 * Given an absolute path, return a data profile
	 * @param absolutePath
	 * @param irodsAccount
	 * @return
	 */
	DataProfile retrieveDataProfile(String absolutePath, IRODSAccount irodsAccount) {
		log.info("retrieveDataProfile()")

		if (!absolutePath) {
			throw new IllegalArgumentException("null or empty absolute path")
		}

		if (!irodsAccount) {
			throw new IllegalArgumentException("null or empty irodsAccount")
		}

		def dataProfileService = dataProfileFactoryService.instanceDataProfileService(irodsAccount)
		return dataProfileService.retrieveDataProfile(absolutePath)
	}
}

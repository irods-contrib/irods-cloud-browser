package org.irods.jargon.idrop.web.services

import org.irods.jargon.core.connection.IRODSAccount
import org.irods.jargon.core.pub.IRODSAccessObjectFactory
import org.irods.jargon.dataprofile.DataProfileServiceFactoryImpl

class DataProfileFactoryService {

	static transactional = false
	IRODSAccessObjectFactory irodsAccessObjectFactory

	/**
	 * Get an instance of the virtual collection executor factory for the given account
	 * @param irodsAccount
	 * @return
	 */  
	def instanceDataProfileService(IRODSAccount irodsAccount) {
		def dataProfileServiceFactory = new DataProfileServiceFactoryImpl(irodsAccessObjectFactory, irodsAccount)
		return dataProfileServiceFactory.instanceDataProfileService()
	}
}

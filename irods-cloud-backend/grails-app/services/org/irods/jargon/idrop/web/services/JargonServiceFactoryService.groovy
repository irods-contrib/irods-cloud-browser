package org.irods.jargon.idrop.web.services

import org.irods.jargon.core.connection.IRODSAccount
import org.irods.jargon.core.pub.IRODSAccessObjectFactory
import org.irods.jargon.usertagging.starring.IRODSStarringServiceImpl
import org.irods.jargon.vircoll.impl.VirtualCollectionDiscoveryServiceImpl
import org.irods.jargon.vircoll.impl.VirtualCollectionFactoryImpl

/**
 * This is a bit of slight-of-hand intended to make it easy to mock various services. 
 * @author Mike Conway - DICE
 *
 */
class JargonServiceFactoryService {

	static transactional = false
	IRODSAccessObjectFactory irodsAccessObjectFactory

	/**
	 * Get an instance of the virtual collection executor factory for the given account
	 * @param irodsAccount
	 * @return
	 */
	def instanceVirtualCollectionFactory(IRODSAccount irodsAccount) {
		return new VirtualCollectionFactoryImpl(irodsAccessObjectFactory, irodsAccount)
	}

	/**
	 * Get an instance of the virtual collection discovery service that can find virtual collections
	 * @param irodsAccount
	 * @return
	 */
	def instanceVirtualCollectionDiscoveryService(IRODSAccount irodsAccount) {
		return new VirtualCollectionDiscoveryServiceImpl(irodsAccessObjectFactory, irodsAccount)
	}

	/**
	 * Get an instance of the starring service
	 * @param irodsAccount
	 * @return
	 */
	def instanceStarringService(IRODSAccount irodsAccount) {
		return new IRODSStarringServiceImpl(irodsAccessObjectFactory, irodsAccount)
	}
}

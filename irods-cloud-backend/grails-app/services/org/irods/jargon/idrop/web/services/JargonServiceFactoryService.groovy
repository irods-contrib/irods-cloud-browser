package org.irods.jargon.idrop.web.services

import org.irods.jargon.core.connection.IRODSAccount
import org.irods.jargon.core.exception.JargonRuntimeException
import org.irods.jargon.core.pub.IRODSAccessObjectFactory
import org.irods.jargon.datautils.filesampler.FileSamplerServiceImpl
import org.irods.jargon.filetemplate.impl.DefaultFileTemplateServiceImpl
import org.irods.jargon.usertagging.starring.IRODSStarringServiceImpl
import org.irods.jargon.vircoll.impl.VirtualCollectionDiscoveryServiceImpl
import org.irods.jargon.vircoll.impl.VirtualCollectionFactoryImpl
import org.irods.jargon.zipservice.api.JargonZipServiceImpl
import org.irods.jargon.zipservice.api.ZipServiceConfiguration

/**
 * This is a bit of slight-of-hand intended to make it easy to mock various services. 
 * @author Mike Conway - DICE
 *
 */ 
class JargonServiceFactoryService {

	static transactional = false
	IRODSAccessObjectFactory irodsAccessObjectFactory
	ZipServiceConfiguration zipServiceConfiguration

	/**
	 * Get an instance of the virtual collection executor factory for the given account
	 * @param irodsAccount
	 * @return
	 */
	def instanceVirtualCollectionExecutorFactory(IRODSAccount irodsAccount) {
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

	/**
	 * Obtain an instance of the zip service, which can handle multi-file downloads
	 * @param irodsAccount
	 * @return
	 */
	def instanceJargonZipService(IRODSAccount irodsAccount) {
		if (!zipServiceConfiguration) {
			throw new JargonRuntimeException("no configured zipServiceConfiguration")
		}
		return new JargonZipServiceImpl(zipServiceConfiguration, irodsAccessObjectFactory, irodsAccount)
	}

	/**
	 * Obtain an instance of the {@link FileTemplateService} that can create files from templates
	 * @param irodsAccount
	 * @return
	 */
	def instanceFileTemplateService(IRODSAccount irodsAccount) {
		return new DefaultFileTemplateServiceImpl(irodsAccessObjectFactory, irodsAccount)
	}

	/**
	 * Obtain and instance of the {@link FileSamplerService} which can sample and stringify iRODS files
	 * @param irodsAccount
	 * @return
	 */
	def instanceFileSamplerService(IRODSAccount irodsAccount) {
		return new FileSamplerServiceImpl(irodsAccessObjectFactory, irodsAccount)
	}
}

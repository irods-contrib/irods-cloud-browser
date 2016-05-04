package org.irods.jargon.idrop.web.services

import javax.servlet.http.HttpSession

import org.irods.jargon.core.connection.IRODSAccount
import org.irods.jargon.core.exception.DataNotFoundException
import org.irods.jargon.core.pub.IRODSAccessObjectFactory
import org.irods.jargon.vircoll.CollectionTypes
import org.irods.jargon.vircoll.impl.VirtualCollectionDiscoveryServiceImpl

class VirtualCollectionService {

	static transactional = false
	IRODSAccessObjectFactory irodsAccessObjectFactory
	JargonServiceFactoryService jargonServiceFactoryService
	IrodsCollectionService irodsCollectionService

	public enum ListingType {
		ALL, COLLECTIONS, DATA_OBJECTS
	}

	/**
	 * Get the default list of virtual collections associated with a user
	 * @param irodsAccount {@link IRODSAccount} for the target user
	 * @return <code>List</code> of {@link AbstractVirtualCollection} 
	 */
	def virtualCollectionHomeListingForUser(IRODSAccount irodsAccount, HttpSession session) {

		log.info("virtualCollectionHomeListingForUser()")

		if (!irodsAccount) {
			throw new IllegalArgumentException("null irodsAccount")
		}

		log.info("irodsAccount: ${irodsAccount}")

		def virtualCollectionDiscoveryService = new VirtualCollectionDiscoveryServiceImpl(irodsAccessObjectFactory, irodsAccount)
		def colls = virtualCollectionDiscoveryService.userVirtualCollectionProfile(irodsAccount.getUserName())
		session.virtualCollections = colls

		return colls
	}

	/**
	 * Get the requested virtual collection data, which should be cached in the session. If it is not yet cached,the vcs for the user will be refreshed
	 * @param vcName <code>String</coee> with the name of the virtual collection to retrieve
	 * @param irodsAccount
	 * @param session
	 * @return
	 */
	def virtualCollectionDetails(String vcName, IRODSAccount irodsAccount, HttpSession session) {

		log.info("virtualCollectionDetails()")

		if (!vcName) {
			throw new IllegalArgumentException("null or empty vcName")
		}

		if (!irodsAccount) {
			throw new IllegalArgumentException("null irodsAccount")
		}

		if (!session) {
			throw new IllegalArgumentException("null session")
		}

		log.info("getting info for vc name:${vcName}")

		def vcsInSession = session.virtualCollections

		if (!vcsInSession) {
			log.info("re-acquiring listing")
			vcsInSession = virtualCollectionHomeListingForUser(irodsAccount, session)
		}

		for (vc in vcsInSession.userHomeCollections) {
			if (vc.uniqueName == vcName) {
				log.info("found: ${vc}")
				return vc
			}
		}

		log.info("not found in home colls, check in temporary queries")

		for (vc in vcsInSession.userRecentQueries) {
			if (vc.uniqueName == vcName) {
				log.info("found: ${vc}")
				return vc
			}
		}

		// should have returned....what happened?
		log.error("no vc found for name:${vcName}")
		throw new DataNotFoundException("could not find requested virtual collection")

	}


	/**
	 * Given a virtual collection type, generate a listing of data for display, incorporating a path if the virtual collection supports subpaths
	 * @param vcName
	 * @param path
	 * @param listingType
	 * @param offset
	 * @param irodsAccount
	 * @return
	 */
	def virtualCollectionListing(String vcName, String path, ListingType listingType, int offset, IRODSAccount irodsAccount, HttpSession session) {

		log.info("virtualCollectionListing")

		if (!vcName) {
			throw new IllegalArgumentException("null or empty vcName")
		}

		if (!listingType) {
			throw new IllegalArgumentException("null or empty listingType")
		}

		if (!irodsAccount) {
			throw new IllegalArgumentException("null irodsAccount")
		}

		log.info("listing for vc: ${vcName} listing type:${listingType} offset:{$offset}")

		def virColls = session.virtualCollections

		if (virColls == null) {
			log.info("virtual collections not yet cached, do so")
			virColls = virtualCollectionHomeListingForUser(irodsAccount, session)
		}

		// FIXME: refactor into a service that can search across different vcs
		def virColl
		for (virCollEntry in virColls.userHomeCollections) {
			if (virCollEntry.uniqueName == vcName) {
				log.info("found it")
				session.virtualCollection = virCollEntry
				virColl = virCollEntry
				break
			}
		}

		if (!virColl) {
			log.info("not in home colls, try saved queries")
		}

		for (virCollEntry in virColls.userRecentQueries) {
			if (virCollEntry.uniqueName == vcName) {
				log.info("found it")
				session.virtualCollection = virCollEntry
				virColl = virCollEntry
				break
			}
		}

		if (!virColl) {
			throw new Exception("no virtual collections found for name:${vcName}")
		}

		log.info("vircoll is:${virColl}")

		/* 
		 * If the given virtual collection is not collection based virtual collection, this method will return the contents based on that vc
		 * <p/>
		 * If this is a virtual collection, and no path is provided, it will return the contents based on that VC.  If a path is provided, it is checked to make sure it
		 * is 'below' that VC, and if so, the contents are returned based on the given subpath.
		 *
		 */


		log.info("not a collection based vc, so use an executor for the listing")
		def executorFactory = jargonServiceFactoryService.instanceVirtualCollectionExecutorFactory(irodsAccount)
		def executor = executorFactory.instanceExecutorBasedOnVirtualCollection(virColl)
		if (listingType == ListingType.ALL) {

			return executor.queryAll(path, offset)
		} else {
			throw new UnsupportedOperationException("not supported yet")
		}
	}



	/**
	 * Move all virtual collections in the given list to a new type (e.g. move from temporary to user home)
	 * @param uniqueNames list of unique names
	 * @param irodsAccount
	 * @param httpSession
	 * @return
	 */
	def moveVirtualCollections(String[] uniqueNames, CollectionTypes collectionType, IRODSAccount irodsAccount, HttpSession httpSession) {
		log.info("moveVirtualCollections()")
		if (!uniqueNames) {
			throw new IllegalArgumentException("missing uniqueNames")
		}

		if (!collectionType) {
			throw new IllegalArgumentException("missing collectionType")
		}

		if (!irodsAccount) {
			throw new IllegalArgumentException("null irodsAccount")
		}

		if (!httpSession) {
			throw new IllegalArgumentException("null httpSession")
		}


		log.info("moving: ${uniqueNames}")
		def virtualCollectionMaintenanceService = jargonServiceFactoryService.instanceGenericVirtualCollectionMaintenanceService(irodsAccount)
		uniqueNames.each{uniqueName -> virtualCollectionMaintenanceService.reclassifyVirtualCollection(collectionType,uniqueName)}
		httpSession.virtualCollections = null

	}

	/**
	 * Delete all unique names in the given list
	 * @param uniqueNames list of unique names
	 * @param irodsAccount
	 * @param httpSession
	 * @return
	 */
	def deleteVirtualCollections(String[] uniqueNames, IRODSAccount irodsAccount, HttpSession httpSession) {
		log.info("deleteVirtualCollections()")
		if (!uniqueNames) {
			throw new IllegalArgumentException("missing uniqueNames")
		}
		if (!irodsAccount) {
			throw new IllegalArgumentException("null irodsAccount")
		}

		if (!httpSession) {
			throw new IllegalArgumentException("null httpSession")
		}


		log.info("deleting: ${uniqueNames}")
		def virtualCollectionMaintenanceService = jargonServiceFactoryService.instanceGenericVirtualCollectionMaintenanceService(irodsAccount)
		uniqueNames.each{uniqueName -> virtualCollectionMaintenanceService.deleteVirtualCollection(uniqueName)}
		httpSession.virtualCollections = null

	}
}

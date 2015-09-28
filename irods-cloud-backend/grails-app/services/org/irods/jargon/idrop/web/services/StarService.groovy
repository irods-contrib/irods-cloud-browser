package org.irods.jargon.idrop.web.services



/**
 * Handle starring and unstarring of files
 * @author Mike Conway (DICE)
 */
class StarService {

	JargonServiceFactoryService jargonServiceFactoryService
	static transactional = false

	/**
	 * Add a 'star' to the given path in an idempotent manner
	 * @return
	 */
	def addStar(String irodsAbsolutePath, irodsAccount) {
		log.info("addtar")
		if (!irodsAbsolutePath) {
			throw new IllegalArgumentException("null or empty irodsAbsolutePath")
		}

		if (!irodsAccount) {
			throw new IllegalArgumentException("null irodsAccount")
		}

		log.info("irodsAbsolutePath:${irodsAbsolutePath}")
		log.info("irodsAccount:${irodsAccount}")


		def irodsStarringService = jargonServiceFactoryService.instanceStarringService(irodsAccount)
		irodsStarringService.starFileOrCollection(irodsAbsolutePath, "Starred from Cloud Browser")
	}

	def removeStar(String irodsAbsolutePath, irodsAccount) {
		log.info("removeStar")
		if (!irodsAbsolutePath) {
			throw new IllegalArgumentException("null or empty irodsAbsolutePath")
		}

		if (!irodsAccount) {
			throw new IllegalArgumentException("null irodsAccount")
		}

		log.info("irodsAbsolutePath:${irodsAbsolutePath}")
		log.info("irodsAccount:${irodsAccount}")


		def irodsStarringService = jargonServiceFactoryService.instanceStarringService(irodsAccount)
		irodsStarringService.unstarFileOrCollection(irodsAbsolutePath)
	}
}



package org.irods.jargon.idrop.web.services

import org.irods.jargon.core.connection.IRODSAccount
import org.irods.jargon.core.pub.IRODSAccessObjectFactory


/**
 * Service to manage rule editing via the rule workbench and management of the delay exec queue
 * @author Mike Conway - DICE
 *
 */
class RuleWorkbenchService {

	IRODSAccessObjectFactory irodsAccessObjectFactory
	JargonServiceFactoryService jargonServiceFactoryService

	static transactional = false

	/**
	 * Load the iRODS rule at the given path
	 * @param irodsAbsolutePath
	 * @param irodsAccount
	 * @return
	 */
	def loadRuleFromIrods(String irodsAbsolutePath, IRODSAccount irodsAccount) {
		log.info("loadRuleFromIrods()")
		if (!irodsAbsolutePath) {
			throw new IllegalArgumentException("null or empty irodsAbsolutePath")
		}
		log.info("irodsAbsolutePath for rule:${irodsAbsolutePath}")

		def ruleCompositionService = jargonServiceFactoryService.instanceRuleCompositionService(irodsAccount)
		return ruleCompositionService.loadRuleFromIrods(irodsAbsolutePath)
	}
}

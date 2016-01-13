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

		if (!irodsAccount) {
			throw new IllegalArgumentException("null irodsAccount")
		}

		if (!irodsAbsolutePath) {
			throw new IllegalArgumentException("null or empty irodsAbsolutePath")
		}
		log.info("irodsAbsolutePath for rule:${irodsAbsolutePath}")

		def ruleCompositionService = jargonServiceFactoryService.instanceRuleCompositionService(irodsAccount)
		return ruleCompositionService.loadRuleFromIrods(irodsAbsolutePath)
	}

	/**
	 * Given a raw <code>String</code> that is the text of an iRODS rule, run that rule
	 * @param rule <code>String</code> with the raw rule
	 * @param irodsAccount {@link IRODSAccount}
	 * @return {@link IRODSRuleExecResult} with the output parameters and log
	 *         from the rule
	 */
	def executeRuleAsRawString(String rule, IRODSAccount irodsAccount) {
		log.info("executeRuleFromRawString()")
		if (!rule) {
			throw new IllegalArgumentException("null or empty rule")
		}
		if (!irodsAccount) {
			throw new IllegalArgumentException("null irodsAccount")
		}
		def ruleCompositionService = jargonServiceFactoryService.instanceRuleCompositionService(irodsAccount)
		return ruleCompositionService.executeRuleAsRawString(rule)
	}

	/**
	 * Load the iRODS rule at the given path as a raw string
	 * @param irodsAbsolutePath
	 * @param irodsAccount
	 * @return rule as a raw string
	 */
	def loadRawRuleFromIrods(String irodsAbsolutePath, IRODSAccount irodsAccount) {
		log.info("loadRawRuleFromIrods()")

		if (!irodsAccount) {
			throw new IllegalArgumentException("null irodsAccount")
		}

		if (!irodsAbsolutePath) {
			throw new IllegalArgumentException("null or empty irodsAbsolutePath")
		}
		log.info("irodsAbsolutePath for rule:${irodsAbsolutePath}")

		def ruleCompositionService = jargonServiceFactoryService.instanceRuleCompositionService(irodsAccount)
		return ruleCompositionService.loadRuleFromIrodsAsString(irodsAbsolutePath)
	}


	/**
	 * Store a rule from its constituent parts
	 * @param ruleAbsolutePath
	 * @param ruleBody
	 * @param inputParameters
	 * @param outputParameters
	 * @param irodsAccount
	 * @return {@link Rule}
	 */
	def storeRuleFromParts( String ruleAbsolutePath,
			String ruleBody,   List inputParameters,
			List outputParameters,  IRODSAccount irodsAccount) {

		log.info("storeRuleFromParts()")
		if (ruleAbsolutePath == null || ruleAbsolutePath.isEmpty()) {
			throw new IllegalArgumentException("null or empty ruleAbsolutePath")
		}

		if (ruleBody == null || ruleBody.isEmpty()) {
			throw new IllegalArgumentException("null or empty ruleBody")
		}

		if (inputParameters == null) {
			throw new IllegalArgumentException("null inputParameters")
		}

		if (outputParameters == null) {
			throw new IllegalArgumentException("null outputParameters")
		}

		if (!irodsAccount) {
			throw new IllegalArgumentException("null irodsAccount")
		}

		log.info("ruleAbsolutePath:${ruleAbsolutePath}")
		log.info("inputParameters:${inputParameters}")
		log.info("outputParameters:${outputParameters}")

		def ruleCompositionService = jargonServiceFactoryService.instanceRuleCompositionService(irodsAccount)
		return ruleCompositionService.storeRuleFromParts(ruleAbsolutePath, ruleBody, inputParameters, outputParameters)
	}

	/**
	 * Store a rule from a raw string
	 * @param ruleAbsolutePath <code>String</code> with iRODS path for rule
	 * @param ruleBody <code>String</code> with the raw iRODS rule
	 * @param irodsAccount
	 * @return {@link Rule}
	 */
	def storeRuleFromRawString( String ruleAbsolutePath,
			String ruleBody,  IRODSAccount irodsAccount) {

		log.info("storeRuleFromRawString()")
		if (ruleAbsolutePath == null || ruleAbsolutePath.isEmpty()) {
			throw new IllegalArgumentException("null or empty ruleAbsolutePath")
		}

		if (ruleBody == null || ruleBody.isEmpty()) {
			throw new IllegalArgumentException("null or empty ruleBody")
		}

		if (!irodsAccount) {
			throw new IllegalArgumentException("null irodsAccount")
		}

		log.info("ruleAbsolutePath:${ruleAbsolutePath}")
		log.info("ruleBody:${ruleBody}")

		def ruleCompositionService = jargonServiceFactoryService.instanceRuleCompositionService(irodsAccount)
		return ruleCompositionService.storeRule(ruleAbsolutePath, ruleBody)
	}



	/**
	 * Execute the given rule from its parts
	 * @param ruleBody
	 * @param inputParams
	 * @param outputParams
	 * @param irodsAccount
	 * @return
	 */
	def executeRuleFromParts(String ruleBody, List<String> inputParameters, List<String> outputParameters, IRODSAccount irodsAccount) {
		log.info("executeRuleFromParts()")

		if (ruleBody == null || ruleBody.isEmpty()) {
			throw new IllegalArgumentException("null or empty ruleBody")
		}

		if (inputParameters == null) {
			throw new IllegalArgumentException("null inputParameters")
		}

		if (outputParameters == null) {
			throw new IllegalArgumentException("null outputParameters")
		}

		if (!irodsAccount) {
			throw new IllegalArgumentException("null irodsAccount")
		}

		log.info("ruleBody:${ruleBody}")
		log.info("inputParameters:${inputParameters}")
		log.info("outputParameters:${outputParameters}")

		def ruleCompositionService = jargonServiceFactoryService.instanceRuleCompositionService(irodsAccount)
		return ruleCompositionService.executeRuleFromParts(ruleBody, inputParameters, outputParameters)
	}
}

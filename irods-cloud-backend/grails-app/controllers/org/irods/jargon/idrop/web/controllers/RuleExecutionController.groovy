package org.irods.jargon.idrop.web.controllers

import grails.converters.JSON
import grails.rest.RestfulController

import org.irods.jargon.core.pub.IRODSAccessObjectFactory
import org.irods.jargon.idrop.web.services.RuleWorkbenchService

class RuleExecutionController extends RestfulController {

	static responseFormats = ['json']
	IRODSAccessObjectFactory irodsAccessObjectFactory
	RuleWorkbenchService ruleWorkbenchService


	/**
	 * POST operation executes the rule, which in this first iteration is a raw string with the entire rule, returning the result of executing that rule
	 * @return {@link IRODSRuleExecutionResult}
	 */

	def save() {
		log.info("save() handling POST that runs a rule")

		def irodsAccount = request.irodsAccount
		def rule = params.rule

		if (!irodsAccount) throw new IllegalArgumentException("no irodsAccount in request")
		if (!rule) throw new IllegalArgumentException("no rule in request")

		log.info("rule:${rule}")
		render ruleWorkbenchService.executeRuleAsRawString(rule, irodsAccount) as JSON
	}
}

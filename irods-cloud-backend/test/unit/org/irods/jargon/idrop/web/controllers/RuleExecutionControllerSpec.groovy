package org.irods.jargon.idrop.web.controllers

import grails.test.mixin.*

import org.irods.jargon.core.connection.IRODSAccount
import org.irods.jargon.core.rule.IRODSRule
import org.irods.jargon.core.rule.IRODSRuleExecResult
import org.irods.jargon.core.rule.IRODSRuleExecResultOutputParameter
import org.irods.jargon.core.rule.IRODSRuleParameter
import org.irods.jargon.idrop.web.services.RuleWorkbenchService

import spock.lang.Specification

/**
 * See the API for {@link grails.test.mixin.web.ControllerUnitTestMixin} for usage instructions
 */
@TestFor(RuleExecutionController)
class RuleExecutionControllerSpec extends Specification {

	def "should execute rule from raw string"() {
		given:

		IRODSRule irodsRule = IRODSRule.instance("text", new ArrayList<IRODSRuleParameter>(), new ArrayList<IRODSRuleParameter>(), "ruleText")
		def irodsRuleExecResult = IRODSRuleExecResult.instance(irodsRule, new HashMap<String, IRODSRuleExecResultOutputParameter>())


		def ruleService = mockFor(RuleWorkbenchService)
		ruleService.demand.executeRuleAsRawString{rle, ia -> return irodsRuleExecResult}
		controller.ruleWorkbenchService = ruleService.createMock()


		IRODSAccount testAccount = IRODSAccount.instance("host", 1247, "user", "password", "","zone", "")
		request.irodsAccount = testAccount
		params.rule = "blah"

		when:
		controller.save()

		then:
		controller.response.status == 200
		log.info("response JSON:${controller.response.text}")
	}
}

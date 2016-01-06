package org.irods.jargon.idrop.web.controllers

import grails.test.mixin.*

import org.irods.jargon.core.connection.IRODSAccount
import org.irods.jargon.core.rule.IRODSRuleParameter
import org.irods.jargon.idrop.web.services.RuleWorkbenchService

import spock.lang.Specification

/**
 * See the API for {@link grails.test.mixin.web.ControllerUnitTestMixin} for usage instructions
 */
@TestFor(RuleExecutionController)
class RuleExecutionControllerSpec extends Specification {

	def "should load rule from file with params"() {
		given:

		def org.irods.jargon.ruleservice.composition.Rule rule = new org.irods.jargon.ruleservice.composition.Rule()
		def inputParam = [
			new IRODSRuleParameter("input1", "value")
		]
		def outputParam = [
			new IRODSRuleParameter("output1", "value")
		]

		rule.setInputParameters(inputParam)
		rule.setOutputParameters(outputParam)
		def ruleService = mockFor(RuleWorkbenchService)
		ruleService.demand.loadRuleFromIrods{pth, ia -> return rule}
		controller.ruleWorkbenchService = ruleService.createMock()


		IRODSAccount testAccount = IRODSAccount.instance("host", 1247, "user", "password", "","zone", "")
		request.irodsAccount = testAccount
		params.irodsPath = "/a/path"

		when:
		controller.show()

		then:
		controller.response.status == 200
		log.info("response JSON:${controller.response.text}")
	}

	def "should load rule with no parms from file"() {
		given:

		def org.irods.jargon.ruleservice.composition.Rule rule = new org.irods.jargon.ruleservice.composition.Rule()


		def ruleService = mockFor(RuleWorkbenchService)
		ruleService.demand.loadRuleFromIrods{pth, ia -> return rule}
		controller.ruleWorkbenchService = ruleService.createMock()


		IRODSAccount testAccount = IRODSAccount.instance("host", 1247, "user", "password", "","zone", "")
		request.irodsAccount = testAccount
		params.irodsPath = "/a/path"

		when:
		controller.show()

		then:
		controller.response.status == 200
		log.info("response JSON:${controller.response.text}")
	}
}

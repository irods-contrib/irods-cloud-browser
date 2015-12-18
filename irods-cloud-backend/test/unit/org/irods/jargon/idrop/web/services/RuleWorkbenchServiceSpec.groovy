package org.irods.jargon.idrop.web.services

import grails.test.mixin.*

import org.irods.jargon.core.connection.IRODSAccount
import org.irods.jargon.core.pub.IRODSAccessObjectFactory
import org.irods.jargon.ruleservice.composition.RuleCompositionService

import spock.lang.Specification

/**
 * See the API for {@link grails.test.mixin.services.ServiceUnitTestMixin} for usage instructions
 */
@TestFor(RuleWorkbenchService)
class RuleWorkbenchServiceSpec extends Specification {

	void "should load a rule"() {

		given:
		IRODSAccount irodsAccount = IRODSAccount.instance("host", 1247, "user", "password", "", "zone", "")
		String absPath = "/a/b/c.txt"
		String ruleText = "blah"
		def irodsAccessObjectFactory = mockFor(IRODSAccessObjectFactory)
		def irodsAccessObjectFactoryMock = irodsAccessObjectFactory.createMock()

		def ruleCompositionService = mockFor(RuleCompositionService)
		def org.irods.jargon.ruleservice.composition.Rule rule = new org.irods.jargon.ruleservice.composition.Rule()
		ruleCompositionService.demand.loadRuleFromIrods{pth-> return rule}
		def ruleCompositionServiceMock = ruleCompositionService.createMock()

		def jargonServiceFactoryService = mockFor(JargonServiceFactoryService)
		jargonServiceFactoryService.demand.instanceRuleCompositionService{act1 -> return ruleCompositionServiceMock}
		def jargonServiceFactoryServiceMock = jargonServiceFactoryService.createMock()

		def ruleWorkbenchService = new RuleWorkbenchService()
		ruleWorkbenchService.irodsAccessObjectFactory = irodsAccessObjectFactoryMock
		ruleWorkbenchService.jargonServiceFactoryService = jargonServiceFactoryServiceMock


		when:

		def actual = ruleWorkbenchService.loadRuleFromIrods(absPath, irodsAccount)

		then:

		actual != null
		actual instanceof org.irods.jargon.ruleservice.composition.Rule
	}

	def "should store a rule from parts"() {
		given:
		IRODSAccount irodsAccount = IRODSAccount.instance("host", 1247, "user", "password", "", "zone", "")
		String absPath = "/a/b/c.txt"
		String ruleText = "blah"
		List<String> inputParms = ["parm1", "parm2"]
		List<String> outputParms = ["parm1", "parm2"]

		def irodsAccessObjectFactory = mockFor(IRODSAccessObjectFactory)
		def irodsAccessObjectFactoryMock = irodsAccessObjectFactory.createMock()

		def ruleCompositionService = mockFor(RuleCompositionService)
		def org.irods.jargon.ruleservice.composition.Rule rule = new org.irods.jargon.ruleservice.composition.Rule()
		ruleCompositionService.demand.storeRuleFromParts{ap, bd, inp, outp-> return rule}
		def ruleCompositionServiceMock = ruleCompositionService.createMock()

		def jargonServiceFactoryService = mockFor(JargonServiceFactoryService)
		jargonServiceFactoryService.demand.instanceRuleCompositionService{act1 -> return ruleCompositionServiceMock}
		def jargonServiceFactoryServiceMock = jargonServiceFactoryService.createMock()

		def ruleWorkbenchService = new RuleWorkbenchService()
		ruleWorkbenchService.irodsAccessObjectFactory = irodsAccessObjectFactoryMock
		ruleWorkbenchService.jargonServiceFactoryService = jargonServiceFactoryServiceMock


		when:

		def actual = ruleWorkbenchService.storeRuleFromParts(absPath, ruleText, inputParms, outputParms, irodsAccount)

		then:

		actual != null
		actual instanceof org.irods.jargon.ruleservice.composition.Rule
	}
}

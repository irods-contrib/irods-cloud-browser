package org.irods.jargon.idrop.web.services

import grails.test.mixin.*

import org.irods.jargon.core.connection.IRODSAccount
import org.irods.jargon.core.pub.IRODSAccessObjectFactory
import org.irods.jargon.core.rule.IRODSRule
import org.irods.jargon.core.rule.IRODSRuleExecResult
import org.irods.jargon.core.rule.IRODSRuleExecResultOutputParameter
import org.irods.jargon.core.rule.IRODSRuleParameter
import org.irods.jargon.ruleservice.composition.Rule
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

	void "should load a rule as a raw string"() {

		given:
		IRODSAccount irodsAccount = IRODSAccount.instance("host", 1247, "user", "password", "", "zone", "")
		String absPath = "/a/b/c.txt"
		String ruleText = "blah"
		def irodsAccessObjectFactory = mockFor(IRODSAccessObjectFactory)
		def irodsAccessObjectFactoryMock = irodsAccessObjectFactory.createMock()

		def ruleCompositionService = mockFor(RuleCompositionService)
		def  rule = ruleText
		ruleCompositionService.demand.loadRuleFromIrodsAsString{pth-> return ruleText}
		def ruleCompositionServiceMock = ruleCompositionService.createMock()

		def jargonServiceFactoryService = mockFor(JargonServiceFactoryService)
		jargonServiceFactoryService.demand.instanceRuleCompositionService{act1 -> return ruleCompositionServiceMock}
		def jargonServiceFactoryServiceMock = jargonServiceFactoryService.createMock()

		def ruleWorkbenchService = new RuleWorkbenchService()
		ruleWorkbenchService.irodsAccessObjectFactory = irodsAccessObjectFactoryMock
		ruleWorkbenchService.jargonServiceFactoryService = jargonServiceFactoryServiceMock


		when:

		def actual = ruleWorkbenchService.loadRawRuleFromIrods(absPath, irodsAccount)

		then:

		actual != null
		actual == ruleText
	}


	void "should execute a rule from a raw string"() {

		given:
		IRODSAccount irodsAccount = IRODSAccount.instance("host", 1247, "user", "password", "", "zone", "")
		String absPath = "/a/b/c.txt"
		String ruleText = "blah"
		def irodsAccessObjectFactory = mockFor(IRODSAccessObjectFactory)
		def irodsAccessObjectFactoryMock = irodsAccessObjectFactory.createMock()

		def ruleCompositionService = mockFor(RuleCompositionService)

		IRODSRule irodsRule = IRODSRule.instance("text", new ArrayList<IRODSRuleParameter>(), new ArrayList<IRODSRuleParameter>(), "ruleText")
		def irodsRuleExecResult = IRODSRuleExecResult.instance(irodsRule, new HashMap<String, IRODSRuleExecResultOutputParameter>())

		ruleCompositionService.demand.executeRuleAsRawString{pth-> return irodsRuleExecResult}
		def ruleCompositionServiceMock = ruleCompositionService.createMock()

		def jargonServiceFactoryService = mockFor(JargonServiceFactoryService)
		jargonServiceFactoryService.demand.instanceRuleCompositionService{act1 -> return ruleCompositionServiceMock}
		def jargonServiceFactoryServiceMock = jargonServiceFactoryService.createMock()

		def ruleWorkbenchService = new RuleWorkbenchService()
		ruleWorkbenchService.irodsAccessObjectFactory = irodsAccessObjectFactoryMock
		ruleWorkbenchService.jargonServiceFactoryService = jargonServiceFactoryServiceMock


		when:

		def actual = ruleWorkbenchService.executeRuleAsRawString(ruleText, irodsAccount)

		then:

		actual != null
	}

	void "should store a rule from a raw string"() {

		given:
		IRODSAccount irodsAccount = IRODSAccount.instance("host", 1247, "user", "password", "", "zone", "")
		String absPath = "/a/b/c.txt"
		String ruleText = "blah"
		def irodsAccessObjectFactory = mockFor(IRODSAccessObjectFactory)
		def irodsAccessObjectFactoryMock = irodsAccessObjectFactory.createMock()

		def ruleCompositionService = mockFor(RuleCompositionService)

		def org.irods.jargon.ruleservice.composition.Rule rule = new org.irods.jargon.ruleservice.composition.Rule()
		ruleCompositionService.demand.storeRule{ap, st-> return rule}
		def ruleCompositionServiceMock = ruleCompositionService.createMock()

		def jargonServiceFactoryService = mockFor(JargonServiceFactoryService)
		jargonServiceFactoryService.demand.instanceRuleCompositionService{act1 -> return ruleCompositionServiceMock}
		def jargonServiceFactoryServiceMock = jargonServiceFactoryService.createMock()

		def ruleWorkbenchService = new RuleWorkbenchService()
		ruleWorkbenchService.irodsAccessObjectFactory = irodsAccessObjectFactoryMock
		ruleWorkbenchService.jargonServiceFactoryService = jargonServiceFactoryServiceMock


		when:

		def actual = ruleWorkbenchService.storeRuleFromRawString(absPath, ruleText, irodsAccount)

		then:

		actual != null
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

	def "should execute a rule from parts"() {
		given:
		IRODSAccount irodsAccount = IRODSAccount.instance("host", 1247, "user", "password", "", "zone", "")
		String absPath = "/a/b/c.txt"
		String ruleText = "blah"
		List<String> inputParms = ["parm1", "parm2"]
		List<String> outputParms = ["parm1", "parm2"]

		def irodsAccessObjectFactory = mockFor(IRODSAccessObjectFactory)
		def irodsAccessObjectFactoryMock = irodsAccessObjectFactory.createMock()

		def ruleCompositionService = mockFor(RuleCompositionService)
		def IRODSRuleExecResult ruleExecResult = IRODSRuleExecResult.instance(IRODSRule.instance(ruleText, inputParms, outputParms, ruleText), new HashMap<String, IRODSRuleExecResultOutputParameter>())
		ruleCompositionService.demand.executeRuleFromParts{bd, inp, outp-> return ruleExecResult}
		def ruleCompositionServiceMock = ruleCompositionService.createMock()

		def jargonServiceFactoryService = mockFor(JargonServiceFactoryService)
		jargonServiceFactoryService.demand.instanceRuleCompositionService{act1 -> return ruleCompositionServiceMock}
		def jargonServiceFactoryServiceMock = jargonServiceFactoryService.createMock()

		def ruleWorkbenchService = new RuleWorkbenchService()
		ruleWorkbenchService.irodsAccessObjectFactory = irodsAccessObjectFactoryMock
		ruleWorkbenchService.jargonServiceFactoryService = jargonServiceFactoryServiceMock

		when:

		def actual = ruleWorkbenchService.executeRuleFromParts(ruleText, inputParms, outputParms, irodsAccount)

		then:

		actual != null
		actual instanceof IRODSRuleExecResult
	}
}

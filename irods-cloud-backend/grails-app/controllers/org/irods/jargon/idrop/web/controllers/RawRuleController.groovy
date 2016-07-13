package org.irods.jargon.idrop.web.controllers

import grails.converters.JSON
import grails.rest.RestfulController

import org.irods.jargon.core.pub.IRODSAccessObjectFactory
import org.irods.jargon.idrop.web.services.RuleWorkbenchService

class RawRuleController extends RestfulController {

	static responseFormats = ['json']
	IRODSAccessObjectFactory irodsAccessObjectFactory
	RuleWorkbenchService ruleWorkbenchService


	def index() {
		log.info("index()")
		show()
	}
	/**
	 * GET operation gets the rule at the path
	 * @return
	 */
	def show() {
		log.info("index() gets content of a file")
		def irodsAccount = request.irodsAccount
		def irodsPath = params.irodsPath

		if (!irodsAccount) throw new IllegalArgumentException("no irodsAccount in request")
		if (!irodsPath) throw new IllegalArgumentException("no irodsPath in request")
		log.info("irodsPath:${irodsPath}")

		def rule = ruleWorkbenchService.loadRawRuleFromIrods(irodsPath, irodsAccount)
		def ruleText = new RawRuleText()
		ruleText.ruleText = rule
		log.info("have rule:${rule}")
		render ruleText as JSON
	}


	def save() {
		log.info("save() handles POST to store a rule")
		def irodsAccount = request.irodsAccount
		def irodsPath = params.irodsPath
		def rule = params.rule

		if (!irodsAccount) throw new IllegalArgumentException("no irodsAccount in request")
		if (!irodsPath) throw new IllegalArgumentException("no irodsPath in request")
		if (!rule) throw new IllegalArgumentException("no rule in request")

		log.info("irodsPath:${irodsPath}")
		log.info("rule:${rule}")

		render ruleWorkbenchService.storeRuleFromRawString(irodsPath, rule, irodsAccount) as JSON
	}
}

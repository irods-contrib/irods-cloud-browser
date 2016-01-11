package org.irods.jargon.idrop.web.controllers

import grails.converters.JSON
import grails.rest.RestfulController

import org.irods.jargon.core.pub.IRODSAccessObjectFactory
import org.irods.jargon.idrop.web.services.RuleWorkbenchService

class RuleExecutionController extends RestfulController {

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
		def ruleAsString = params.ruleAsString

		if (!irodsAccount) throw new IllegalArgumentException("no irodsAccount in request")
		if (!irodsPath) throw new IllegalArgumentException("no irodsPath in request")
		log.info("irodsPath:${irodsPath}")

		def rule = null
		if (ruleAsString) {
			log.info("present rule as a string")
		} else {
			log.info("present rule as a formatted rule object")
			rule = ruleWorkbenchService.loadRuleFromIrods(irodsPath, irodsAccount)
		}

		log.info("have rule:${rule}")
		render rule as JSON
	}
}

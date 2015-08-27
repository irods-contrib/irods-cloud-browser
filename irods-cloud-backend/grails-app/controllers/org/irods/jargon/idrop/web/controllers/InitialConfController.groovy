package org.irods.jargon.idrop.web.controllers

import grails.converters.JSON
import grails.rest.RestfulController
import org.irods.jargon.idrop.web.config.GeneralBackendConfig

/**
 * Simple controller to obtain any static configuration from the back end server that can configure the browser behavior. This is basic global
 * configuration prior to obtaining any user-specific information after logging in.  This might include login presets, 
 * theme information, and the like
 * @author Mike Conway - DICE
 *
 */
class InitialConfController extends RestfulController {

	static responseFormats = ['json']


	def show() {
		log.info("show")

		def genBackendConfig = new GeneralBackendConfig()
		genBackendConfig.loginPresetEnabled = grailsApplication.config.beconf.login.preset.enabled
		genBackendConfig.presetAuthScheme = grailsApplication.config.beconf.login.preset.auth.type
		genBackendConfig.presetHost = grailsApplication.config.beconf.login.preset.host
		genBackendConfig.presetPort = grailsApplication.config.beconf.login.preset.port
		genBackendConfig.presetZone = grailsApplication.config.beconf.login.preset.zone

		render genBackendConfig as JSON
	}
}

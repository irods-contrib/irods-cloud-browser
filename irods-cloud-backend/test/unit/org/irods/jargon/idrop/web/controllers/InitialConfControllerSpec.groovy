package org.irods.jargon.idrop.web.controllers

import grails.test.mixin.TestFor
import spock.lang.Specification

/**
 * See the API for {@link grails.test.mixin.web.ControllerUnitTestMixin} for usage instructions
 */
@TestFor(InitialConfController)
class InitialConfControllerSpec extends Specification {

	def setup() {
	}

	def cleanup() {
	}

	void "get initial config information"() {
		given:


		grailsApplication.config.beconf.login.preset.host='localhost'
		grailsApplication.config.beconf.login.preset.port=1247
		grailsApplication.config.beconf.login.preset.zone='tempZone'
		grailsApplication.config.beconf.login.preset.auth.type='STANDARD'
		grailsApplication.config.beconf.login.preset.enabled=true

		when:
		controller.show()
		then:
		controller.response.status == 200
		log.info("responseText:${response.text}")
		response.text == "{\"loginPresetEnabled\":true,\"presetAuthScheme\":\"STANDARD\",\"presetHost\":\"localhost\",\"presetPort\":1247,\"presetZone\":\"tempZone\"}"
	}
}

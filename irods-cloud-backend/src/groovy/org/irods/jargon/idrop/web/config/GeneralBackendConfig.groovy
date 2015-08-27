/**
 * 
 */
package org.irods.jargon.idrop.web.config

/**
 * @author Mike Conway - DICE
 * 
 * General config as reflected in the config.groovy beconf.* properties
 *
 */
class GeneralBackendConfig {
	boolean loginPresetEnabled = false
	String presetHost = ""
	int presetPort = 1247
	String presetZone = ""
	String presetAuthScheme = "STANDARD"
}

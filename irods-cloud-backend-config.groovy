/*
 *Backend app configuration
 *For app specific configs, prefix with beconf. for consistency 
 */


// use login preset
beconf.login.preset.host='localhost'
beconf.login.preset.port=1247
beconf.login.preset.zone='tempZone'
beconf.login.preset.auth.type='STANDARD'
beconf.login.preset.enabled=true
// SSL negotiation policy for secure iRODS connections
beconf.negotiation.policy='CS_NEG_DONT_CARE' // NO_NEGOTIATION, CS_NEG_REFUSE, CS_NEG_REQUIRE, CS_NEG_DONT_CARE

package org.irods.jargon.idrop.web.utils

import javax.servlet.http.HttpSession

/**
 * General utils for session and state management
 * @author Mike Conway - DICE
 *
 */
class SessionUtils {

	/**
	 * Central place to signal clearing session state when switching grids.  Session invalidate doesn't seem to get
	 * some things when refs are still present in the code.
	 * @param session
	 * @return
	 */
	static clearState(HttpSession session) {
		if (!session) {
			throw new IllegalArgumentException("no session")
		}
		session.virtualCollections = null
		session.authenticationSession = null
		session.userSessionContext = null
	}
}

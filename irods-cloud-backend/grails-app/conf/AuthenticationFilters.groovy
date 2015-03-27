
import javax.servlet.http.Cookie
import javax.servlet.http.HttpServletResponse

import org.irods.jargon.core.connection.*
import org.irods.jargon.idrop.web.services.AuthenticationService
import org.irods.jargon.idrop.web.utils.IdropConstants

class AuthenticationFilters {

	/**
	 * Injected authentication service
	 */
	AuthenticationService authenticationService

	def filters = {
		all(controller:'*', action:'*', controllerExclude:"(login|error)") {
			before = {

				log.info("filter for auth")

				if(!session[IdropConstants.AUTH_SESSION]) {
					log.info("not authorized")
					response.sendError HttpServletResponse.SC_UNAUTHORIZED
					return false
				}

				log.info("request action:${request.action}")

				if (request.action == "POST") {

					def token = session.xsrfToken
					def headerToken =  null


					def cookies = request.cookies

					for (Cookie cookie : cookies) {
						log.info("cookie:${cookie}")
						if (cookie.name == "XSRF-TOKEN") {
							headerToken = cookie.value
							break
						}
					}

					log.info("token in session: ${token}")
					log.info("token in header: ${headerToken}")

					if(!token) {
						log.warn("no xsrf token passed with request")
						response.sendError HttpServletResponse.SC_UNAUTHORIZED
						return false
					} else if (token != headerToken) {
						log.warn("xsrf token passed with request does not match saved session version")
						response.sendError HttpServletResponse.SC_UNAUTHORIZED
						return false
					}
				}

				IRODSAccount irodsAccount = session.authenticationSession.authenticatedIRODSAccount
				request.irodsAccount = irodsAccount
				return true
			}
			after = { Map model ->
			}
			afterView = { Exception e ->
			}
		}
	}
}



import javax.servlet.http.Cookie
import javax.servlet.http.HttpServletResponse

import org.irods.jargon.core.connection.*
import org.irods.jargon.core.pub.IRODSAccessObjectFactory
import org.irods.jargon.idrop.web.services.AuthenticationService
import org.irods.jargon.idrop.web.utils.*

class AuthenticationFilters {

	/**
	 * Injected authentication service
	 */
	AuthenticationService authenticationService
	IRODSAccessObjectFactory irodsAccessObjectFactory

	def filters = {
		auth(controller:'*', action:'*', controllerExclude:"(login|error|index|initialConf)") {
			before = {

				log.info("filter for auth")

				if (request.method == "OPTIONS") {
					log.info("options request methods are not authenticated")
					response.writer.print('OK')
					response.writer.flush()
					return true
				}

				if(!session[IdropConstants.AUTH_SESSION]) {
					log.info("not authorized")
					response.sendError HttpServletResponse.SC_UNAUTHORIZED
					return false
				}

				log.info("request action:${request.action}")

				if (request.action == null) {

					log.info('action is null, treat as get?')
				} else if (request.action == "POST") {

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
				log.info("closing conn in filter!")

				irodsAccessObjectFactory.closeSessionAndEatExceptions()
				return true
			}
			afterView = { Exception e ->
			}
		}

		sessionInval(controller:'*', action:'*', controllerExclude:"(login|error|index|initialConf)") {
			before = {

				log.info("filter for session ivalidation")

				if(session==null || !request.isRequestedSessionIdValid() ) {
					log.info("invalidate session stuff")
					SessionUtils.clearState(session)
				}
			}
			after = { Map model ->
			}
			afterView = { Exception e ->
			}
		}
	}
}


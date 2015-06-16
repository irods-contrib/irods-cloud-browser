package irods.cloud.backend

import org.irods.jargon.core.pub.IRODSAccessObjectFactory
import org.irods.jargon.idrop.web.services.FileService

/**
 * Controller for copy operations
 * <p/>
 * For the backend, we are not striving for purity of REST, sorry...we have a REST API for that.  What we want here are minimal sized controllers with minimal manipulation needed
 * from the javascript side, so small controllers, simple urls, simple parameters are the rule
 * 
 * @author Mike Conway - DICE
 *
 */
class CopyController {

	static responseFormats = ['json']
	FileService fileService
	IRODSAccessObjectFactory irodsAccessObjectFactory

	/**
	 * POST method causes a copy to be made, expects sourcePath and targetPath to be specified
	 * @return
	 */
	def save() {
		log.info("save()")
		log.info("copy action")
		def irodsAccount = request.irodsAccount
		if (!irodsAccount) throw new IllegalStateException("no irodsAccount in request")

		def sourcePath = params.sourcePath
		if (!sourcePath) {
			throw new IllegalArgumentException("null sourcePath")
		}

		log.info("sourcePath:${sourcePath}")

		def targetPath = params.targetPath
		if (!targetPath) {
			throw new IllegalArgumentException("null targetPath")
		}

		log.info("targetPath:${targetPath}")

		return null
	}
}

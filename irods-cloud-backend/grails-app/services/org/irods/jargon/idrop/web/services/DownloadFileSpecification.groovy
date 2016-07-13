/**
 * 
 */
package org.irods.jargon.idrop.web.services

/**
 * Represents and wraps an input stream that is a download file from irods
 * @author Mike Conway - DICE
 *
 */
class DownloadFileSpecification {

	InputStream inputStream
	long length
	String type
	String fileName
}

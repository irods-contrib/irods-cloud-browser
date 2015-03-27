/**
 * 
 */
package org.irods.jargon.idrop.web.controllers.exceptions

/**
 * @author Mike Conway - DICE
 *
 */
class MissingDataException extends Exception {

	/**
	 * 
	 */
	public MissingDataException() {
	}

	/**
	 * @param arg0
	 */
	public MissingDataException(String arg0) {
		super(arg0)
	}

	/**
	 * @param arg0
	 */
	public MissingDataException(Throwable arg0) {
		super(arg0)
	}

	/**
	 * @param arg0
	 * @param arg1
	 */
	public MissingDataException(String arg0, Throwable arg1) {
		super(arg0, arg1)
	}
}

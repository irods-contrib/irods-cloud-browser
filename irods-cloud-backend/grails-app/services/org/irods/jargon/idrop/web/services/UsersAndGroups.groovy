package org.irods.jargon.idrop.web.services

import org.irods.jargon.core.pub.domain.User
import org.irods.jargon.core.pub.domain.UserGroup


/**
 * Represents and wraps an input stream that is a download file from irods
 * @author Mike Conway - DICE
 *
 */
class UsersAndGroups {

	List<User> users
	List<UserGroup> userGroups
}

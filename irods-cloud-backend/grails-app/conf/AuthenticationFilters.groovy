import java.util.List;

import javax.servlet.http.Cookie
import javax.servlet.http.HttpServletResponse

import org.irods.jargon.core.connection.*
import org.irods.jargon.core.connection.auth.AuthResponse
import org.irods.jargon.core.exception.JargonException
import org.irods.jargon.core.protovalues.UserTypeEnum;
import org.irods.jargon.core.pub.IRODSAccessObjectFactory
import org.irods.jargon.core.pub.IRODSGenQueryExecutor;
import org.irods.jargon.core.pub.UserAO;
import org.irods.jargon.core.pub.UserGroupAO;
import org.irods.jargon.core.pub.domain.User;
import org.irods.jargon.core.pub.domain.UserGroup;
import org.irods.jargon.core.query.IRODSGenQueryBuilder;
import org.irods.jargon.core.query.IRODSGenQueryFromBuilder;
import org.irods.jargon.core.query.IRODSQueryResultRow;
import org.irods.jargon.core.query.IRODSQueryResultSetInterface;
import org.irods.jargon.core.query.QueryConditionOperators;
import org.irods.jargon.core.query.RodsGenQueryEnum;
import org.irods.jargon.idrop.web.authsession.UserSessionContext
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
                             
                String authType = grailsApplication.config.beconf.login.preset.auth.type
                if (!session.authenticationSession && "SHIBBOLETH".equalsIgnoreCase(authType)) {
                    
                    log.info("==================")
                    log.info('attr: eppn = ' + request.getAttribute("eppn"));
                    log.info('attr: displayName = ' + request.getAttribute("displayName"));
                    log.info('attr: affiliation = ' + request.getAttribute("affiliation"));
                    log.info('attr: sn = ' + request.getAttribute("sn"));
                    log.info('attr: isMemberOf = ' + request.getAttribute("isMemberOf"));
                    log.info('attr: givenName = ' + request.getAttribute("givenName"));
                    log.info('attr: Shib-Identity-Provider = ' + request.getAttribute("Shib-Identity-Provider"));
                    log.info('attr: UID = ' + request.getAttribute("uid"));
                    log.info("==================")
                    
                    ArrayList<String> expectedIrodsGroups = new ArrayList<String>();
                    
                    // read the presets and other configuration parameters
                    String host = grailsApplication.config.beconf.login.preset.host
                    int port = grailsApplication.config.beconf.login.preset.port
                    String zone = grailsApplication.config.beconf.login.preset.zone
                    String shib_user_attribute = grailsApplication.config.beconf.login.shib.user_attribute
                    String shib_user_re = grailsApplication.config.beconf.login.shib.user_re
                    String admin_user = grailsApplication.config.beconf.login.shib.admin_user
                    String admin_password = grailsApplication.config.beconf.login.shib.admin_password
                    
                    // We need the presets and shibboleth configuration if we're using shibboleth
                    if (host == null || host.equals("") || port == 0 || zone == null || zone.equals("")) {
                        throw new JargonException("Host, port, and zone presets must be set if using Shibboleth")
                    }
                        
                    if (shib_user_attribute == null || shib_user_attribute.equals("") ||
                       admin_user == null || admin_user.equals("") ||
                       admin_password == null || admin_password.equals("")) {
                        throw new JargonException("beconf.login.shib.user_attribute, beconf.login.shib.admin_user, beconf.login.shib.admin_password must be set when using Shibboleth")
                    }
                    
                    log.info("shib_enabled")
                    //log.info("shib_user_attribute = " + shib_user_attribute)
                    //log.info("admin_user = " + admin_user)
                    //log.info("admin_password = " + admin_password)
                    
                    def userName = request.getAttribute(shib_user_attribute)
                    if (userName == null || userName.equalsIgnoreCase("")) {
                        throw new JargonException("Could not read user name from shibboleth attributes")
                    }
                    // If a regular expression exists in grailsApplication.config.beconf.login.shib.user_re
                    // use this to parse the user name from userName
                    if (shib_user_re != null && !shib_user_re.equals("")) {
                        userName = userName.replaceAll(shib_user_re, '$1')
                    } 
                    
                    // See if there is a group attribute and required group for access.
                    def groupAttribute = grailsApplication.config.beconf.login.shib.group_attribute
                    log.info("groupAttribute = " + groupAttribute)
                    if (groupAttribute != null && !groupAttribute.equals("")) {
                        // We have a group attribute.  Get the required group.
                        def requiredGroup = grailsApplication.config.beconf.login.shib.required_group
                        log.info("requiredGroup = " + requiredGroup)
                        if (requiredGroup != null && !requiredGroup.equals("")) {
                            // There is a required group.  Make sure the group in the attribute matches 
                            // the required group.
                            def groupListStr = request.getAttribute(groupAttribute) == null ? "" : request.getAttribute(groupAttribute);
                            log.info("groupListStr = " + groupListStr)
                            
                            String[] groupList;
                            
                            def groupDelimiter = grailsApplication.config.beconf.login.shib.group_delimiter
                            if (groupDelimiter != null && !groupDelimiter.equals("")) {
                                groupList = groupListStr.split(groupDelimiter)
                            } else {
                                groupList = new String[1];
                                groupList[0] = groupListStr;
                            }
                            
                            boolean found = false;
                            for (String group : groupList) {
                                if (requiredGroup.equals(group)) {
                                    found = true;
                                }
                            }
                                
                            if (!found) {
                                throw new JargonException("User does not have permission to access this site.")
                            }

                            // Build a list of iRODS groups that this user should belong to.
                            def groupMapping = grailsApplication.config.beconf.login.shib.group_mapping
                            
                            if (groupMapping != null && !groupMapping.equals("")) {
                                log.info("groupMapping=" + groupMapping)
                                for (String entry : groupMapping.split('\\|')) {
                                    log.info("group entry=" + entry)
                                    def irodsGroup = entry.split("=")[0]
                                    String[] grouperGroups = entry.split("=")[1].split(";")

                                    def foundAll = true
                                    for (String grouperGroup : grouperGroups) {
                                        if (!groupList.contains(grouperGroup)) {
                                            foundAll = false
                                        }
                                    }
                                    if (foundAll) {
                                        expectedIrodsGroups.add(irodsGroup)
                                    }
                                }
                            }
                            
                            
                        }
                    }
                    
                    // Login as admin
                    IRODSAccount irodsAdminAccount = IRODSAccount.instance("localhost", 1247, admin_user, admin_password, "", zone, "");
                    try {
                        AuthResponse authResponse = authenticationService.authenticate(irodsAdminAccount)
                    } catch (Exception e) {
                        throw new JargonException("Authentication error trying to login with admin credentials")
                    }
                    
                    // get user and group info
                    //   select USER_NAME, USER_GROUP_NAME where USER_NAME = '*userName'
                    IRODSGenQueryExecutor irodsGenQueryExecutor = irodsAccessObjectFactory.getIRODSGenQueryExecutor(irodsAdminAccount);
        
                    IRODSGenQueryBuilder builder = new IRODSGenQueryBuilder(true, null);
        
                    builder.addSelectAsGenQueryValue(RodsGenQueryEnum.COL_USER_NAME);
                    builder.addSelectAsGenQueryValue(RodsGenQueryEnum.COL_USER_GROUP_NAME);
                    builder.addConditionAsGenQueryField(RodsGenQueryEnum.COL_USER_NAME,
                            QueryConditionOperators.EQUAL, userName);
        
                    IRODSGenQueryFromBuilder query = builder.exportIRODSQueryFromBuilder(100);
                    IRODSQueryResultSetInterface resultSet = irodsGenQueryExecutor
                                .executeIRODSQueryAndCloseResult(query, 0);
                    
                    if (resultSet.getResults().size() == 0) {
                        
                        // Need to create the user
                        User user = new User()
                        user.setName(userName)
                        user.setUserType(UserTypeEnum.RODS_USER)
                        UserAO userAO = irodsAccessObjectFactory.getUserAO(irodsAdminAccount)
                        userAO.addUser(user)
                    }
                    
                    
                    // If there is a group mapping, adjust the groups.
                    def groupMapping = grailsApplication.config.beconf.login.shib.group_mapping
                    if (groupMapping != null && !groupMapping.equals("")) {
                         
                        
                        ArrayList<String> actualIrodsGroups = new ArrayList<String>()
                        List<IRODSQueryResultRow> rowList = resultSet.getResults()
                        for (IRODSQueryResultRow row : rowList) {
                            actualIrodsGroups.add(row.getColumn("USER_GROUP_NAME"))
                        }
                        
                        // Remove "public" and <user> from actual group list.  We don't care about those.
                        actualIrodsGroups.remove(userName)
                        actualIrodsGroups.remove("public")
                        
                        log.info("-------------------------------------------")
                        log.info("expectedIrodsGroups = " + expectedIrodsGroups)
                        log.info("actualIrodsGroups = " + actualIrodsGroups)
                        
                        // see what is in expectedIrodsGroups but not actualIrodsGroups
                        ArrayList<String> toBeAdded = new ArrayList<String>(expectedIrodsGroups)
                        toBeAdded.removeAll(actualIrodsGroups)
                        
                        // see what is in actualIrodsGroups but not expectedIrodsGroups
                        ArrayList<String> toBeDeleted = new ArrayList<String>(actualIrodsGroups)
                        toBeDeleted.removeAll(expectedIrodsGroups)
                        
                        log.info("Groups toBeAdded = " + toBeAdded)
                        log.info("Groups toBeDeleted = " + toBeDeleted)
                        
                        log.info("-------------------------------------------")
                        
                        
                        UserGroupAO userGroupAO = irodsAccessObjectFactory.getUserGroupAO(irodsAdminAccount)
                        
                        for (String group : toBeAdded) {
                            try {
                                userGroupAO.addUserToGroup(group, userName, null)
                            } catch (JargonException e) {}
                        }
                        
                        for (String group : toBeDeleted) {
                            try {
                                userGroupAO.removeUserFromGroup(group, userName, null)
                            } catch (JargonException e) {}
                        }
           
                    }
            
                    // login with admin account and proxy to new user
                    IRODSAccount irodsAccount = IRODSAccount.instanceWithProxy(host, port.value, userName, admin_password,
                        "", zone, "", admin_user, zone)
                    
                    //IRODSAccount irodsAccount = IRODSAccount.instance(host, port.value, admin_user, admin_password, "", zone, "")
                    AuthResponse authResponse
                    try {
                        authResponse = authenticationService.authenticate(irodsAccount)
                    } catch (Exception e) {
                        throw new JargonException("Authentication error trying to login with admin credentials")
                    }
                    
                    log.info("auth with proxy successful")
                    SessionUtils.clearState(session)
                    session.authenticationSession = authResponse
                    UserSessionContext userSessionContext = new UserSessionContext()
                    userSessionContext.userName = authResponse.authenticatedIRODSAccount.userName
                    userSessionContext.zone = authResponse.authenticatedIRODSAccount.zone
            
                    authenticationService.generateXSRFToken()
                    session.userSessionContext = userSessionContext
            
                    request.irodsAccount = irodsAccount
                    //IRODSServerProperties irodsServerProperties = environmentServicesService.getIrodsServerProperties(irodsAccount)
                    
                    return true
                      
                }

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


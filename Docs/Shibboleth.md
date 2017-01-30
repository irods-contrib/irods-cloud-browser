# Shibboleth instructions

The CloudBrowser now supports single sign-out using Shibboleth authentication.  

## Step 1 - Enable Shibboleth on Apache.

The first step is configuring the system where Apache is running to use Shibboleth and enable mod_shib in Apache.  Much of this is outside the scope of this document.  Refer to the following link for information on enabling Shibboleth and mod_shib. 

[Shibboleth Installation](https://wiki.shibboleth.net/confluence/display/SHIB2/NativeSPLinuxInstall)

[Shibboleth Apache Configuration](https://wiki.shibboleth.net/confluence/display/SHIB2/NativeSPApacheConfig)

Also refer to your IDP documentation on the exact configuration steps.


## Step 2 - Configuring Cloud Browser for Shibboleth

To enable Shibboleth on the CloudBrowser, the **beconf.login.preset.auth.type** (typically set in /etc/irods-ext/irods-cloud-backend-config.groovy) configuration parameter needs to be set to 'SHIBBOLETH' as shown below.

```
beconf.login.preset.auth.type='SHIBBOLETH'
```

There are several additional parameters that may be used when Shibboleth is enabled.

* beconf.login.shib.user_attribute - required - Identifies the header returned from the Shibboleth identity provider (IDP) that contains the iRODS user name for the user.

* beconf.login.shib.user_re - optional - A regular expression used to parse out the iRODS user name from the value returned in **beconf.login.shib.user_attribute**.  The user name will be replaced by the matched string within the parenthesis.  (See example below.)  If no adjustment to the user name is required then this attribute is not required.  

	+ For example, if the header returned from Shibboleth for the user is *eppn: user1@company* and the iRODS user name is "user1" then the following attributes will allow the CloudBrowser to parse out the correct user name:

	+ beconf.login.shib.user_attribute='eppn'

	+ beconf.login.shib.user_re='([^@]*)@.*'

	+ The regular expression tells the code to extract the part before the '@' sign and replace the user name with this. 

* beconf.login.shib.admin_user - required - Identifies the rodsadmin user that the CloudBrowser uses to access the system.  The CloudBrowser initially logs in as the administrative user and then proxies to the user identified by user_attribute.

* beconf.login.shib.admin_password - required - Identifies the password for the rodsadmin user.

* beconf.login.shib.logout_url - This is the URL that is called when the logout button is pressed.  Refer to your IDP documentation for the proper logout URL.  The following is an example:

```
beconf.login.shib.logout_url='https://server.example.org/Shibboleth.sso/Logout?return=https://idp.example.org/cgi-bin/logout.pl?logoutWithoutPrompt=1'
```

	+ In the above case, the logout button triggers the Shibboleth.sso logout to be executed in Apache and then the application returns to the IDP login screen.


When Shibboleth is enabled, the CloudBrowser also supports Grouper.  This allows the IDP to control the iRODS groups that a user belongs.  The following attributes enable Grouper functionality.

* beconf.login.shib.group_attribute - Identifies the header returned that contains the group information for the user. 
* beconf.login.shib.group_delimiter - Identifies the delimiter used to parse out a list of groups from **group_attribute**. 
* beconf.login.shib.required_group - Identifies the group that is required to gain access to iRODS.  If the group is not in the list, an access denies message is returned when the user attempts to access the system. 
* beconf.login.shib.group_mapping - This is parameter that maps the Grouper groups to iRODS groups.  This can be either a one-to-one mapping or a many-to-one mapping.  A vertical bar (pipe) is used to separate group mappings and a semicolon is used between Grouper groups when multiple grops are required to map to one iRODS group.  The following is an example:

``` 
beconf.login.shib.group_mapping='Group1Group2=urn:mace:example.org:project1:Group1;urn:mace.example.org:project1:Group2|Group3=urn:mace:example:org:project1:Group3'
```

In the case above, for a user to belong to Group1Group2 iRODS group, the user must be in both the *urn:mace:example.org:project1:Group1* and *urn:mace.example.org:project1:Group2* Grouper groups.  For the user to be in Group3 iRODS group, the user only needs to be in *urn:mace:example:org:project1:Group3* Grouper group.

If **group_mapping** is used, the CloudBrowser will automatically adjust the iRODS group membership for the user on login.  This includes both additions and deletions of group membership in iRODS.  If **group_mapping** is not used, the CloudBrowser will not adjust group membership in iRODS.


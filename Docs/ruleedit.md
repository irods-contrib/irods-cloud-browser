### Using the rule editor

The Cloud Browser provides a 'Fiddle' like interface for running and editing iRODS rules in the iRODS rule language.  This is focused on rules that are themselves stored in iRODS.  This allows users to add their own functions and execute them on the iRODS server.

For information on the iRODS Rule Language, a tutorial is available [here](https://docs.irods.org/4.1.5/manual/rule_language/)

In order to edit a rule, one may browse to an existing rule file, having a .r extension.  In this case the browser is positioned to a set of rules on the lifetime library


browse to rules

If one of the rule files is selected (you can double click), it takes you to the home page for the data object.  As shown below, the actions button for the rule should reveal the edit option, select this option to bring up the rule editor.

add ruleedit.phg

Alternatively, a new iRODS rule can be created by browsing to a directory, then selecting new file from the button on the top breadcrumbs

add newfile.png

In our example, we are editing a rule, copied below,that will check access levels to a given collection and file.

```

myTestRule {
#Input parameters are:
#  Name of object
#  Access permission that will be checked
#Output parameter is:
#  Result, 0 for failure and 1 for success
  *Path = "/$rodsZoneClient/home/$userNameClient/" ++ "*Coll" ++ "/" ++ "*File";
  msiCheckAccess(*Path,*Acl,*Result);
  if(*Result == 1) {
    writeLine("stdout","Access is allowed");
  }
  else {
    writeLine("stdout","Access is not allowed");
  }
}
INPUT *Coll =$"Rules", *File =$"ruleintegrityACL.r", *Acl =$"own"
OUTPUT ruleExecOut


```

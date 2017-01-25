### Using the rule editor

The Cloud Browser provides a 'Fiddle' like interface for running and editing iRODS rules in the iRODS rule language.  This is focused on rules that are themselves stored in iRODS.  This allows users to add their own functions and execute them on the iRODS server.

For information on the iRODS Rule Language, a tutorial is available [here](https://docs.irods.org/4.1.5/manual/rule_language/)

In order to edit a rule, one may browse to an existing rule file, having a .r extension.  In this case the browser is positioned to a set of rules on the lifetime library


![browse to a rule](https://github.com/DICE-UNC/irods-cloud-browser/blob/master/Docs/Images/browsetorules?raw=true)

If one of the rule files is selected (you can double click), it takes you to the home page for the data object.  As shown below, the actions button for the rule should reveal the edit option, select this option to bring up the rule editor.

![edit a rule](https://github.com/DICE-UNC/irods-cloud-browser/blob/master/Docs/Images/ruleedit.png?raw=true)

Alternatively, a new iRODS rule can be created by browsing to a directory, then selecting new file from the button on the top breadcrumbs

![add new rule file](https://github.com/DICE-UNC/irods-cloud-browser/blob/master/Docs/Images/newfile.png?raw=true)

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

In the editor, you see the rule file on the left hand side, with syntax highlighting and the ability to edit.  On the right hand side, you see an output window and buttons to cancel, and to save changes.  Note that save changes is currently disabled.  

At the bottom of the rule, you see input and output parameters.  In this case, we want to edit the INPUT line to point to a Coll and File.  in our case, we'll just check access permissions on the rule we are editing.  So let's go ahead and edit the COLL and FILES on the input line.

![edit input](https://github.com/DICE-UNC/irods-cloud-browser/blob/master/Docs/Images/editinput.png?raw=true)

Notice that the 'Save Changes' button is now highlighted.  You can edit rules using this editor, and then have those changes save back into iRODS.  You also can hit cancel and return the rule editor to the state of the rule as it was originally stored.  In our case, we don't want to save the rule, rather we want to just run the rule as it is in the editor window, so we can select Run >> on the bottom right.  

![result](https://github.com/DICE-UNC/irods-cloud-browser/blob/master/Docs/Images/result.png?raw=true)

You can see that the rule was submitted and run inside iRODS, and the results are placed in the right hand side pane.  

It's that simple!

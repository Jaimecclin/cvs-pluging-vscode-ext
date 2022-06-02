# cvs-plugin

CVS is an old but powerful version control software. Honestly, it's a bit out-of-date and young people are not quite familiar with it. If you're such an unfortunate guy and you have to use it in your working environment, this extension will have your back. You can easily acquire `Visual Studio Code` style `diff` instead of incomprehensible `CVS diff`. Hope you like it!

**Important**

This extension supports **multi-root** workspaces. Please open each CVS repository at the top of the workspace, like this

![file-hierachy](/resources/readme/file-hierachy.png "Folder structure")

### Tested environment

  1. Ubuntu 20.04
   * Concurrent Versions System (CVS) 1.12.13-MirDebian-27 (client/server)

# Functions

### Activate this extension

1. Click the button to activate this extension

    ![welcome](/resources/readme/welcome.png "Welcome page")

2. Active! Show all folders in the workspace.
   
   ![actived](/resources/readme/actived.png "Active page")

    #### Note

    If you add a new repository into the workspace, please click this button to fetch all folders again.

    ![refetch](/resources/readme/refetch.png "Refetch button")

### cvs status

Get all file status from the selected folder.

1. Select the folder you want to check and click the status button.

    ![refresh-1](/resources/readme/refresh-1.png "Refresh 1")

2. Wait

    ***Please do NOT click the status button repeatedly. If you have a large repository, you might need to wait for a while. CVS is not a fast tool but it gives your the correct result finally.***
    
    ![refreshing-demo](/resources/readme/refreshing-demo.png "Refreshing Demo")

3. See the file status

    There are four status types provided. The modified and conflict files are enabled by default.
    * M : Modified file
    * C : Conflict file
    * ? : Questionable file
    * U : Updated file (in server)

    ![refreshed-2](/resources/readme/refresh-2.png "Refresh 2")

    You can select the types you're interested in. The items will be updated then.

    ![refresh-filter-1](/resources/readme/refresh-filter-1.png "Filter 1")

    ![refresh-filter-2](/resources/readme/refresh-filter-2.png "Filter 2")


### cvs diff file

1. Select the file you want to compare and click the diff button.

    ![diff](/resources/readme/diff.png "Diff")

    *** Note ***
    
    This function is a bit different than the standard `cvs diff`. The diff content is from comparing the current code to the latest revision code instead of the previous one. Therefore, it's highly recommended that you always perform `cvs update`.

2. (Not essential) You can click this button to open the file.

    ![openfile](/resources/readme/open-file.png "OpenFile")


### cvs update

    *Under construction*

### cvs commit

    *Under construction*



**Any bugs, please report it to this repository. Enjoy!**

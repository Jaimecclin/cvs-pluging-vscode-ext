# cvs-plugin

<p align="center">
<img src="/resources/cvs_logo_color.jpg" alt="logo" width="200" height="200"/>
</p>

CVS is an old but powerful version control software. Honestly, it's a bit out-of-date and young people are not quite familiar with it. :frowning_face: If you're such an unfortunate guy :pleading_face: and you have to use it in your working environment, this extension will have your back.:call_me_hand: You can easily acquire `Visual Studio Code` style `diff` instead of incomprehensible `CVS diff`. Hope you like it!:v:

**Important**

This extension supports **multi-root** workspaces. Please open each CVS repository at the top of the workspace, like this

![file-hierachy](/resources/readme/file-hierachy.png "Folder structure")

### Tested environment

  1. Ubuntu 20.04
   * Concurrent Versions System (CVS) 1.12.13-MirDebian-27 (client/server)

## Table of Contents
  - [Activate this extension](#activate-this-extension)
  - [cvs status](#cvs-status)
  - [cvs diff file](#cvs-diff-file)
  - [cvs annotate](#cvs-annotate)
  - [cvs update](#cvs-update)
  - [cvs commit](#cvs-commit)
  - [Misc.](#misc)
  - [Release note](#release-note)

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

    __Please do NOT click the status button repeatedly. If you have a large repository, you might need to wait for a while. CVS is not a fast tool but it gives your the correct result finally.__
    
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

### cvs annotate

1. Open the file you want to annotate on the editor. This file should be in your repository. Right-click on the file tab title and find `cvs annotate` in the list. For sure, this extension __MUST__ be active to get this button.

    ![anno-1](/resources/readme/annotate-1.png "Annotate file 1")

2. Wait a second then the annotate text will appear like this.

    ![anno-2](/resources/readme/annotate-2.png "Annotate file 2")

### cvs update

1. Select the repository you want to __update__ and click the update button.

    ![update-1](/resources/readme/update-1.png "Update repo 1")

2. Because this action will change your repository, you need to be certain of it. Please fill in __yes__ in the dialog.

    ![update-2](/resources/readme/update-2.png "Update repo 2")

3. Wait a minute. You will see the success message like __The repository is updated successfully__.

4. If the update action fails, there might be some conflict. Please check the file status with [cvs status](#cvs-status) button. Then open the file and resolve it.

    ![update-conflict](/resources/readme/update-conflict.png "Update repo conflict")

    *** Note ***
    This functionality is only tested in my personal env. If you have any problem with it. Please report the log to me. It would be extremely helpful. Thanks a lot. :wink:

### cvs commit

    *Under construction*


### Misc.

You can check the extension log __cvs-plugin-log__ from VSCode OUTPUT Panel. It shows every cvs command you've used and the return code. If you find out some bugs, this log information would be very helpful to me.

![log-1](/resources/readme/log-1.png "log-1")



:vulcan_salute: :vulcan_salute: :vulcan_salute:Any bugs, please report it to this repository. Enjoy! :vulcan_salute: :vulcan_salute: :vulcan_salute: 

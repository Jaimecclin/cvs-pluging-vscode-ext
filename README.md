# cvs-plugin

This extension is to help people stuck with poor and out-of-date version control software `cvs`. You can easily use it like a current version control system.

**Important**

This extension supports **multi-root** workspaces. Please open your each CVS repository at the top of workspace, like this

```
Workspace
   |
   |----- CVS repo 1
   |           |
   |           |----- file1
   |           |
   |           |----- file2
   |----- CVS repo 2
               |
               |----- file1
               |
               |----- file2
```


### Tested environment

  1. Ubuntu 20.04
   * Concurrent Versions System (CVS) 1.12.13-MirDebian-27 (client/server)

# Functions

### Activate this extension

1. Click the button to activate this extension

    ![welcome](/resources/readme/welcome.png "Welcome page")

2. Active! Show all folders in the workspace.
   
   ![actived](/resources/readme/actived.png "Active page")

### cvs status

Get all file status from the selected folder.

1. Select the folder you want to check and click the status button.

    ![refresh-1](/resources/readme/refresh-1.png "Refresh 1")

2. Wait

    ![refreshing-demo](/resources/readme/refreshing-demo.png "Refreshing Demo")

3. See the file status

    There are four status types provided. The modified and conflict files are enabled by default.
    * M : Modified file
    * C : Conflict file
    * ? : Questionable file
    * U : Updated file (in server)

    ![refreshed-2](/resources/readme/refresh-2.png "Refresh 2")

    You can select the types you'r interested in. The items will be updated then.

    ![refresh-filter-1](/resources/readme/refresh-filter-1.png "Filter 1")

    ![refresh-filter-2](/resources/readme/refresh-filter-2.png "Filter 2")


### cvs diff file

1. Select the file you want to compare and click the diff button.

    ![diff](/resources/readme/diff.png "Diff")

    *** Note ***
    This function is a bit different than standard `cvs diff`. The diff content is from comparing the current code to the latest revision code instead of the previous one. Therefore, it's highly recommended that you always perform `cvs update`.

### cvs update

    *Under construction*

### cvs commit

    *Under construction*



**Any bugs, please report it to this repository. Enjoy!**

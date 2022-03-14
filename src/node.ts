import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class NodeProvider implements vscode.TreeDataProvider<ChangedItem> {

    private _onDidChangeTreeData: vscode.EventEmitter<ChangedItem | undefined | void> = new vscode.EventEmitter<ChangedItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<ChangedItem | undefined | void> = this._onDidChangeTreeData.event;
    private data: string[] = [];
    constructor(private workspaceRoot: string | undefined) {
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: ChangedItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: ChangedItem): Thenable<ChangedItem[]> {
        // Only present the root level
        if(element) {
            return Promise.resolve([]);
        }
        if (!this.workspaceRoot) {
            vscode.window.showInformationMessage('No dependency in empty workspace');
            return Promise.resolve([]);
        }
        let shownItems: ChangedItem[] = [];
        for(let i=0; i<this.data.length; i++) {
            shownItems.push(new ChangedItem(this.data[i], vscode.TreeItemCollapsibleState.Collapsed));
        }
        return Promise.resolve(shownItems);
    }

    getData(files: string[]) {
        this.data = files;
    }

    private pathExists(p: string): boolean {
        try {
            fs.accessSync(p);
        } catch (err) {
            return false;
        }

        return true;
    }
}

export class Dependency extends vscode.TreeItem {

    constructor(
        public readonly label: string,
        private readonly version: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command
    ) {
        super(label, collapsibleState);

        this.tooltip = `${this.label}-${this.version}`;
        this.description = this.version;
    }

    iconPath = {
        light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
        dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg')
    };

    contextValue = 'dependency';
}

export class ChangedItem extends vscode.TreeItem {

    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command
    ) {
        super(label, collapsibleState);

        // this.tooltip = `${this.label}-${this.version}`;
        // this.description = this.version;
    }

    iconPath = {
        light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
        dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg')
    };

    contextValue = 'dependency';
}
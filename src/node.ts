import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { logger } from './log'

export class File {

    constructor(
        public readonly name: string,
        public readonly uri: vscode.Uri,
        public type: number // 1-1: folder, 0: modified, 1: updated
    ) {}

}

export class FolderProvider implements vscode.TreeDataProvider<FolderItem> {

    private _onDidChangeTreeData: vscode.EventEmitter<FolderItem | undefined | void> = new vscode.EventEmitter<FolderItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<FolderItem | undefined | void> = this._onDidChangeTreeData.event;
    private data: File[] = [];
    constructor(private workspaceRoot: string | undefined) {
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: FolderItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: FolderItem): Thenable<FolderItem[]> {
        // Only present the root level
        if(element) {
            return Promise.resolve([]);
        }
        // if (!this.workspaceRoot) {
        //     vscode.window.showInformationMessage('empty workspace');
        //     return Promise.resolve([]);
        // }
        let shownItems: FolderItem[] = [];
        for(let i=0; i<this.data.length; i++) {
            shownItems.push(new FolderItem(this.data[i].name, this.data[i].uri, vscode.TreeItemCollapsibleState.Collapsed));
        }
        return Promise.resolve(shownItems);
    }

    setData(files: File[]) {
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

export class NodeProvider implements vscode.TreeDataProvider<ChangedItem> {

    private _onDidChangeTreeData: vscode.EventEmitter<ChangedItem | undefined | void> = new vscode.EventEmitter<ChangedItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<ChangedItem | undefined | void> = this._onDidChangeTreeData.event;
    private data: File[] = [];
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
        // if (!this.workspaceRoot) {
        //     vscode.window.showInformationMessage('No dependency in empty workspace');
        //     return Promise.resolve([]);
        // }
        let shownItems: ChangedItem[] = [];
        for(let i=0; i<this.data.length; i++) {
            if(this.data[i].type === 0)
                shownItems.push(new ChangedItem(this.data[i].name, vscode.TreeItemCollapsibleState.Collapsed));
            else if(this.data[i].type === 1)
                shownItems.push(new QuestionableItem(this.data[i].name, vscode.TreeItemCollapsibleState.Collapsed));
            else if(this.data[i].type === 2)
                shownItems.push(new UpdatedItem(this.data[i].name, vscode.TreeItemCollapsibleState.Collapsed));
            else if(this.data[i].type === 3)
                shownItems.push(new ConflictItem(this.data[i].name, vscode.TreeItemCollapsibleState.Collapsed));
        }
        return Promise.resolve(shownItems);
    }

    setData(files: File[]) {
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

export class FolderItem extends vscode.TreeItem {

    constructor(
        public readonly label: string,
        public readonly uri: vscode.Uri,
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

    contextValue = 'folder_item';
    cvsRepo = path.join(this.uri.fsPath, 'CVS', 'Repository');
    // try {
    //     repoName = fs.readFileSync(cvsRepo, 'utf8');
    // } catch (err) {
    //     vscode.window.showErrorMessage('CVS-plugin cannot find CVS/Repository in the workspace.');
    // }
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
        light: path.join(__filename, '..', '..', 'resources', 'letter-m.svg'),
        dark: path.join(__filename, '..', '..', 'resources', 'letter-m.svg')
    };

    contextValue = 'changed';
}

export class UpdatedItem extends vscode.TreeItem {

    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command
    ) {
        super(label, collapsibleState);
    }

    iconPath = {
        light: path.join(__filename, '..', '..', 'resources', 'letter-u.svg'),
        dark: path.join(__filename, '..', '..', 'resources', 'letter-u.svg')
    };

    contextValue = 'updated';
}


export class QuestionableItem extends vscode.TreeItem {

    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command
    ) {
        super(label, collapsibleState);
    }

    iconPath = {
        light: path.join(__filename, '..', '..', 'resources', 'questionable.svg'),
        dark: path.join(__filename, '..', '..', 'resources', 'questionable.svg')
    };

    contextValue = 'questionable';
}

export class ConflictItem extends vscode.TreeItem {

    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command
    ) {
        super(label, collapsibleState);
    }

    iconPath = {
        light: path.join(__filename, '..', '..', 'resources', 'letter-c.svg'),
        dark: path.join(__filename, '..', '..', 'resources', 'letter-c.svg')
    };

    contextValue = 'conflict';
}
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { logger } from './log'

export class File {
    children: File[] = [];

    constructor(
        public readonly name: string,
        public readonly uri: vscode.Uri,
        public type: number // 1-1: folder, 0: modified, 1: updated
    ) {}

    born(f: File) {
        this.children.push(f);
    }
    
}

export class FolderProvider implements vscode.TreeDataProvider<FileItem> {

    private _onDidChangeTreeData: vscode.EventEmitter<FileItem | undefined | void> = new vscode.EventEmitter<FileItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<FileItem | undefined | void> = this._onDidChangeTreeData.event;
    private data: FileItem[] = [];
        constructor(private workspaceRoot: string | undefined) {
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: FileItem): FileItem {
        return element;
    }

    getChildren(element?: FileItem): Thenable<FileItem[]> {
        // Only present the root level
        // if(element) {
        //     return Promise.resolve([]);
        // }
        // if (!this.workspaceRoot) {
        //     vscode.window.showInformationMessage('empty workspace');
        //     return Promise.resolve([]);
        // }
        if(!element){
            return Promise.resolve(this.data);
        }
        else {
            logger.appendLine('321');
            return Promise.resolve(element.children);
        }
    }

    setData(folders: FileItem[]) {
        this.data = folders;
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


export class FileItem extends vscode.TreeItem {

    children: FileItem[] = [];
    constructor(
        public readonly label: string,
        public readonly uri: vscode.Uri,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly parent?: FileItem,
        public readonly command?: vscode.Command
    ) {
        super(label, collapsibleState);
        this.uri = uri;
        this.parent = parent;
        // this.tooltip = `${this.label}-${this.version}`;
        // this.description = this.version;
    }

    iconPath = {
        light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
        dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg')
    };

    contextValue = 'folder_item';
    cvsRepo = path.join(this.uri.fsPath, 'CVS', 'Repository');

    born(item: FileItem) {
        this.children.push(item);
    }

    clear() {
        this.children = [];
    }

    getChildren(): FileItem[] {
        return this.children;
    }
}

export class FolderItem extends FileItem {
    constructor(
        public readonly label: string,
        public readonly uri: vscode.Uri,
        public readonly parent?: FileItem
    ){
        super(label, uri, vscode.TreeItemCollapsibleState.Collapsed, parent);
    }
}

export class ChangedItem extends FileItem {

    constructor(
        public readonly label: string,
        public readonly uri: vscode.Uri,
        public readonly parent: FileItem
    ) {
        super(label, uri, vscode.TreeItemCollapsibleState.None, parent);
        // this.tooltip = `${this.label}-${this.version}`;
        // this.description = this.version;
    }

    iconPath = {
        light: path.join(__filename, '..', '..', 'resources', 'letter-m.svg'),
        dark: path.join(__filename, '..', '..', 'resources', 'letter-m.svg')
    };

    contextValue = 'changed';
}

export class UpdatedItem extends FileItem {

    constructor(
        public readonly label: string,
        public readonly uri: vscode.Uri,
        public readonly parent: FileItem
    ) {
        super(label, uri, vscode.TreeItemCollapsibleState.None, parent);
    }

    iconPath = {
        light: path.join(__filename, '..', '..', 'resources', 'letter-u.svg'),
        dark: path.join(__filename, '..', '..', 'resources', 'letter-u.svg')
    };

    contextValue = 'updated';
}


export class QuestionableItem extends FileItem {

    constructor(
        public readonly label: string,
        public readonly uri: vscode.Uri,
        public readonly parent: FileItem
    ) {
        super(label, uri, vscode.TreeItemCollapsibleState.None, parent);
    }

    iconPath = {
        light: path.join(__filename, '..', '..', 'resources', 'questionable.svg'),
        dark: path.join(__filename, '..', '..', 'resources', 'questionable.svg')
    };

    contextValue = 'questionable';
}

export class ConflictItem extends FileItem {

    constructor(
        public readonly label: string,
        public readonly uri: vscode.Uri,
        public readonly parent: FileItem
    ) {
        super(label, uri, vscode.TreeItemCollapsibleState.None, parent);
    }

    iconPath = {
        light: path.join(__filename, '..', '..', 'resources', 'letter-c.svg'),
        dark: path.join(__filename, '..', '..', 'resources', 'letter-c.svg')
    };

    contextValue = 'conflict';
}
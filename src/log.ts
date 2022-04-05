import * as vscode from 'vscode';

class WhiteBoard {
    private wb;
    private debug: boolean = false;
    constructor() {
        this.wb = vscode.window.createOutputChannel("WhiteBoard");
        this.wb.show();
        this.appendLine('Logger is initialized');
    }

    appendLine(data: string): void {
        if(this.debug)
            this.wb.appendLine(data);
    }
}

export const logger = new WhiteBoard();

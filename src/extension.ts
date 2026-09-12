import * as vscode from 'vscode';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import {
    LanguageClient,
    LanguageClientOptions,
    ServerOptions,
    RevealOutputChannelOn,
    Trace
} from 'vscode-languageclient/node';

let client: LanguageClient | undefined;

// Quote a shell argument only when it contains whitespace or characters a shell
// would otherwise interpret. Leaving a plain path such as ~/.kyte/bin/kyte
// unquoted keeps the command runnable across bash, zsh and PowerShell alike.
function quoteArg(arg: string): string {
    if (/^[A-Za-z0-9_./:\\-]+$/.test(arg)) {
        return arg;
    }
    return '"' + arg.replace(/"/g, '\\"') + '"';
}

// The default install location the Kyte toolchain writes the server to.
function defaultServerPath(): string {
    const exe = process.platform === 'win32' ? 'kynalyzer.exe' : 'kynalyzer';
    return path.join(os.homedir(), '.kyte', 'bin', exe);
}

// Find `kynalyzer` on PATH (used only when no explicit path is set). Returns the
// resolved absolute path, or undefined if not found on any PATH entry.
function findOnPath(): string | undefined {
    const exe = process.platform === 'win32' ? 'kynalyzer.exe' : 'kynalyzer';
    const dirs = (process.env.PATH ?? '').split(path.delimiter).filter(d => d.length > 0);
    for (const d of dirs) {
        const p = path.join(d, exe);
        try {
            if (fs.statSync(p).isFile()) {
                return p;
            }
        } catch {
            // not here; keep looking
        }
    }
    return undefined;
}

// Resolve the language-server binary, in documented order:
//   1. the `kyte.server.path` setting, if non-empty (tilde-expanded);
//   2. `kynalyzer` found on PATH;
//   3. the default install path (~/.kyte/bin/kynalyzer).
// Returns the resolved path and whether that path actually exists on disk, so the
// caller can start the client only when the server is really present.
function resolveServer(): { serverPath: string; exists: boolean; source: string } {
    const cfg = vscode.workspace.getConfiguration('kyte');
    let configured = (cfg.get<string>('server.path') ?? '').trim();
    if (configured.length > 0) {
        if (configured.startsWith('~')) {
            configured = path.join(os.homedir(), configured.slice(1));
        }
        return { serverPath: configured, exists: fs.existsSync(configured), source: 'kyte.server.path' };
    }
    const onPath = findOnPath();
    if (onPath) {
        return { serverPath: onPath, exists: true, source: 'PATH' };
    }
    const def = defaultServerPath();
    return { serverPath: def, exists: fs.existsSync(def), source: 'default (~/.kyte/bin)' };
}

function traceSetting(): 'off' | 'messages' | 'verbose' {
    const t = vscode.workspace.getConfiguration('kyte').get<string>('trace.server') ?? 'off';
    return (t === 'messages' || t === 'verbose') ? t : 'off';
}

// Start (or restart) the language client. Safe to call when the server is missing:
// it reports a clear, actionable message and leaves highlighting/icons/run working.
async function startClient(): Promise<void> {
    await stopClient();

    const cfg = vscode.workspace.getConfiguration('kyte');
    if (cfg.get<boolean>('server.enabled') === false) {
        console.log('Kyte: language server disabled via kyte.server.enabled');
        return;
    }

    const { serverPath, exists, source } = resolveServer();
    if (!exists) {
        // No server binary -> do NOT throw; the grammar, icons, snippets and the run
        // command all keep working. Tell the user how to get diagnostics/completion.
        void vscode.window.showWarningMessage(
            `Kyte language server not found (looked via ${source} at ${serverPath}). ` +
            'Syntax highlighting still works; install the Kyte toolchain, or set "kyte.server.path", ' +
            'for diagnostics and completion.'
        );
        return;
    }

    const serverOptions: ServerOptions = { command: serverPath, args: [] };
    const clientOptions: LanguageClientOptions = {
        documentSelector: [{ scheme: 'file', language: 'kyte' }],
        synchronize: {
            fileEvents: vscode.workspace.createFileSystemWatcher('**/*.{ky,kyx}')
        },
        revealOutputChannelOn: RevealOutputChannelOn.Never
    };

    client = new LanguageClient('kyteLanguageServer', 'Kyte Language Server', serverOptions, clientOptions);
    try {
        await client.start();
        await client.setTrace(Trace.fromString(traceSetting()));
    } catch (err) {
        client = undefined;
        void vscode.window.showErrorMessage(`Kyte language server failed to start: ${String(err)}`);
    }
}

async function stopClient(): Promise<void> {
    if (client) {
        const c = client;
        client = undefined;
        try {
            await c.stop();
        } catch {
            // already down
        }
    }
}

export async function activate(context: vscode.ExtensionContext) {
    console.log('Kyte extension is now active');

    await startClient();

    // Restart the language server (recover from a crash, or pick up a new build /
    // a changed kyte.server.path without reloading the window).
    context.subscriptions.push(
        vscode.commands.registerCommand('kyte.restartServer', async () => {
            await startClient();
            void vscode.window.showInformationMessage('Kyte language server restarted.');
        })
    );

    // Re-resolve the server when the relevant settings change.
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(async e => {
            if (e.affectsConfiguration('kyte.server') || e.affectsConfiguration('kyte.trace.server')) {
                await startClient();
            }
        })
    );

    // Run the current Kyte file via the installed `kyte` compiler in a terminal.
    context.subscriptions.push(
        vscode.commands.registerCommand('kyte.runFile', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showErrorMessage('No active editor');
                return;
            }
            const doc = editor.document;
            if (doc.languageId !== 'kyte') {
                vscode.window.showErrorMessage('Not a Kyte file');
                return;
            }
            if (doc.isDirty) {
                await doc.save();
            }
            const kyteBin = path.join(os.homedir(), '.kyte', 'bin', 'kyte');
            const name = 'Kyte Run';
            let terminal = vscode.window.terminals.find(t => t.name === name);
            if (!terminal) {
                terminal = vscode.window.createTerminal(name);
            }
            terminal.show(true);
            terminal.sendText(`${quoteArg(kyteBin)} ${quoteArg(doc.fileName)}`);
        })
    );

    // Status bar item
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = '$(book) Kyte';
    statusBarItem.tooltip = 'Kyte Language';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);
}

export function deactivate(): Thenable<void> | undefined {
    if (!client) {
        return undefined;
    }
    return client.stop();
}

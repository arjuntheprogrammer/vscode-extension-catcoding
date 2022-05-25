import * as vscode from "vscode";
import * as path from "path";

// const cats = {
//   "Coding Cat": "https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif",
//   "Compiling Cat": "https://media.giphy.com/media/mlvseq9yvZhba/giphy.gif",
//   "Testing Cat": "https://media.giphy.com/media/3oriO0OEd9QIDdllqo/giphy.gif",
// };

export function activate(context: vscode.ExtensionContext) {
  // Only allow a single Cat Coder
  let currentPanel: vscode.WebviewPanel | undefined = undefined;

  context.subscriptions.push(
    vscode.commands.registerCommand("catCoding.start", () => {
      if (currentPanel) {
        currentPanel.reveal(vscode.ViewColumn.One);
      } else {
        currentPanel = vscode.window.createWebviewPanel(
          "catCoding",
          "Cat Coding",
          vscode.ViewColumn.One,
          {
            enableScripts: true,
          }
        );
        currentPanel.webview.html = getWebviewContent();

        currentPanel.onDidDispose(
          () => {
            currentPanel = undefined;
          },
          undefined,
          context.subscriptions
        );

        // Handle messages from the webview
        currentPanel.webview.onDidReceiveMessage(
          (message) => {
            switch (message.command) {
              case "alert":
                vscode.window.showErrorMessage(message.text);
                return;
            }
          },
          undefined,
          context.subscriptions
        );
      }
    })
  );

  // Our new command
  context.subscriptions.push(
    vscode.commands.registerCommand("catCoding.doRefactor", () => {
      if (!currentPanel) {
        return;
      }

      // Send a message to our webview.
      // You can send any JSON serializable data.
      currentPanel.webview.postMessage({ command: "refactor" });
    })
  );

  // And make sure we register a serializer for our webview type
  vscode.window.registerWebviewPanelSerializer(
    "catCoding",
    new CatCodingSerializer()
  );
}

export function deactivate() {}

class CatCodingSerializer implements vscode.WebviewPanelSerializer {
  async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
    // `state` is the state persisted using `setState` inside the webview
    console.log(`Got state: ${state}`);

    // Restore the content of our webview.
    //
    // Make sure we hold on to the `webviewPanel` passed in here and
    // also restore any event listeners we need on it.
    webviewPanel.webview.html = getWebviewContent();
  }
}

// function updateWebviewForCat(
//   panel: vscode.WebviewPanel,
//   catName: keyof typeof cats
// ) {
//   panel.title = catName;
//   panel.webview.html = getWebviewContent(catName);
// }

// function getWebviewContent(cat: keyof typeof cats) {
//   return `<!DOCTYPE html>
//   <html lang="en">
//   <head>
// 	  <meta charset="UTF-8">
// 	  <meta name="viewport" content="width=device-width, initial-scale=1.0">
// 	  <title>Cat Coding</title>
//   </head>
//   <body>
// 	  <img src="${cats[cat]}" width="300" />
//   </body>
//   </html>`;
// }
// function getWebviewContent(cat: any) {
//   return `<!DOCTYPE html>
//   <html lang="en">
//   <head>
// 	  <meta charset="UTF-8">
// 	  <meta name="viewport" content="width=device-width, initial-scale=1.0">
// 	  <title>Cat Coding</title>
//   </head>
//   <body>
// 	  <img src="${cat}" width="300" />
//   </body>
//   </html>`;
// }

function getWebviewContent() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cat Coding</title>
</head>
<body>
    <img src="https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif" width="300" />
    <h1 id="lines-of-code-counter">0</h1>

    <script>
        (function() {
            const vscode = acquireVsCodeApi();
            const counter = document.getElementById('lines-of-code-counter');

            // Check if we have an old state to restore from
            const previousState = vscode.getState();
            let count = previousState ? previousState.count : 0;
            counter.textContent = count;

            setInterval(() => {
              counter.textContent = count++;
              // Update the saved state
              vscode.setState({ count });
            }, 100);

            // setInterval(() => {
            //     counter.textContent = count++;
            //     // Alert the extension when our cat introduces a bug
            //     if (Math.random() < 0.001 * count) {
            //         vscode.postMessage({
            //             command: 'alert',
            //             text: '🐛  on line ' + count
            //         })
            //     }
            // }, 100);
        }())
    </script>
</body>
</html>`;
}



Home
Docs
Chrome Extensions
AI
Was this helpful ?

    Inject scripts into the active tab

bookmark_border
⏱️ 6 min read

Simplify the styling of the current page by clicking the extension toolbar icon.

    Overview
This tutorial builds an extension that simplifies the styling of the Chrome extension and Chrome Web Store documentation pages so that they are easier to read.

In this guide, we're going to explain how to do the following:

Use the extension service worker as the event coordinator.
Preserve user privacy through the "activeTab" permission.
Run code when the user clicks the extension toolbar icon.
Insert and remove a style sheet using the Scripting API.
    Use a keyboard shortcut to execute code.
    Before you start
This guide assumes that you have basic web development experience.We recommend checking out Hello World for an introduction to the extension development workflow.

Build the extension
To start, create a new directory called focus - mode that will hold the extension's files. If you prefer, you can download the complete source code from GitHub.

Step 1: Add the extension data and icons
Create a file called manifest.json and include the following code.


{
    "manifest_version": 3,
        "name": "Focus Mode",
            "description": "Enable focus mode on Chrome's official Extensions and Chrome Web Store documentation.",
                "version": "1.0",
                    "icons": {
        "16": "images/icon-16.png",
            "32": "images/icon-32.png",
                "48": "images/icon-48.png",
                    "128": "images/icon-128.png"
    }
}
To learn more about these manifest keys, check out the "Run scripts on every tab" tutorial that explains the extension's metadata and icons in more detail.

Create an images folder then download the icons into it.

    Step 2: Initialize the extension
Extensions can monitor browser events in the background using the extension's service worker. Service workers are special JavaScript environments that handle events and terminate when they're not needed.

Start by registering the service worker in the manifest.json file:


{
  ...
    "background": {
        "service_worker": "background.js"
    },
  ...
}
Create a file called background.js and add the following code:


chrome.runtime.onInstalled.addListener(() => {
    chrome.action.setBadgeText({
        text: "OFF",
    });
});
The first event our service worker will listen for is runtime.onInstalled().This method allows the extension to set an initial state or complete some tasks on installation.Extensions can use the Storage API and IndexedDB to store the application state.In this case, though, since we're only handling two states, we will use the action's badge text itself to track whether the extension is 'ON' or 'OFF'.

Key term: The action's badge is a colored banner on top of the extension action (toolbar icon).
Step 3: Enable the extension action
The extension action controls the extension's toolbar icon. So whenever the user clicks the extension icon, it will either run some code (like in this example) or display a popup. Add the following code to declare the extension action in the manifest.json file:


{
  ...
    "action": {
        "default_icon": {
            "16": "images/icon-16.png",
                "32": "images/icon-32.png",
                    "48": "images/icon-48.png",
                        "128": "images/icon-128.png"
        }
    },
  ...
}
Use the activeTab permission to protect user privacy
The activeTab permission grants the extension temporary ability to execute code on the active tab.It also allows access to sensitive properties of the current tab.

This permission is enabled when the user invokes the extension.In this case, the user invokes the extension by clicking on the extension action.

💡 What other user interactions enable the activeTab permission in my own extension ?

    Pressing a keyboard shortcut combination.
Selecting a context menu item.
Accepting a suggestion from the omnibox.
Opening an extension popup.
    The "activeTab" permission allows users to purposefully choose to run the extension on the focused tab; this way, it protects the user's privacy. Another benefit is that it does not trigger a permission warning.

To use the "activeTab" permission, add it to the manifest's permission array:


{
  ...
    "permissions": ["activeTab"],
  ...
}
Step 4: Track the state of the current tab
After the user clicks the extension action, the extension will check if the URL matches a documentation page.Next, it will check the state of the current tab and set the next state.Add the following code to background.js:


const extensions = 'https://developer.chrome.com/docs/extensions';
const webstore = 'https://developer.chrome.com/docs/webstore';

chrome.action.onClicked.addListener(async (tab) => {
    if (tab.url.startsWith(extensions) || tab.url.startsWith(webstore)) {
        // Retrieve the action badge to check if the extension is 'ON' or 'OFF'
        const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
        // Next state will always be the opposite
        const nextState = prevState === 'ON' ? 'OFF' : 'ON';

        // Set the action badge to the next state
        await chrome.action.setBadgeText({
            tabId: tab.id,
            text: nextState,
        });
    }
});
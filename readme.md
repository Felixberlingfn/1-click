# Project Title: 1 Click Text Marker Chrome Extension

#### Video Demo:  [Link to Video](https://vimeo.com/user205247072/cs50)

#### Description:
"1 Click Text Marker" is a Google Chrome extension that offers simple text marking with a single click (ctrl + click on Windows and Cmd + Click on Mac). It offers two modes: word mode and paragraph mode, allowing users to choose between highlighting individual words or whole paragraphs. Furthermore, users can personalize their experience by choosing any color for their text markers, background color and text color.

The project consists of multiple JavaScript and HTML files and one JSON file. Below is a brief explanation of each file and its respective functionality:
1. **"manifest.json":** This file provides essential metadata about the extension to the Chrome browser. It lists permissions required (such as storage), specifies the background service worker script ("background.js"), defines the popup ("popup.html"), registers the content script ("content.js"), and declares the extension's icons.

2. **"background.js":** This is the service worker script that runs in the background, serving as the backbone of the extension. It manages the core functionalities and coordinates between different components of the extension. Upon installation, this script sets default values for various parameters like the active state, color, text color, highlight mode, and modifier key requirement, and opens the onboarding page.

3. **"popup.html" and "popup.js":** These files define the extension's user interface, shown when the user clicks on the extension's icon. They provide options to switch between 'word' and 'paragraph' modes, choose the desired color for marking, and toggle the activation of the extension. "popup.js" includes event listeners for button clicks and functions for updating button states and selected colors.

4. **"content.js":** This is the main script that interacts with the web content. It is responsible for highlighting words or paragraphs based on user clicks and the chosen mode. It listens for click events and, in word mode,  uses a regular expression to find the word to highlight. In the 'word' mode, it highlights the specific word where the user clicked, whereas, in the 'paragraph' mode, it highlights the entire paragraph. The word mode turned out to be much more difficult than anticipated and a lot of debugging was necessary. Content.js also listens to keyboard events to change the cursor style when modifier keys are pressed and released. That way it is easier for the user to see that clicking will now have a highlighting effect.

5. **"onboarding.html":** This file serves as an onboarding page for first-time users and is desplayed upon installation. It briefly instructs users on how to use the extension, emphasizing the "Ctrl+Click" action for highlighting, and guides them through the process of pinning the extension to the Chrome toolbar for easier access. Upon installation of the extension, "background.js" automatically opens this onboarding page.

During the development of the extension, I realized that highlighting individual words is much more complicated and potentially buggy than whole paragraphs. I initually even thought I could highlight selected text but I removed this feature to avoid the bugs this currently causes. To implement this feature I would need to be spending significantly more time on it. I also learned al lot about chrome api, browser compatibility of non standard functions and regex which was all new to me. I additionally learned how to use an asynchronous function to access the chrome api storage without errors (mostly). And I learned how to use a background script to maintain the state of the extension and handle installation events. The toggling logic was quite fun to implement.

# Important Functions
The following functions have been particularly challenging and I would like to document them for future reference. In particular the getWordRangeFromPoint was quite a revealing challenge and this function could possibly be reused in other contexts or developed further to make it more flexible for different use cases.

## `getWordRangeFromPoint` Function Documentation

### **Overview:**
The `getWordRangeFromPoint` function determines the range of a word located beneath a mouse click on a webpage. Given a mouse event, the function looks up the precise location of the click, then looks for a word that lines up with this location and, if found, returns the range that encapsulates this word.

### **Parameters:**
- `event`: The mouse event object, typically passed from an event listener.

### **Returns:**
- A range object corresponding to the word beneath the mouse click. If no word is found, the function returns `undefined`.

### **Behavior:**
1. **Browser Compatibility**: The function first checks browser capabilities to pinpoint the text beneath the mouse click. It uses `document.caretPositionFromPoint` where available, and as a fallback, uses the WebKit-specific `document.caretRangeFromPoint`.
2. **Text Verification**: Once a range is detected, the function confirms if the content within this range is actually text and possesses any content.
3. **Word Detection**: A regular expression is used to traverse the detected text content and determine the start and end of each word. If the mouse click's position falls within a word, the function updates the range to encapsulate just this word.

### **Additional Notes:**
- While the function was primarily designed with Chrome in mind, it has been structured to be flexible and can potentially support other browsers, given they support either `caretPositionFromPoint` or `caretRangeFromPoint`.

### **Links and related ressources:**
- https://developer.mozilla.org/en-US/docs/Web/API/Document/caretPositionFromPoint
- https://www.w3schools.com/jsref/prop_node_nodetype.asp
- https://www.w3schools.com/jsref/jsref_regexp_exec.asp
- https://regex101.com/r/S6fu4D/1

### **Recommendations for Future Development:**
- Keep an eye out for changes and make necessary updates if browser specifications evolve.
- Observe the behavior of the word detection and if necessary make changes.

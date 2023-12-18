# Content.js

Content.js provides functionality for highlighting words and paragraphs within a web page. Users can highlight text based on specific conditions, such as pressing a modifier key or having a specific mode active.

## Overview

1. **Asynchronous Storage Retrieval**:
   - `getFromStorage(keys)`: An asynchronous utility function to retrieve values from `chrome.storage.local`.

2. **Paragraph Highlighting**:
   - `handleParagraphHighlight(event, highlightColor, textColor)`: Handles the highlighting of paragraphs or block-level elements that contain text.

3. **Word Highlighting**:
   - Main function `handleWordHighlight(event, highlightColor, textColor)`: The primary function to handle word-level highlighting, which depends on various helper functions.
   - `newWordHighlight(range, highlightColor, textColor)`: Creates a new highlighted span around a specific word range.
   - `toggleWordHighlight(element, newbg, newtxt)`: Toggles the highlighting color for a word that's already been highlighted.
   - `getWordRangeFromPoint(event)`: Determines the word range based on the current mouse point.

4. **Event Listeners**:
   - Sets up event listeners for the document body. These listeners determine when and how to highlight text based on user interactions and stored settings.

---

## Functions

### getFromStorage(keys)

An asynchronous function that wraps the Chrome Storage API to provide a promise-based interface for retrieving data.

- **Parameters**:
  - `keys`: An array or string representing the keys to be retrieved from the storage.
- **Returns**: A promise that resolves with the retrieved data.

### handleParagraphHighlight(event, highlightColor, textColor)

Function to handle the highlighting of paragraphs when the user interacts with them.

- **Parameters**:
  - `event`: The triggering event.
  - `highlightColor`: The desired background color for the highlight.
  - `textColor`: The desired text color when highlighted.

### handleWordHighlight(event, highlightColor, textColor)

Function to handle word-level highlighting based on the user's interaction.

- **Parameters**:
  - `event`: The triggering event.
  - `highlightColor`: The desired background color for the highlight.
  - `textColor`: The desired text color when highlighted.

### newWordHighlight(range, highlightColor, textColor)

Creates a new highlighted span around a specified word range.

- **Parameters**:
  - `range`: The range of the word to be highlighted.
  - `highlightColor`: The desired background color for the highlight.
  - `textColor`: The desired text color when highlighted.

### toggleWordHighlight(element, newbg, newtxt)

Toggles the highlighting for a word that's already been highlighted.

- **Parameters**:
  - `element`: The HTML element containing the word.
  - `newbg`: The desired background color.
  - `newtxt`: The desired text color.

### getWordRangeFromPoint(event)

Determines the word range based on the current mouse point.

- **Parameters**: `event`: The triggering event.
- **Returns**: The range of the word or `undefined` if no word is found.

---

## Event Listeners

Upon loading, the module sets up event listeners to respond to user interactions and apply the appropriate highlighting based on stored settings and mode (word or paragraph). Additional listeners change the cursor icon based on keypress events to indicate potential text highlighting.

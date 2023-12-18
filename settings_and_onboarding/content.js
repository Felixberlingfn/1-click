//helper function to retrieve settings from storage
async function getFromStorage(keys) {
    return new Promise((resolve) => {
        chrome.storage.local.get(keys, resolve);
    });
}

// Whitelist of elements that can be safely encompassed (inline or not typically nested)
const safeElements = [
  "A", "B", "I", "U", "S", "STRONG", "EM", "SPAN", "MARK", "SMALL", "BIG", 
  "DEL", "INS", "SUB", "SUP", "P", "H1", "H2", "H3", "H4", "H5", "H6",
  "ABBR", "CITE", "CODE", "DFN", "KBD", "Q", "TIME", "VAR", "WBR", "RUBY", 
  "RT", "RP", "BDI", "BDO"
];


// original method for paragraphs
function handleParagraphHighlight(event, highlightColor, textColor) {
    // check if there is any text in the clicked element first
    if (event.target.textContent.trim() === '') {
        return;
    }
    if (event.target.style.color == textColor || textColor == 'transparent') {
        event.target.style.color = '';
    } else if (event.target.style.backgroundColor != highlightColor || highlightColor == 'transparent') {
        event.target.style.color = textColor;
    }
    if (event.target.style.backgroundColor == highlightColor || highlightColor == 'transparent') {
        event.target.style.backgroundColor = '';
    } else {
        event.target.style.backgroundColor = highlightColor;
    }
}


// word and phrase mode main function
function handleWordHighlight(event, highlightColor, textColor, phrasemode) {
    const mouse_x = event.clientX;
    const mouse_y = event.clientY;
    let currentElement = event.target;
	let levelsChecked = 0;

	while (currentElement && levelsChecked < 5) {
		if (currentElement.className === 'marker_29041998') {
			toggleWordHighlight(currentElement, highlightColor, textColor);
			return;
		}
		
		currentElement = currentElement.parentElement;
		levelsChecked++;
	}

    let range = getWordRangeFromPoint(mouse_x, mouse_y, phrasemode);
    if (!range) {
        return;
    }
	// Check if the click is within the bounding client rectangle of the text node's parent element.
    const rect = range.commonAncestorContainer.parentElement.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) {
        return;
    }
	const parentElement = range.commonAncestorContainer.parentElement;
    if (parentElement && parentElement.className === 'marker_29041998'){
		toggleWordHighlight(parentElement, highlightColor, textColor);
		return;
	}
    newWordHighlight(range, highlightColor, textColor, parentElement);
}


// selection handler function triggered when selecting text
function selectionHandler(mdown_x, mdown_y, mup_x, mup_y, highlightColor, textColor) {
    // Handle the selected text here
    let rangestart = getWordRangeFromPoint(mdown_x, mdown_y);
    let rangeend = getWordRangeFromPoint(mup_x, mup_y);
    if ((!rangestart) || (!rangeend)) {
        return;
    }
    // Combine rangestart and rangeend to one range called selectionRange
	const selectionRange = document.createRange();
	if (rangestart.compareBoundaryPoints(Range.START_TO_START, rangeend) <= 0) {
		// rangestart is before rangeend (selected from left to righ)
		selectionRange.setStart(rangestart.startContainer, rangestart.startOffset);
		selectionRange.setEnd(rangeend.endContainer, rangeend.endOffset);
	} else {// rangeend is before rangestart, so swap them
		selectionRange.setStart(rangeend.startContainer, rangeend.startOffset);
		selectionRange.setEnd(rangestart.endContainer, rangestart.endOffset);
	}
	
    // check possible className marker_29041998 of parentElement
    const parentElement = selectionRange.commonAncestorContainer.parentElement;

	let currentElement = parentElement;
	let levelsChecked = 0;
	// 5 levels tested and works for <b><i><u><s>This text is bold, italic, underlined, and struck through.</s></u></i></b>
	while (currentElement && levelsChecked < 5) {
		if (currentElement.className === 'marker_29041998') {
			console.log(levelsChecked === 0 ? "Parent Element Highlight Toggling" : "Grandparent Element Highlight Toggling");
			toggleWordHighlight(currentElement, highlightColor, textColor);
			return;
		}

		currentElement = currentElement.parentElement;
		levelsChecked++;
	}

    newWordHighlight(selectionRange, highlightColor, textColor, parentElement);
	// remove selection
	window.getSelection().removeAllRanges();
}

// surround links so the hover effect works
function surroundRangeWithElement(range, wrapper) {
    if (!range) return false;

    let target = range.startContainer;
    // If the target is a text node or another type of non-element node, switch to its parent element
    if (target.nodeType !== Node.ELEMENT_NODE) {
        target = target.parentElement;
    }

    if (target && target.tagName === "A") {
        target.parentNode.insertBefore(wrapper, target);
        wrapper.appendChild(target);
        return true;
    }
    return false;
}

// Create a new span with highlighting applied
function newWordHighlight(range, highlightColor, textColor, element) {
	unwrapNestedHighlightsInRange(element, range)
	
    function createHighlightSpan(isLink) {
        const span = document.createElement('span');
        span.className = "marker_29041998";
        if (highlightColor !== 'transparent') {
            span.style.backgroundColor = highlightColor; // span.style.backgroundColor = isLink ? "" : highlightColor;
        }
        if (textColor !== 'transparent') {
            span.style.color = textColor; // span.style.color = isLink ? "" : textColor;
        }
        return span;
    }
    function handleSurroundContents(rangeToUse, isLink) {
        const span = createHighlightSpan(isLink);
		if (isLink) {
			let success = surroundRangeWithElement(rangeToUse, span);
			if (!success) rangeToUse.surroundContents(span);
			return;
		}
        rangeToUse.surroundContents(span);
    }
	
	// for range arrays that require a for loop (pure individual text nodes)
    function processRanges(rangesArray, comparisonRange) {
        for (let r of rangesArray) {
			const isLink = (r.startContainer.tagName === "A") || (r.startContainer.parentElement?.tagName === "A") || (r.commonAncestorContainer?.parentElement?.tagName === "A");

			// check boundaries and adjust if needed
			let start_to_start = r.compareBoundaryPoints(r.START_TO_START, comparisonRange);
			let end_to_end = r.compareBoundaryPoints(r.END_TO_END, comparisonRange);
			// inside boundary
            if (start_to_start >= 0 && end_to_end <= 0) {
                handleSurroundContents(r, isLink);
				continue;
            }
			let end_to_start = r.compareBoundaryPoints(r.END_TO_START, comparisonRange);
			let start_to_end = r.compareBoundaryPoints(r.START_TO_END, comparisonRange);
			// intersection at end
			if (start_to_start === 1 && end_to_end === 1 && end_to_start === -1 && start_to_end === 1){
				r.setEnd(comparisonRange.endContainer, comparisonRange.endOffset);
				handleSurroundContents(r, isLink);
				continue;
			}
			// intersection at start and end
			if (start_to_start === -1 && end_to_end === 1 && end_to_start === -1 && start_to_end === 1){
				r.setStart(comparisonRange.startContainer, comparisonRange.startOffset);
				r.setEnd(comparisonRange.endContainer, comparisonRange.endOffset);
				handleSurroundContents(r, isLink);
				continue;
			}
			// intersection at start
			if (start_to_start === -1 && end_to_end === -1 && end_to_start === -1 && start_to_end === 1){
				r.setStart(comparisonRange.startContainer, comparisonRange.startOffset);
				handleSurroundContents(r, isLink);
			}
        }
    }
	const adjustedRange = adjustRangeA(range); // encompassed range
	if (!adjustedRange/* || hasNestedPTags(range) || hasNestedDivs(range)*/) {
		console.log("adjustedRange doesn't exist");
		processRanges(old_pure_splitRangeToTextRanges(range), range);
		return;
	}
    try {// more suitable for short highlights like normal words or phrases
		if (adjustedRange.toString().length < 100){ //100 might have to adjust this depending on word or phrase mode
			console.log("1st try block...");
			console.log("trying with simple encompassed range");
			const thisisLink = (adjustedRange.startContainer.tagName === "A") || (adjustedRange.startContainer.parentElement?.tagName === "A") || (adjustedRange.commonAncestorContainer?.parentElement?.tagName === "A");
			if (thisisLink) {
				handleSurroundContents(adjustedRange, thisisLink);
			} else {
				adjustedRange.surroundContents(createHighlightSpan());
			}
		} else { //skip this block
			throw new Error("skip to 2nd try block");
		}	
    } catch (error) {
		console.log("2nd try block"); // more suitable for longer highlights over multiple paragraphs
		try {
			console.log("trying with encompassed range split into highlightable ranges");
			processRanges(splitRangeToHighlightableRanges(adjustedRange), adjustedRange);
		} catch (error) {
			processRanges(old_pure_splitRangeToTextRanges(range), range);
			console.log("revert back to highlighting individual text nodes");
		}
   }
}

// toggle highlighting color for existing highlight
function toggleWordHighlight(element, newbg, newtxt) {
    const bgColor = element.style.backgroundColor;
    const txtColor = element.style.color;
    let newbg_active = (newbg !== 'transparent');
    let newtxt_active = (newtxt !== 'transparent');
    if (newbg_active && newtxt_active) {
        if (bgColor !== newbg || txtColor !== newtxt) {
            element.style.color = newtxt;
            element.style.backgroundColor = newbg;
            return;
        }
		unwrapNestedHighlights(element);
        let parent = element.parentNode;
        while (element.firstChild) {
            parent.insertBefore(element.firstChild, element);
        }
        parent.removeChild(element);
		console.log("toggleWordHighlight: highlight element removed");
        return;
    }
    if ((!newbg_active || bgColor === newbg) && (!newtxt_active || txtColor === newtxt)) {
		unwrapNestedHighlights(element);
        let parent = element.parentNode;
        while (element.firstChild) {
            parent.insertBefore(element.firstChild, element);
        }
        parent.removeChild(element);
		console.log("toggleWordHighlight:  2) highlight element removed");
        return;
    }
    let set_bg = (newbg_active && bgColor !== newbg) ? newbg : '';
    let set_txt = (newtxt_active && txtColor !== newtxt) ? newtxt : '';
    element.style.backgroundColor = set_bg;
    element.style.color = set_txt;
}

function unwrapNestedHighlights(element) {
    // Get all nested spans with the class "marker_29041998"
    const nestedSpans = Array.from(element.querySelectorAll('.marker_29041998'));
    for (const nestedSpan of nestedSpans) {
        let parentOfNested = nestedSpan.parentNode;
        while (nestedSpan.firstChild) {
            parentOfNested.insertBefore(nestedSpan.firstChild, nestedSpan);
        }
        parentOfNested.removeChild(nestedSpan);
    }
}

function unwrapNestedHighlightsInRange(element, range) {
    // Get nested spans with the class "marker_29041998" in range
    const nestedSpans = Array.from(element.querySelectorAll('.marker_29041998'));

    for (const nestedSpan of nestedSpans) {
        if (range.intersectsNode(nestedSpan)) {
            let parentOfNested = nestedSpan.parentNode;
            while (nestedSpan.firstChild) {
                parentOfNested.insertBefore(nestedSpan.firstChild, nestedSpan);
            }
            parentOfNested.removeChild(nestedSpan);
        }
    }
}


function getWordRangeFromPoint(mouse_x, mouse_y, phrasemode) {
	// shortens area to search for long texts
    function adjustRegexLastIndex(regex, length) {
        if (textContent.length > length) {
            regex.lastIndex = Math.max(0, relative_position - 100);
        }
    }
	// main function - returns a range for a clicked word
    function findWord(regex) {
        let match;
        while ((match = regex.exec(textContent)) !== null) {
            let startCursor = match.index;
            let endCursor = startCursor + match[0].length;
            if (startCursor <= relative_position && relative_position < endCursor) {
                if (startCursor > 0 && textContent[startCursor - 1] === " ") startCursor--;
                if (endCursor < textContent.length && " ,.:)(".includes(textContent[endCursor])) endCursor++;
                if ((startCursor + 1) === endCursor) return;
                
                range.setStart(textContainer, startCursor);
                range.setEnd(textContainer, endCursor);
                return range;
            }
        }
    }
    let range;
	// create a range from a click position
    if (document.caretPositionFromPoint) { // Firefox
        let position = document.caretPositionFromPoint(mouse_x, mouse_y);
        range = document.createRange();
        range.setStart(position.offsetNode, position.offset);
    } else if (document.caretRangeFromPoint) { // Chrome
        range = document.caretRangeFromPoint(mouse_x, mouse_y);
    } else {
        return;
    }
	
    if (!range) return;
	
    const textContainer = range.startContainer || range.offsetNode; // Chrome || Firefox
    const relative_position = range.startOffset || range.offset;  // Chrome || Firefox

    if (textContainer?.nodeType !== 3) return range;  // not text

    const textContent = textContainer?.textContent;
    if (!textContent) return range;
	// this is the regex to find the word or phrase
    let regex;
    if (phrasemode) {
        regex = /(?<=^|[^p{L}\d\r\n])[\s\p{L}\d]+(?=$|[^p{L}\d\r\n])/gum;
        adjustRegexLastIndex(regex, 300);
    } else {
        regex = /[\p{L}\d\-'‘’‛′"“”)(]+/gu;
        adjustRegexLastIndex(regex, 200);
    }
	// return the word range or if not there the whole range
    return findWord(regex) || range;
}

// encompasses small elements if necessary, returns false if no safe elements found (like a nested div)
function adjustRangeA(range) {
	let rangeClone = range.cloneRange();

    const getClosestSafeNode = (node) => {
        while (node && !safeElements.includes(node.nodeName.toUpperCase())) {
            node = node.parentNode;
			if (safeElements.includes(node?.nodeName?.toUpperCase())){
				console.log("---safe element found:");
				console.log(node?.nodeName?.toUpperCase());
				return node;
			}
        }
		return false;
    };

    const startSafeNode = getClosestSafeNode(rangeClone.startContainer);
    const endSafeNode = getClosestSafeNode(rangeClone.endContainer);

    // Log the start and end containers and their respective safe nodes
	if (!startSafeNode || !endSafeNode) {
        console.log("some nested structure or non standard html - use pure text nodes to highlight so it works");
        return false;
    }
	
    if ((startSafeNode || endSafeNode) && startSafeNode === endSafeNode) {
        console.log("no encompassing required");
        return rangeClone;
    }

    // For the start of the range
    if (safeElements.includes(startSafeNode?.nodeName.toUpperCase()) && startSafeNode?.textContent.length < 40) {
        console.log("at start: encompass the whole element:", startSafeNode);
        rangeClone.setStartBefore(startSafeNode);
    } else {
		console.log("Element too big to encapsulate");
    }

    // For the end of the range
    if (safeElements.includes(endSafeNode?.nodeName.toUpperCase()) && endSafeNode?.textContent.length < 40) {
        console.log("at end: encompass the whole element:", endSafeNode);
        rangeClone.setEndAfter(endSafeNode);
    } else {
		console.log("Element too big to encapsulate");
    }

    return rangeClone;
}


function isRangeInSameParentElement(range) {
    const startParent = range.startContainer.nodeType === Node.TEXT_NODE ? 
        range.startContainer.parentNode : range.startContainer;

    const endParent = range.endContainer.nodeType === Node.TEXT_NODE ? 
        range.endContainer.parentNode : range.endContainer;

    return startParent === endParent;
}

function areEndsOfRangesInSameSafeElement(range1, range2) {

    const getClosestSafeNode = (node) => {
        while (node && !safeElements.includes(node.nodeName.toUpperCase())) {
            node = node.parentNode;
        }
        return node;
    };

    const endSafeNodeRange1 = getClosestSafeNode(range1.endContainer);
    const endSafeNodeRange2 = getClosestSafeNode(range2.endContainer);

    if (endSafeNodeRange1 === endSafeNodeRange2) {
        return true;
    } else {
        return false;
    }
}

function areStartsOfRangesInSameSafeElement(range1, range2) {

    const getClosestSafeNode = (node) => {
        while (node && !safeElements.includes(node.nodeName.toUpperCase())) {
            node = node.parentNode;
        }
        return node;
    };

    const startSafeNodeRange1 = getClosestSafeNode(range1.startContainer);
    const startSafeNodeRange2 = getClosestSafeNode(range2.startContainer);

    if (startSafeNodeRange1 === startSafeNodeRange2) {
        return true;
    } else {
        return false;
    }
}


function splitRangeToHighlightableRanges(range) {
    let ranges = [];

    // Helper function to create a range
    function createRange(node) {
        let r = document.createRange();
        r.selectNodeContents(node);
        return r;
    }

    // Recursive function to traverse the DOM tree within the range
    function traverse(node) {
        if (!node) return;

        // Check if the node intersects with the given range
        if (range.intersectsNode(node)) {
			let nodeRange = createRange(node);
			let isSafeElement = node.nodeType === Node.ELEMENT_NODE && safeElements.includes(node.nodeName.toUpperCase());
			let EndisSameSafeElement = areEndsOfRangesInSameSafeElement(nodeRange, range);
			let StartisSameSafeElement = areStartsOfRangesInSameSafeElement(nodeRange, range);
			if (isSafeElement && (EndisSameSafeElement || StartisSameSafeElement) ) {
				// add to array
				console.log("adding: ");
				console.log(node);
				ranges.push(nodeRange);
				return;
			}
			
			// check if completely inside range		
			let starts_before_range = range.compareBoundaryPoints(range.START_TO_START, nodeRange) > 0;
			let ends_after_range = range.compareBoundaryPoints(Range.END_TO_END, nodeRange) < 0;		
			if (!starts_before_range && !ends_after_range && isSafeElement){
				ranges.push(nodeRange);
				return;
			}
			
            // otherwise check if text node
            if (node.nodeType === Node.TEXT_NODE && 
                node.nodeValue.trim().length > 2 && 
                node.parentNode.tagName !== 'PATH' && 
                node.parentNode.tagName !== 'SVG') {  				
                ranges.push(nodeRange);
				return;
            }
			
			// if no criteria met continue recursively
			if (node.nodeType === Node.ELEMENT_NODE) {
                for (let child of node.childNodes) {
                    traverse(child);
                }
            }
        }
    }

    // Begin the traversal from the range's commonAncestorContainer
    traverse(range.commonAncestorContainer);

    return ranges;
}

function old_pure_splitRangeToTextRanges(range) {
    let ranges = [];

    // Helper function to create a range
    function createRange(node) {
        let r = document.createRange();
        r.selectNodeContents(node);
        return r;
    }

    // Recursive function to traverse the DOM tree within the range
    function traverse(node) {
        if (!node) return;

        // Check if the node intersects with the given range
        if (range.intersectsNode(node)) {
			
            // otherwise check if text node
            if (node.nodeType === Node.TEXT_NODE && 
                node.nodeValue.trim().length > 2 && 
                node.parentNode.tagName !== 'PATH' && 
                node.parentNode.tagName !== 'SVG') {
					
				let nodeRange = createRange(node); 				
                ranges.push(nodeRange);
				return;
            }
			
			// if no criteria met continue recursively
			if (node.nodeType === Node.ELEMENT_NODE) {
                for (let child of node.childNodes) {
                    traverse(child);
                }
            }
        }
    }

    // Begin the traversal from the range's commonAncestorContainer
    traverse(range.commonAncestorContainer);

    return ranges;
}


//main event listener
window.onload = async function() {
	// to do: only apply the styles if the extension is active
	// to do: make it so they can be updated when the color is changed in the settings
	// Define your styles using template literals
	async function setStyles() {	
		//link color helper
		function colorsFromId(id) {
			const parts = id.split('_');
			return {
				LinkbgColor: `#${parts[0]}`,
				LinktxtColor: `#${parts[1]}`
			};
		}
		
		const { color: firstColor, colortxt: firstColortxt , link_colors: LinkColors, active} = await getFromStorage(['color', 'colortxt', 'link_colors', 'active']);
		
		if(!active) return;
		
		const { LinkbgColor, LinktxtColor } = LinkColors ? colorsFromId(LinkColors) : {};
		
		// Check if the style element already exists
		let styleElement = document.getElementById("Marker_customStyle");

		if (!styleElement) {
			// If not, create it
			styleElement = document.createElement("style");
			styleElement.id = "Marker_customStyle";
			document.head.appendChild(styleElement);
		}

		// Set styles using the provided colors IF TRANSPARENT TXT TXT HAS TO BE BLACK
		const styles =  `
		.marker_29041998 a {
			color: ${LinktxtColor || ''};
			background-color: ${LinkbgColor || ''};
		}
		.marker_29041998 a:hover {
			color: white;
			background-color: midnightblue;
		}
		::selection {
			background: ${firstColor || 'gold'};
			color: ${firstColortxt || 'black'};
		}
		::-moz-selection {
			background: ${firstColor || 'gold'};
			color: ${firstColortxt || 'black'};
		}`;

		styleElement.innerHTML = styles;
		setTimeout(setStyles, 120000); // check for changes every 2 minutes
	}
	setStyles();
	
	//event listeners
    document.body.addEventListener('click', async function(event) {
		if (modifier_key_currently_pressed) event.preventDefault();
		let selectedText = window.getSelection().toString().trim();
		if (selectedText.length > 0) return;
        const {
            active,
            color,
            colortxt,
            highlightmode,
            modifier_key_required,
        } = await getFromStorage(['active', 'color', 'colortxt', 'highlightmode', 'modifier_key_required']);

        if (!active) {
            return;
        }
		
		// modifier_key_required !== modifier_key_currently_pressed doesn't work for alt key
        if (modifier_key_required) {
			if (!modifier_key_currently_pressed || (modifier_key_required !== "any" & modifier_key_required !== modifier_key_currently_pressed))
				return;
        }
        if (highlightmode === 'word') {
            handleWordHighlight(event, color, colortxt);
        } else if (highlightmode === 'paragraph') {
            let phrasemode = true;
            handleWordHighlight(event, color, colortxt, phrasemode);
        }
		
    });

	document.body.addEventListener('keydown', function changeCursorToHand(event) {
		if (event.altKey) event.preventDefault();
		if (event.altKey || event.key === "h" || event.key === "m" || event.key === "1" || event.key === "c" || event.key === "t") {
			// to do: store which key was pressed
			modifier_key_currently_pressed = event.key;
			// image used from canva.com licensed for free use no watermark or attribution needed https://www.canva.com/licensing-explained/
			document.body.style.cursor = 'url(https://one-click-marker-chrome.w3spaces.com/mouse_highlighter.png) , pointer'; // Change cursor to highlighter icon or hand if not available
			setTimeout(setStyles, 1000);
		}
	});

	document.body.addEventListener('keyup', function(event) {
		modifier_key_currently_pressed = false;
		document.body.style.cursor = 'auto'; // Change cursor back to default
	});

	let mousedown_x, mousedown_y, mouseup_x, mouseup_y, color, colortxt;
	let modifierHandlerAttached = false;
	let modifier_key_already_pressed = false;
	let modifier_key_currently_pressed = false;

	function modifierHandler(event) {
		let selectedText = window.getSelection().toString().trim();
		if (selectedText === "") return;
		// just to be save though I don't know why modifierHandler was called even though it is not required
		if (!modifier_key_required) {
			selectionHandler(mousedown_x, mousedown_y, mouseup_x, mouseup_y, color, colortxt);
			removeModifierHandler();
			return;
		}
		if (modifier_key_required === event.key) {
			selectionHandler(mousedown_x, mousedown_y, mouseup_x, mouseup_y, color, colortxt);
		}
		if (modifier_key_required === "any" && (event.key === "Alt" || event.key === "1" || event.key === "c" || event.key === "t" || event.key === "m")) {
			selectionHandler(mousedown_x, mousedown_y, mouseup_x, mouseup_y, color, colortxt);
		}
		removeModifierHandler();
	}

	function removeModifierHandler() {
		if (modifierHandlerAttached) {
			document.body.removeEventListener("keydown", modifierHandler);
			modifierHandlerAttached = false;
		}
	}

	document.addEventListener("mousedown", async function(e) {
		removeModifierHandler();

		document.body.removeEventListener("mouseup", mouseUpHandler);

		mousedown_x = e.clientX;
		mousedown_y = e.clientY;
		
		if (event.altKey || modifier_key_currently_pressed){
			modifier_key_already_pressed = modifier_key_currently_pressed;
		}

		document.body.addEventListener("mouseup", mouseUpHandler);
	});

	async function mouseUpHandler(e) {
		removeModifierHandler();

		const {
			active,
			color: colorFromStorage,
			colortxt: colortxtFromStorage,
			highlightmode,
			modifier_key_required
		} = await getFromStorage(['active', 'color', 'colortxt', 'highlightmode', 'modifier_key_required']);
		
		color = colorFromStorage;
		colortxt = colortxtFromStorage;

		if (!active) return;

		mouseup_x = e.clientX;
		mouseup_y = e.clientY;
		let selectedText = window.getSelection().toString().trim();

		if ((mousedown_x !== mouseup_x || mousedown_y !== mouseup_y) && selectedText !== "") {
			if (!modifier_key_required) {
				modifier_key_already_pressed = false;
				selectionHandler(mousedown_x, mousedown_y, mouseup_x, mouseup_y, color, colortxt);
			} else if (modifier_key_required === modifier_key_already_pressed){
				modifier_key_already_pressed = false;
				selectionHandler(mousedown_x, mousedown_y, mouseup_x, mouseup_y, color, colortxt);
			} else if (modifier_key_already_pressed && modifier_key_required === "any") {
				modifier_key_already_pressed = false;
				selectionHandler(mousedown_x, mousedown_y, mouseup_x, mouseup_y, color, colortxt);
			}else {
				document.body.addEventListener("keydown", modifierHandler);
				modifierHandlerAttached = true;
			}
		}
		modifier_key_already_pressed = false;
		document.body.removeEventListener("mouseup", mouseUpHandler);
	}

	window.addEventListener('scroll', function() {
		modifier_key_already_pressed = false;
		removeModifierHandler();
		// remove selection to make it clear to user that highlighting is not possible after scrolling
		window.getSelection().removeAllRanges(); // shouldn't be a big inconveience
	});

};
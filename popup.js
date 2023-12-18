document.addEventListener('DOMContentLoaded', function() {
    var toggle_button = document.getElementById('toggle');
    var color_picker = document.getElementById('color_picker');
    var txt_color_picker = document.getElementById('txt_picker');
    var extension_title = document.getElementById('extension_title');
    var mode_toggle_button = document.getElementById('mode_toggle');
    var modifier_toggle_button = document.getElementById('modifier_toggle');
	var color_box_selection = document.getElementById('color_box_selection');
	// Get all buttons
	const key_buttons = document.querySelectorAll(".keyboard-selection .key");
	const key_warning_span = document.getElementById("key_warning");
	const key_message_span = document.getElementById("key_message");
	// Get all text color cells
	const color_txt_cells = document.querySelectorAll(".color-txt");
	const color_link_cells = document.querySelectorAll(".color-link");

    async function getFromStorage(keys) {
        return new Promise((resolve) => {
            chrome.storage.local.get(keys, resolve);
        });
    }

    function updateToggleButton(active) {
        toggle_button.innerHTML = (active ? '&check;' : '&#x2715;');
        if (active == false) {
            toggle_button.style.color = "red";
        } else {
            toggle_button.style.color = "black";
        }
    }

	function updateModifierToggleButton(newstate) {
		// Remove selected_key class from all buttons
		key_buttons.forEach(button => {
			button.classList.remove('selected_key');
		});

		// If newstate is falsy, set selected_key for false_key. Otherwise, set for the given ID
		let targetId = newstate ? `${newstate}_key` : 'false_key';
		let targetButton = document.getElementById(targetId);

		if (targetButton) {
			targetButton.classList.add('selected_key');
		}

		// Set visibility for the warning span based on the newstate
		key_warning_span.style.display = (newstate === false) ? '' : 'none';
		key_message_span.style.display = (newstate === "any") ? '' : 'none';
	}

	key_buttons.forEach(button => {
		button.addEventListener('click', async function() {
			// Determine the new state based on clicked button's data-key or id
			var newState;
			
			if (button.id === "false_key") {
				newState = false;
			} else {
				newState = button.dataset.key; // this will get the 'data-key' attribute value
			}

			// Store the new state in chrome storage
			chrome.storage.local.set({
				modifier_key_required: newState
			});

			// Update the UI
			updateModifierToggleButton(newState);
		});
	});
	


	


function updateModeToggleButton(mode) {
    let mode_toggle_button_word = document.getElementById('mode_toggle');
    let mode_toggle_button_phrase = document.getElementById('mode_toggle_2');
    
    if (mode === 'word') {
        mode_toggle_button_word.classList.add("active");
        mode_toggle_button_phrase.classList.remove("active");
    } else {
        mode_toggle_button_word.classList.remove("active");
        mode_toggle_button_phrase.classList.add("active");
    }
}

    function selectColorCell(color) {
        color_picker.querySelectorAll('.color-cell').forEach(function(cell) {
            cell.classList.toggle('selected_bg', cell.style.backgroundColor === color);
        });
        extension_title.style.backgroundColor = color;
		color_txt_cells.forEach(cell => {
			cell.style.backgroundColor = color;
		});
		document.getElementById("transparent_none").style.backgroundColor = color;
    }

/*
	document.getElementById("toggle_show_txt")?.addEventListener("click", function() {
		const hiddenRow = document.getElementById("hidden_txt_row");
		if (hiddenRow.style.display === "none") {
			hiddenRow.style.display = ""; // Shows the row
			document.getElementById("show_hide_text_1").innerHTML = "&#9660;";
		} else {
			hiddenRow.style.display = "none"; // Hides the row
			document.getElementById("show_hide_text_1").innerHTML = "&#9654;";
		}
	});
*/

    function selectTextColor(color) {
        txt_color_picker.querySelector('.selected_txt')?.classList.remove('selected_txt');
        extension_title.style.color = (color === 'transparent' ? 'black' : color);
		color_box_selection.style.color = (color === 'transparent' ? 'black' : color);
		
		if (color === "transparent"){
			document.getElementById("txt_transparent").classList.add('selected_txt');
			// this is for the link choice that has the same background and color as regular highlights
			document.getElementById("transparent_none").style.color = "black";
			return;
		}
		
		txt_color_picker.querySelectorAll('.color-txt').forEach(function(element) {
			if (element.style.color === color) {
				element.classList.add('selected_txt');
			}
		});
		
		document.getElementById("transparent_none").style.color = color;
    }
	
/*	
	document.getElementById("toggle_show_link")?.addEventListener("click", function(event) {
		const hiddenRow = document.getElementById("hidden_link_row");
		const arrowElement = document.getElementById("show_hide_link_1");

		if (hiddenRow.style.display === "none") {
			hiddenRow.style.display = ""; // Shows the row
			arrowElement.innerHTML = "&#9660;"; // Downwards arrow
		} else {
			hiddenRow.style.display = "none"; // Hides the row
			arrowElement.innerHTML = "&#9654;"; // Rightwards arrow
		}
	});
*/
	
	function selectLinkColor(link_colors) {
		// Remove the selected_link class from all color_link_cells
		color_link_cells.forEach(cell => {
			cell.classList.remove('selected_link');
		});

		// Get the cell with the constructed ID
		const targetCell = document.getElementById(link_colors);

		// Add the selected_link class to the identified cell
		if (targetCell) {
			targetCell.classList.add('selected_link');
		}
	}

	color_link_cells.forEach(cell => {
		cell.addEventListener('click', function(event) {
			const link_colors = event.target.id;
			
			chrome.storage.local.set({
				link_colors: link_colors,
			});
			
			selectLinkColor(link_colors);
		});
	});

    // Get the current state of the extension and color when the popup is loaded
    async function updateSettings() {
        const {
            active,
            color,
            colortxt,
            highlightmode,
            modifier_key_required,
			link_colors,
        } = await getFromStorage(['active', 'color', 'colortxt', 'highlightmode', 'modifier_key_required', 'link_colors']);
        updateModifierToggleButton(modifier_key_required);
        selectColorCell(color);		
        selectTextColor(colortxt);	
		selectLinkColor(link_colors);		
        updateToggleButton(active);
        updateModeToggleButton(highlightmode);
    }
    updateSettings();

    // Event listeners
    mode_toggle_button.addEventListener('click', async function() {
        const {
            highlightmode
        } = await getFromStorage(['highlightmode']);
        var newState = '';
        if (highlightmode === 'word') {
            newState = 'paragraph';
        } else {
            newState = 'word';
        }
        chrome.storage.local.set({
            highlightmode: newState
        });
        updateModeToggleButton(newState);
    });
	
	
	let mode_toggle_button_phrase = document.getElementById('mode_toggle_2');
	mode_toggle_button_phrase.addEventListener('click', async function() {
        const {
            highlightmode
        } = await getFromStorage(['highlightmode']);
        var newState = '';
        if (highlightmode === 'word') {
            newState = 'paragraph';
        } else {
            newState = 'word';
        }
        chrome.storage.local.set({
            highlightmode: newState
        });
        updateModeToggleButton(newState);
    });

    toggle_button.addEventListener('click', async function() {
        const {
            active
        } = await getFromStorage(['active']);
        var newState = !active;
        chrome.storage.local.set({
            active: newState
        });
        updateToggleButton(newState);
    });

    color_picker.addEventListener('click', function(event) {
        if (event.target.classList.contains('color-cell')) {
            var color = event.target.style.backgroundColor;
            selectColorCell(color);
            chrome.storage.local.set({
                color: color
            });
        }
    });

    txt_color_picker.addEventListener('click', function(event) {
        if (event.target.classList.contains('color-txt')) {
            var txt = event.target.style.color;
			if (!txt || txt === "") txt = "transparent";
            selectTextColor(txt)
            chrome.storage.local.set({
                colortxt: txt
            });
        }
    });
});
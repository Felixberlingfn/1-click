// listen to custom event
document.addEventListener('settings1_modifier_loaded', function() {
    // Actual code here...
	console.log("settings1_modifier loaded and custom event detected");

});

let key_buttons;
	
// Function to updte the key buttons
function updateModifierToggleButton(newstate) {
	// Get Elements from DOM
	//const modifier_toggle_button = document.getElementById('modifier_toggle');
	const key_warning_span = document.getElementById("key_warning");
	const key_message_span = document.getElementById("key_message");
	if (!key_buttons) key_buttons = document.querySelectorAll(".keyboard-selection .key");
	
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

function detectMac() {
	let isMac = navigator.userAgent.toLowerCase().includes('mac');
	if (isMac) {
		console.log("Mac");
		return true;
	}
	isMac = window.navigator.platform.toLowerCase().includes('mac');
	if (isMac) {
		console.log("Mac");
		return true;
	}
	return false;
}

function changeKeysForMac(){
	replace_if_mac = document.querySelectorAll(".replace_if_mac");
	
	// Remove selected_key class from all buttons
	replace_if_mac.forEach(mac => {
		mac.innerHTML = "Alt &#8997; <br> Option";
		mac.style.fontSize = "14px";
	});
	
	replace_if_mac_no_break = document.querySelectorAll(".replace_if_mac_no_break");
	
	// Remove selected_key class from all buttons
	replace_if_mac_no_break.forEach(mac2 => {
		mac2.innerHTML = "Alt &#8997; Option";
	});
}
	
function whenAllSettingsAreLoaded_1() {
	console.log("1 can interact with other content");

	if(detectMac()) changeKeysForMac();
		
	// Event Listeners for key buttons
	/*
	if (!key_buttons) key_buttons = document.querySelectorAll(".keyboard-selection .key");
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
			
			// go to next settings step
			showConfirmationThenNext("Now choose a background color.");
		});
	});*/
}
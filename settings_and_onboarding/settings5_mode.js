// listen to custom event
document.addEventListener('settings5_mode_loaded', function() {
    // Actual code here...
	console.log("settings5_mode loaded and custom event detected");
});


function updateToggleButton(active) {
	let toggle_button = document.getElementById('toggle');

	toggle_button.innerHTML = (active ? '&check;' : '&#x2715;');
	if (active == false) {
		toggle_button.style.color = "red";
	} else {
		toggle_button.style.color = "black";
	}
}

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


function whenAllSettingsAreLoaded_5() {
	console.log("5 can interact with other content");
	
    let mode_toggle_button_word = document.getElementById('mode_toggle');
    let mode_toggle_button_phrase = document.getElementById('mode_toggle_2');
	let toggle_button = document.getElementById('toggle');
	
    // Event listeners for "word" mode button
    mode_toggle_button_word.addEventListener('click', async function() {
        chrome.storage.local.set({highlightmode: 'word'});
        updateModeToggleButton('word');
		showConfirmationThenNext();	
    });
    
    // Event listeners for "phrase" mode button
    mode_toggle_button_phrase.addEventListener('click', async function() {
        chrome.storage.local.set({highlightmode: 'paragraph'});
        updateModeToggleButton('phrase');
		showConfirmationThenNext("You're all set.");	
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
}

// listen to custom event
document.addEventListener('settings2_background_loaded', function() {
    // Actual code here...
	console.log("settings2_background loaded and custom event detected");
});

let color_picker;
let color_box_selection;

function selectColorCell(color) {
	color_picker.querySelectorAll('.color-cell').forEach(function(cell) {
		cell.classList.toggle('selected_bg', cell.style.backgroundColor === color);
	});
	document.querySelectorAll('.adjustable_color').forEach(function(element) {
		element.style.backgroundColor = color;
	});
	color_txt_cells.forEach(cell => {
		cell.style.backgroundColor = color;
	});
	document.getElementById("transparent_none").style.backgroundColor = color;
}

function whenAllSettingsAreLoaded_2() {
	console.log("2 can interact with other content");
	
	// Get variables potentially needed by multiple functions
	color_picker = document.getElementById('color_picker');
	color_box_selection = document.getElementById('color_box_selection');
	
	color_picker.addEventListener('click', function(event) {
		//console.log("color_picker click event");
		if (event.target.classList.contains('color-cell')) {
            var color = event.target.style.backgroundColor;
            selectColorCell(color);
            chrome.storage.local.set({color: color});
			// go to next settings step
			showConfirmationThenNext("Now choose a text color.");	
        }
		// also set text color for favorite choice colors to make it simpler
	    if (event.target.classList.contains('settxt')) {
            var txt = event.target.style.color;
			if (!txt || txt === "") txt = "transparent";
            selectTextColor(txt)
            chrome.storage.local.set({colortxt: txt});
			// go to next settings step
			showConfirmationThenNext("...");
        }
	
    });
	
}
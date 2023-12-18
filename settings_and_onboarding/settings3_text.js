// listen to custom event
document.addEventListener('settings3_text_loaded', function() {
    // Actual code here...
	console.log("settings3_text loaded and custom event detected");
});

function selectTextColor(color) {
	//txt_color_picker.querySelector('.selected_txt')?.classList.remove('selected_txt');
	
	document.querySelectorAll('.selected_txt').forEach(function(element) {
		element.classList.remove('selected_txt');
	});
	
	document.querySelectorAll('.adjustable_color').forEach(function(element) {
		element.style.color = (color === 'transparent' ? 'black' : color);
	});
	
	color_box_selection.style.color = (color === 'transparent' ? 'black' : color);

	if (color === "transparent"){
		document.getElementById("txt_transparent")?.classList.add('selected_txt');
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


function whenAllSettingsAreLoaded_3() {
	console.log("3 can interact with other content");
	
	txt_color_picker.addEventListener('click', function(event) {
        if (event.target.classList.contains('color-txt')) {
            var txt = event.target.style.color;
			if (!txt || txt === "") txt = "transparent";
            selectTextColor(txt)
            chrome.storage.local.set({colortxt: txt});
			// go to next settings step
			showConfirmationThenNext("Optionally, choose a color for links.");
        }
    });
	
	// only needed in popup for now
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
}

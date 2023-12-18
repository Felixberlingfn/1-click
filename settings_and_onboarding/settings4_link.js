// listen to custom event
document.addEventListener('settings4_link_loaded', function() {
    // Actual code here...
	console.log("settings4_link loaded and custom event detected");
});

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


function whenAllSettingsAreLoaded_4() {
	console.log("4 can interact with other content");
	
	color_link_cells.forEach(cell => {
		cell.addEventListener('click', function(event) {
			const link_colors = event.target.id;	
			chrome.storage.local.set({link_colors: link_colors,});
			selectLinkColor(link_colors);
			showConfirmationThenNext("Lastly, pick a mode.");
		});
	});
	
	// currently only used in popup using ? to make it optional
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

}
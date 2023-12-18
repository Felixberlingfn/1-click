let extension_title;
let txt_color_picker;
let color_txt_cells;
let color_link_cells;

function whenAllSettingsAreLoaded_forall() {
	if (!extension_title) extension_title = document.getElementById('extension_title');
	txt_color_picker = document.getElementById('txt_picker');
	color_txt_cells = document.querySelectorAll(".color-txt");
	color_link_cells = document.querySelectorAll(".color-link");
	
	// Get the settings at loading
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
		// settings5_mode
        updateToggleButton(active);
		updateModeToggleButton(highlightmode);
    }
    updateSettings();
}
chrome.action.onClicked.addListener((tab) => {
    chrome.storage.local.get(['active'], function(result) {
        if (result.active) {
            chrome.scripting.executeScript({
                target: {
                    tabId: tab.id,
                    allFrames: true  // This will target all frames, including iframes
                },
                files: ['content.js']
            });
        }
    });
});

chrome.runtime.onInstalled.addListener(function(details) {
    // Set initial states
    if (details.reason === 'install') {
        chrome.tabs.create({
            url: 'settings_and_onboarding/settings0_main.html'
        });
        chrome.storage.local.set({
            active: true,
            color: 'gold',
            colortxt: 'black',
            highlightmode: 'word',
            modifier_key_required: 'Alt',
			link_colors: 'transparent_none',
        });

    }
});
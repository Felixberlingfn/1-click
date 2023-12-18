// Helper function
async function getFromStorage(keys) {
	return new Promise((resolve) => {
		chrome.storage.local.get(keys, resolve);
	});
}

// Functions
function whenAllSettingsAreLoaded(){
	console.log('All settings are loaded!');
	whenAllSettingsAreLoaded_forall(); // settings0_forall
	whenAllSettingsAreLoaded_1(); // settings1_modifier
	whenAllSettingsAreLoaded_2(); // settings2_background
	whenAllSettingsAreLoaded_3(); // settings3_text
	whenAllSettingsAreLoaded_4(); // settings4_link
	whenAllSettingsAreLoaded_5(); // settings5_mode
	// settings6_pin currently has no javascript to execute
}

// Global variables
let loadedSettingsCount = 0;
let currentStep;

// Track the current step
let stepsSequence = [
    'settings1_modifier',
    'settings2_background',
    'settings3_text',
    'settings4_link',
    'settings5_mode',
    /*'settings6_pin' removed from navigation, shows up at the bottom if window is large enough*/ 
];





function transitionToNextStep() {
	function getNextStep(currentStep) {
		let currentIndex = stepsSequence.indexOf(currentStep);
		if (currentIndex !== -1 && currentIndex < stepsSequence.length - 1) {
			return stepsSequence[currentIndex + 1];
		}
		return null; // return null if no next step found
	}

    let nextStep = getNextStep(currentStep);
	
	/*if (nextStep && nextStep === "settings2_background") {
		onboardingComplete();
		document.getElementById("title_for_new_users").style.display = "none";
		document.getElementById("confirm_finished_onboarding").style.display = "block";
		fadeTransition(currentStep, nextStep);
		//fadeInBlock("confirm_finished_onboarding");
		return;
	}*/
	// to do: thinking about it, this requires clicking next on the last step. should change it to if nextStep === "settings6_pin"
    if (nextStep) {
		fadeTransition(currentStep, nextStep);
    } else{
		console.log('This is the last step.');
        //onboardingComplete(); // if there's no next step, complete the onboarding or maybe not
    }
}


function transitionToPreviousStep() {
	function getPreviousStep(currentStep) {
		let currentIndex = stepsSequence.indexOf(currentStep);
		if (currentIndex > 0) { // check if it's not the first step
			return stepsSequence[currentIndex - 1];
		}
		return null; // return null if no previous step found
	}

    let previousStep = getPreviousStep(currentStep);

    if (previousStep) {
		fadeTransition(currentStep, previousStep);
    } else {
        // Handle edge case when there's no previous step. 
        // For example: stay on the first step or show some specific message, depending on your desired UX.
        console.log('This is the first step.');
    }
}


// Show current onboarding step
function showStep(stepId) {
	updateActiveTab(stepId);
		
    // Hide all steps
    /*let steps = document.querySelectorAll('.step');
    steps.forEach(step => {
        step.style.display = 'none';
    });*/
	
	/*let steps = document.querySelectorAll('.step');
	steps.forEach(step => {
		let id = step.id; // Getting the id of each step
		fadeOutBlock(id); // Calling the function with the id
	});*/

	// check window size and if large enough show "how to pin the extension div"
	//checkWindowSize();

    // Show the desired step
    //document.getElementById(stepId).style.display = 'block';
	fadeInBlock(stepId);

    // Save the current step to storage
    chrome.storage.local.set({ currentStep: stepId });
	
	// set global variable for easy retrieval
	currentStep =  stepId;
}


function showConfirmationThenNext(message) {
	if (onboarding_complete === true) return;
	onboardingComplete();
		
	/*function animateMessage(message) {
		const container = document.getElementById('settings_confirmation');
		
		// Create a new text node with the passed message
		const newText = document.createTextNode(message);

		// Create a span to wrap the text node (to apply the animation)
		const span = document.createElement('span');
		span.classList.add('animated-text');
		span.appendChild(newText);
		
		// Add the span to the container
		container.appendChild(span);
	}*/

    // Show the confirmation

	//document.getElementById('settings_confirmation').innerHTML = message; // empty old message
    //document.getElementById('settings_confirmation').style.display = 'block';
	//fadeTransition(currentStep, "settings_confirmation");
	
	// or maybe not transitionToNextStep();
	/*
	animateMessage(message);
	setTimeout(function() {transitionToNextStep();}, 1000);*/
}

function fadeInBlock(idname, showInstantly) {
  let block = document.getElementById(idname);
  block.style.display = 'block';  
  
  // if showinstantly is true show instantly
  if (showInstantly) {
    block.style.opacity = '1';
    block.style.visibility = 'visible';
	return;
  }

  // Use a timeout to allow the browser to render the block before starting the animation
  setTimeout(() => {
    block.classList.add('visible');
  }, 50); // A small delay should suffice
}

/*
function fadeInBlock(idname) {
  let block = document.getElementById(idname);
  block.style.display = 'block';
  block.classList.add('visible');
}*/

function fadeOutBlock(idname) {
  let block = document.getElementById(idname);
  block.classList.remove('visible');

  setTimeout(() => {
    block.style.display = 'none';
  }, 250); // This should match the duration of your fade-out animation
}


/*function fadeInBlock(idname) {
  let block = document.getElementById(idname);
  block.classList.remove('hidden');
  block.classList.add('visible');

  // Ensure display: block is set after any previous CSS is applied
  setTimeout(() => {
    block.style.display = 'block';
  }, 0);
}


function fadeOutBlock(idname) {
  let block = document.getElementById(idname);
  
  // Start the fade-out animation
  block.classList.add('hidden');
  
  // Remove the block from the flow after the animation finishes
  setTimeout(() => {
    block.style.display = 'none';
    block.classList.remove('hidden', 'visible'); // Reset for next fade-in, if needed
  }, 500); // This should match the duration of your fade-out animation
}*/

function fadeTransition(outId, inId) {
  // Fade out the first element
  fadeOutBlock(outId);

  // Set a timeout that matches the duration of the fade-out animation
  setTimeout(() => {
    // Fade in the second element
    showStep(inId);
  }, 250); // This should match the duration of your fade-out animation
}



/*
//------------------------------------------------------------------------
// considering removing show all because it looks messy, maybe tabs instead
// show all settings (onboarding is complete)
function showAllSteps() {
    let steps = document.querySelectorAll('.step:not(#settings6_pin)');
    steps.forEach(step => {
        step.style.display = 'block';
    });
}
// Function to show the "Show All Settings" button
function showShowAllSettingsButton() {
    document.getElementById('show-all-settings-btn').style.display = 'block';
}
// Function to hide the "Show All Settings" button
function hideShowAllSettingsButton() {
    document.getElementById('show-all-settings-btn').style.display = 'none';
}
// this means there is also no real difference when onboarding is completed
// I might still use the onboarding completed logic to adjust something like a welcome message
// Logic for when onboarding is completed
function onboardingComplete() {
    // Set the current step as onboarding complete
    chrome.storage.local.set({ currentStep: 'onboarding_complete' });

    // Display all steps (except pin step)
    showAllSteps();
	
	currentStep = 'onboarding_complete';
}
//------------------------------------------------------------------------
*/

// when onboarding is over, deactivate show message and go to next

function onboardingComplete() {
	//fadeOutBlock("prevnext");
	//hidePrevNextButtons();
	//hideSkipIntroButton();
	chrome.storage.local.set({ currentStep: 'onboarding_complete' });
	chrome.storage.local.set({ onboarding_complete: true });
	onboarding_complete = true;
	
	document.getElementById("title_for_new_users").style.display = "none";
	document.getElementById("confirm_finished_onboarding").style.display = "block";

}
// maybe not needed if intro is basically the same
function showSkipIntroButton(){
	//document.getElementById('skip_intro_button').style.display = 'block';
}
function hideSkipIntroButton(){
	document.getElementById('skip_intro_button').style.display = 'none';
}
//function hideShowAllSettingsButton() {}
function hidePrevNextButtons(){
	document.getElementById('prevnext').style.display = 'none';
} // no prev next button after onboarding
//------------------------------------------------------------------------


// load specific settings from separate file
function loadSetting(divId, filePath) {
    fetch(filePath)
    .then(response => response.text())
    .then(content => {
        document.getElementById(divId).innerHTML = content;
		
        // Dispatch a custom event after loading content
        const event = new Event(divId + '_loaded');
        document.dispatchEvent(event);
		settingLoaded();
    })
    .catch(error => {
        console.error('Error loading the setting:', error);
		console.error('section:', divId);
    });
}

// Common handler function
function settingLoaded() {
    // Increment the counter
    loadedSettingsCount++;

    // Check if all settings are loaded
    if (loadedSettingsCount === 6) {
        // All settings are loaded, execute some logic
		whenAllSettingsAreLoaded();
    }
}

let onboarding_complete;

// Retrieve current Step
async function retrieveCurrentStepAndShow() {
	const result_1 = await getFromStorage('currentStep');
	currentStep = result_1.currentStep;
	const result_2 = await getFromStorage('onboarding_complete');
	onboardingState = result_2.onboarding_complete;

    // Check the current step from url
    const urlParams = new URLSearchParams(window.location.search);
    const urlStep = urlParams.get('s');  // Get 's' from URL

    // Update currentStep if urlStep exists and is not null
    if (urlStep !== null) currentStep = urlStep;

	if (onboardingState) {
		console.log("onboarding state is true");
		onboarding_complete = true;
		document.getElementById("title_for_new_users").style.display = "none";
		document.getElementById("title_for_existing_users").style.display = "block";
		//hidePrevNextButtons();
		//hideSkipIntroButton();
	} else {
		//fadeInBlock("prevnext");
	}

	if (currentStep === 'onboarding_complete') {
		// Show all steps (except pin step)
		onboarding_complete = true;
		//hidePrevNextButtons();
		//hideSkipIntroButton();
		showStep('settings1_modifier');		
	} else if (currentStep) {
		// Show the saved step
		showStep(currentStep);
		if (!onboardingState) showSkipIntroButton();
	} else {
		// Start with the first step if no step is saved and onboarding isn't set in the URL
		showStep('settings1_modifier');
		if (!onboardingState) showSkipIntroButton();
	}
}

// for the tabs
function updateActiveTab(stepId) {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        if (tab.getAttribute('data-tab') === stepId) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
}

function checkWindowSize() {
	const thresholdWidth = 800;  // for example
	const thresholdHeight = 600; // for example

	const myDiv = document.getElementById('settings6_pin');

	if (window.innerWidth > thresholdWidth && window.innerHeight > thresholdHeight) {
		myDiv.style.display = 'block';
	} else {
		myDiv.style.display = 'none';
	}
}

// Main Event Listener -------------------------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', function() {
	
	loadSetting('settings1_modifier', 'settings1_modifier.html');
	loadSetting('settings2_background', 'settings2_background.html');
	loadSetting('settings3_text', 'settings3_text.html');
	loadSetting('settings4_link', 'settings4_link.html');
	loadSetting('settings5_mode', 'settings5_mode.html');
	loadSetting('settings6_pin', 'settings6_pin.html');
	

    document.getElementById('skip_intro_button').addEventListener('click', function() {
        onboardingComplete();
    });

    // Add event listener for the 'Next' button
	document.getElementById('next-btn').addEventListener('click', transitionToNextStep);
	document.getElementById('skip-btn').addEventListener('click', transitionToNextStep);

	
	// Add event listener for the 'Previous' button
	document.getElementById('prev-btn').addEventListener('click', transitionToPreviousStep);
	
	
	// event listener for tabs
	const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
			
            // Get the stepId from the tab's data attribute
            const stepId = tab.getAttribute('data-tab');  
			
            // Call the showStep function
			fadeTransition(currentStep, stepId);
			
			/*fadeOutBlock(currentStep);
			setTimeout(function() {
			  showStep(stepId);
			}, 1000);*/
        });
    });
	
	// show current step
	retrieveCurrentStepAndShow();
	// show pin info if large enough window
	checkWindowSize();
	
	fadeInBlock("prevnext");
	
	window.addEventListener('resize', checkWindowSize);
	
	
	document.body.addEventListener('keydown', function changeCursorToHand(event) {
		if (event.altKey) event.preventDefault();
		if (event.altKey /*|| event.key === "h" || event.key === "m" || event.key === "1" || event.key === "c" || event.key === "t"*/) {
			// image used from canva.com licensed for free use no watermark or attribution needed https://www.canva.com/licensing-explained/
			document.body.style.cursor = 'url(https://one-click-marker-chrome.w3spaces.com/mouse_highlighter.png) , pointer'; // Change cursor to highlighter icon or hand if not available
		}
	});
	
	document.body.addEventListener('keyup', function(event) {
		document.body.style.cursor = 'auto'; // Change cursor back to default
	});

});





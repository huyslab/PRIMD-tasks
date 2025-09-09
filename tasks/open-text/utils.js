/**
 * Open Text Task Utilities
 * 
 * This module provides utility functions and classes for the open text response task,
 * including user session management, text input validation, timer functionality,
 * and trial creation for open-ended questions.
 */

// Data saving function
import { saveDataREDCap } from '@utils/index.js'; // or wherever this is defined

/**
 * User session class for tracking participant progress and behavior
 * Stores various flags and counters for a given participant throughout the experiment
 */
export class User {
    constructor() {
        this.consent = null                 // Participant consent status
        this.attention_check1 = 0          // First attention check score
        this.attention_check2 = 0          // Second attention check score  
        this.attention_check = 0           // Overall attention check score
        this.empty_responses = false       // Flag for empty responses
        this.timeout_count = 0             // Number of timeouts experienced
        this.empty_count = 0               // Number of empty responses submitted
        this.warning_count = 0             // Number of warnings shown to participant
        this.last_checked = null           // Last checkbox state checked
    }
}

/**
 * Processes text input, counts words, and controls UI elements based on word count
 * Handles real-time validation and UI updates as user types
 * 
 * @param {HTMLInputElement} input - The text input field containing user input
 * @param {HTMLElement} counter - Element displaying remaining word count needed
 * @param {HTMLElement} div_counter - UI element showing/hiding word count message
 * @param {HTMLElement} submit_bttn - Submit button (visible when min words met)
 * @param {Object} settings - Task configuration settings
 * @param {number} settings.min_words - Minimum word count required
 */
function separateWords(input, counter, div_counter, submit_bttn, settings) {
    // Clean and normalize the input text
    let text = input.value
    text = text.replace(/\s\s+/g, ' '); // Replace multiple spaces with single space

    // Replace punctuation with spaces for word separation
    text = text.replace(/[,;.]/g, ' ');
    
    // Ensure single spacing throughout
    text = text.replace(/\s\s+/g, ' ');

    // Split into words and clean up empty entries
    let words = text.split(" ");
    if (words.length > 0) {
        // Remove trailing spaces and empty strings
        if (words[words.length - 1] === " ") {
            words.pop()
        }
        if (words[words.length - 1] === "") {
            words.pop()
        }
    }

    // Update UI based on word count vs minimum requirement
    if (words.length >= settings.min_words) {
        // Sufficient words: show submit button, hide counter
        submit_bttn.style.visibility = "visible"
        div_counter.style.visibility = "hidden"
        counter.innerHTML = 0
    } else {
        // Insufficient words: hide submit button, show remaining count
        submit_bttn.style.visibility = "hidden"
        div_counter.style.visibility = "visible"
        counter.innerHTML = settings.min_words - words.length
    }
};

/**
 * Starts a countdown timer with warning display functionality
 * Shows warning when time is running low and manages timer visibility
 * 
 * @param {number} duration - Total countdown duration in seconds
 * @param {HTMLElement} display - Element showing the remaining time warning
 * @param {number} warning_time - Time left (seconds) when warning becomes visible
 * @param {HTMLElement|null} [min_instr=null] - Optional instruction element to hide during countdown
 */
function startTimer_sec(duration, display, warning_time, min_instr = null) {
    var timer = duration, minutes, seconds;
    let timer_interval = setInterval(function () {
        seconds = parseInt(timer, 10);

        // Show warning when time is running low
        if (seconds <= warning_time && seconds > 0) {
            display.style.visibility = 'visible'
            if (min_instr != null) {
                min_instr.style.visibility = "hidden"
            }
        } else if (seconds > warning_time && seconds > 0) {
            // Hide warning when plenty of time remains
            display.style.visibility = 'hidden'
        } else {
            // Hide warning when time is up
            display.style.visibility = 'hidden'
        }

        // Decrement timer, stop at 0
        if (--timer < 0) {
            timer = 0;
        }
    }, 1000);
}

/**
 * Displays a custom alert warning about timeouts and pauses the experiment
 * Automatically resumes the experiment after the specified duration
 * 
 * @param {Object} settings - Task configuration settings
 * @param {string} settings.warning_text - HTML content for the warning message
 * @param {number} settings.timeout_alert_duration - Duration to show alert (seconds)
 */
function showAlert(settings) {
    // Create and display custom alert overlay
    let alert_text = `
                   <div id="customAlert">
                   ` + settings.warning_text 
    document.getElementById('jspsych-content').innerHTML = alert_text

    let alertBox = document.getElementById("customAlert");
    alertBox.style.display = "block";  // Show the alert box

    // Pause experiment while alert is displayed
    jsPsych.pauseExperiment()

    // Auto-hide alert and resume experiment after specified duration
    setTimeout(function () {
        alertBox.style.display = "none";
        jsPsych.resumeExperiment()
    }, (settings.timeout_alert_duration) * 1000);
}

// ------------> Generic content for questions <---------------

/**
 * Creates the question preamble HTML with progress indicator and instructions
 * Displays question counter, time limit information, and time remaining warning
 * 
 * @param {Object} settings - Task configuration settings
 * @param {string} settings.oq_timelimit_text - Display text for time limit
 * @returns {string} HTML content for question preamble
 */
const questionPreamble = (settings) => {
    return `<div id="qs_preamble"><p id="qs_preamble_q_p"><u>Question <span id="qs_preamble_q_no"></span> of <span id="qs_preamble_q_max"></span></u></p>
        <h4>` + "Please type your answer in detail in the box below." + `</h4>
        <p id="qs_preamble_disclosure">(You have <b>` + settings.oq_timelimit_text + `</b> to answer)</p>
        <div id="qs_timeleft">
        Your time will soon be over. Don't forget to submit your answer!
        </div>
        </div>`
}

/**
 * Creates HTML for word counter display showing remaining words needed
 * 
 * @param {Object} settings - Task configuration settings
 * @param {number} settings.min_words - Minimum word count required
 * @returns {string} HTML content for word counter
 */
export const timeWord = (settings) => {
    return `<div id="qs_words">
    Please write at least <span id="qs_words_left">` + settings.min_words + `</span> more words.
    </div>
    `
}

// Submit button label for questions
let lvl_x_question_button_label = "Submit answer"

// ------------> RELMED open-ended questions <---------------

// Catch question validation response
let lvl2_catch_ans = 'catch response'

// ------------> Open question trial function <---------------

/**
 * Creates a jsPsych survey text trial with comprehensive UI enhancements and validation
 * Handles timing, word counting, styling, data saving, and warning systems
 *
 * @param {Array} qs_list - Array of question objects containing question details
 * @param {number} [q_index=0] - Index of current question in the list
 * @param {number} q_count - Current question number in experiment sequence
 * @param {User} currentUser_instance - User session object tracking progress
 * @param {Object} settings - Task configuration settings
 * @param {number} settings.writing_time - Time allowed for writing response (seconds)
 * @param {number} settings.qs_read_time - Additional time for reading question (seconds)
 * @param {number} settings.warning_time - Time before showing warning (seconds)
 * @param {number} settings.min_words - Minimum words required per response
 * @param {boolean} settings.prevent_paste - Whether to prevent pasting into text area
 * @param {boolean} settings.no_skip - Whether skipping is disabled
 * @param {number} settings.max_timeout - Maximum timeouts before experiment termination
 * 
 * @returns {Object} jsPsych trial configuration object
 */
export function question_trial(qs_list, q_index = 0, q_count, currentUser_instance, settings) {
    const nQ = qs_list.length

    console.log(1000 * (settings.writing_time + settings.qs_read_time))
    
    return {
        type: jsPsychOpenText,
        preamble: questionPreamble(settings),
        button_label: lvl_x_question_button_label,
        questions: [qs_list[q_index]],
        css_classes: ['lvlx_qs'],
        trial_duration: 1000 * (settings.writing_time + settings.qs_read_time),
        data: {trialphase: 'open-text'},
        
        /**
         * Trial initialization - sets up UI, styling, timers, and event listeners
         */
        on_load: function () {
            // Skip UI setup during simulation mode
            if (!window.simulating) {
                let q_name = qs_list[q_index]['name']

                // Initialize user tracking
                currentUser_instance.last_checked = false

                // Apply alternating background styling for question distinction
                let instr_el = document.getElementById('qs_instr');
                let q_no_el = document.getElementById('qs_preamble_q_p');
                if (q_index % 2 === 0) {
                    // Even questions: light gray background, blue text
                    instr_el.style.background = `rgb(211, 211, 211, 0.5)`
                    q_no_el.style.color = `rgb(65, 105, 225)`
                } else {
                    // Odd questions: dark gray background, blue text
                    instr_el.style.background = `rgb(85, 85, 85, 0.4)`
                    q_no_el.style.color = `blue`
                }

                // Update question progress display
                let q_max_el = document.getElementById('qs_preamble_q_max');
                q_max_el.innerHTML = nQ.toString()
                let q_no_item = document.getElementById("qs_preamble_q_no")
                q_no_item.textContent = (q_count).toString()

                // Initialize and start countdown timer
                let time_display = document.querySelector('#qs_timeleft')
                time_display.style.visibility = 'hidden'
                let minute_instr = document.getElementById('qs_preamble_disclosure')
                startTimer_sec(settings.writing_time, time_display, settings.warning_time, minute_instr)

                // Adjust layout spacing based on preamble height
                let preamble = document.getElementById("qs_preamble").clientHeight
                let lvlx_el = document.getElementsByClassName("lvlx_qs")[0]
                lvlx_el.style.marginTop = (preamble * 1.025).toString() + 'px'
                
                try {
                    // Responsive layout adjustment on window resize
                    window.addEventListener('resize', function () {
                        let preamble = document.getElementById("qs_preamble").clientHeight
                        let lvlx_el = document.getElementsByClassName("lvlx_qs")[0]
                        lvlx_el.style.marginTop = (preamble * 1.025).toString() + 'px'
                    })
                } catch (error) {
                    console.error('resize issues')
                }

                // Get UI elements for word counting and validation
                let my_txt_area = document.getElementsByTagName('textarea')[0]
                let counter = document.getElementById('qs_words_left')
                let div_counter = document.getElementById('qs_words')
                let submit_bttn = document.getElementById('jspsych-survey-text-next')

                // Initially hide submit button until minimum words reached
                submit_bttn.style.visibility = "hidden"

                // Prevent paste functionality if configured
                if (settings.prevent_paste) {
                    my_txt_area.addEventListener('paste', e => e.preventDefault());
                }

                // Reference to alert element for checkbox validation
                let alert_el = document.getElementById('formAlert')

                // Attach real-time word counting to text input
                my_txt_area.addEventListener('input', function () {
                    separateWords(my_txt_area, counter, div_counter, submit_bttn, settings);
                })
            }
        },

        /**
         * Trial completion - processes response data, validates, saves, and handles warnings
         */
        on_finish: function (data) {
            let q_name = qs_list[q_index]['name']
           
            // Track timeout occurrences
            currentUser_instance.timeout_count += data['timeout'] * 1

            // Validate response length by counting words
            let words = data['response'][q_name].replace(/\s\s+/g, ' ').split(" ")
            if (words.length > 0) {
                // Clean up trailing spaces and empty strings
                if (words[words.length - 1] === " ") {
                    words.pop()
                }
                if (words[words.length - 1] === "") {
                    words.pop()
                }
            }
            let n_words = words.length
            let empty_response = n_words < settings.min_words

            // Track empty response occurrences
            currentUser_instance.empty_count += empty_response * 1

            // Prepare comprehensive data for REDCap storage
            var extraFields = {
                // Response content and validation
                [`responses_${q_name}`]: data['response'],
                [`is_empty_${q_name}`]: empty_response,
                
                // Timing and performance data
                [`rts_${q_name}`]: data['rt'],
                [`timeout_${q_name}`]: data['timeout'],
                
                // Cumulative user metrics
                empty_count: currentUser_instance.empty_count,
                timeout_count: currentUser_instance.timeout_count
            };

            // Handle warnings and potential experiment termination
            if (data['timeout'] || empty_response) {
                currentUser_instance.warning_count += 1
                
                // Show warning alert for timeout/empty response
                showAlert(settings);
            }
        }
    }
}

// ----------------------------------------------------------

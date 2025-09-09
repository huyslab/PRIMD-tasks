/*
 * Adapted from Jiazhou Chen's gambling task
 *
 * Modified and used by zeguo.qiu@ucl.ac.uk
 *
 * Version 0.2 - adding Pavlovian stimuli learning - Haoyang
 * 
 * Version 1.0 - modified by Yaniv to allow for three stimuli
 * 
 * Version 1.1 - modified by Yaniv to allow for one stimulus
 *
 * Version 1.11 - name change for consistency
 */

jsPsychCardChoosing = (function (jspsych) {

    const info = {
        name: 'card-choosing',
        description: '',
        version: "1.1",
        parameters: {
            stimulus_left: {
                type: jspsych.ParameterType.STRING,
                pretty_name: 'Left Image',
                default: '',
            },
            stimulus_right: {
                type: jspsych.ParameterType.STRING,
                pretty_name: 'Right Image',
                default: '',
            },
            stimulus_middle: {
                type: jspsych.ParameterType.STRING,
                pretty_name: 'Middle Image',
                default: '',
            },
            feedback_left: {
                type: jspsych.ParameterType.STRING,
                pretty_name: 'Left Outcome',
                default: '',
            },
            feedback_middle: {
                type: jspsych.ParameterType.STRING,
                pretty_name: 'Middle Outcome',
                default: '',
            },
            feedback_right: {
                type: jspsych.ParameterType.STRING,
                pretty_name: 'Right Outcome',
                default: '',
            },
            optimal_right: {
                type: jspsych.ParameterType.INT,
                pretty_name: 'Is the optimal stimulus on the right?',
                default: '',
            },
            // For three stimulus version, we use optimal_side
            optimal_side: {
                type: jspsych.ParameterType.STRING,
                pretty_name: 'Which side is the optimal stimulus on?',
                default: '',
            },
            // How many stimuli to present, supported values are 2 and 3
            n_stimuli: {
                type: jspsych.ParameterType.INT,
                default: 2
            },
            // Whether to present Pavlovian stimulus
            present_pavlovian: {
                type: jspsych.ParameterType.BOOL,
                default: true
            },
            // Whether to present Pavlovian stimulus
            circle_around_coin: {
                type: jspsych.ParameterType.BOOL,
                default: true
            },
            // Response deadline
            response_deadline: {
                type: jspsych.ParameterType.INT,
                default: 3000,
            },
            // Duration of coin presentation
            feedback_duration: {
                type: jspsych.ParameterType.INT,
                default: 1000
            },
            /** Duration of warning message */
            warning_duration: {
                type: jspsych.ParameterType.INT,
                default: 1500
            },
            /** Whether to show response deadline warning */
            show_warning: {
                type: jspsych.ParameterType.BOOL,
                default: true
            },
            /** Duration of choice feedback before flip */
            choice_feedback_duration: {
                type: jspsych.ParameterType.INT,
                default: 500
            },
            /** Duration of Pavlovian stimulus presentation before flip */
            pavlovian_stimulus_duration: {
                type: jspsych.ParameterType.INT,
                default: 300
            },
            /** Duration of flip */
            flip_duration: {
                type: jspsych.ParameterType.INT,
                default: 100
            },
            /** Duration of coin flip */
            coin_flip_duration: {
                type: jspsych.ParameterType.INT,
                default: 250
            },
            /** Coin image filenames */
            coin_images: {
                type: jspsych.ParameterType.OBJECT,
                default: {
                    0.01: "./assets/images/card-choosing/outcomes/1penny.png",
                    1.0: "./assets/images/card-choosing/outcomes/1pound.png",
                    0.5: "./assets/images/card-choosing/outcomes/50pence.png",
                    "-0.01": "./assets/images/card-choosing/outcomes/1pennybroken.png",
                    "-1": "./assets/images/card-choosing/outcomes/1poundbroken.png",
                    "-0.5": "./assets/images/card-choosing/outcomes/50pencebroken.png"
                },
            },
            /** Coin image filenames */
            pavlovian_images: {
                type: jspsych.ParameterType.OBJECT,
                default: {
                    0.01: "PIT3.png",
                    1.0: "PIT1.png",
                    0.5: "PIT2.png",
                    "-0.01": "PIT4.png",
                    "-1": "PIT6.png",
                    "-0.5": "PIT5.png"
                },
            },
            /** Whether to present feedback (test trials are with no feedback) */
            present_feedback:{
                type: jspsych.ParameterType.BOOL,
                default: true
            }
        },
        data: {
            response: {
                type: jspsych.ParameterType.STRING,
                pretty_name: 'Chosen side (left or right)'
            },
            key: {
                type: jspsych.ParameterType.STRING,
                pretty_name: 'Key pressed (left or right arrow key)'
            },
            stimulus_left: {
                type: jspsych.ParameterType.STRING,
                pretty_name: 'Image shown on the left'
            },
            stimulus_right: {
                type: jspsych.ParameterType.STRING,
                pretty_name: 'Image shown on the right'
            },
            feedback_left: {
                type: jspsych.ParameterType.FLOAT,
                pretty_name: 'Outcome associated with the left image'
            },
            feedback_right: {
                type: jspsych.ParameterType.FLOAT,
                pretty_name: 'Outcome associated with the right image'
            },
            optimal_right: {
                type: jspsych.ParameterType.INT,
                pretty_name: 'Whether the right image is optimal (1 for yes, 0 for no)'
            },
            optimal_side: {
                type: jspsych.ParameterType.STRING,
                pretty_name: 'Which side was the optimal stimulus on'
            },
            n_stimuli: {
                type: jspsych.ParameterType.INT,
                pretty_name: 'How many stimuli presented'
            },
            chosen_stimulus: {
                type: jspsych.ParameterType.STRING,
                pretty_name: 'The chosen image (left or right)'
            },
            chosen_feedback: {
                type: jspsych.ParameterType.FLOAT,
                pretty_name: 'The outcome associated with the chosen image'
            },
            rt: {
                type: jspsych.ParameterType.FLOAT,
                pretty_name: 'Reaction time'
            },
            response_optimal: {
                type: jspsych.ParameterType.BOOL,
                pretty_name: 'Whether the response was optimal'
            },
            pavlovian_stimulus: {
                type: jspsych.ParameterType.STRING,
                pretty_name: 'Which Pavlovian stimulus was presented'
            }
        }
    }

    class cardChoosingPlugin {
        constructor(jsPsych) {
            this.jsPsych = jsPsych;

            this.data = {

            };

        }

        // Trial function
        trial(display_element, trial) {

            // Set allowed keys
            if (trial.n_stimuli === 2) {
                // Key dictionary
                this.keys = {
                    'arrowleft': 'left',
                    'arrowright': 'right'
                }
            } else {
                this.keys = {
                    'arrowleft': 'left',
                    'arrowright': 'right',
                    'arrowup': 'middle'
                }
            }

            // Convenience variable
            this.contingency = {
                img: [trial.stimulus_left, trial.stimulus_right, trial.stimulus_middle],
                outcome: [trial.feedback_left, trial.feedback_right, trial.feedback_middle],
            }
            
            // Set data values
            this.data.stimulus_left = this.contingency.img[0];
            this.data.stimulus_right = this.contingency.img[1];
            this.data.feedback_left = this.contingency.outcome[0];
            this.data.feedback_right = this.contingency.outcome[1];
            if (trial.n_stimuli === 2) {
                this.data.optimal_right = trial.optimal_right;
            } else {
                this.data.optimal_side = trial.optimal_side;
            }

            this.data.n_stimuli = trial.n_stimuli;

            if (trial.n_stimuli != 2) {
                this.data.stimulus_middle = trial.stimulus_middle;
                this.data.feedback_middle = trial.feedback_middle;
            }

            this.data.response_deadline_warning = false;

            // Create stimuli
            display_element.innerHTML = this.create_stimuli(trial.n_stimuli);

            // Trial end function
            const endTrial = () => {
                // clear the display
                let optionBox = document.getElementById("cardChoosingOptionBox");
                optionBox.style.display = 'none';

                const optimalSide = trial.n_stimuli === 2 ? (this.data.optimal_right == 1 ? 'right' : 'left') : trial.optimal_side
                this.data.response_optimal = this.data.response === optimalSide
                this.jsPsych.pluginAPI.cancelAllKeyboardResponses()
                this.jsPsych.pluginAPI.clearAllTimeouts()
                this.jsPsych.finishTrial(this.data)

            }

            function showTemporaryWarning(message, duration = 800) {
                // Create warning element
                const warningElement = document.createElement('div');
                warningElement.id = 'vigour-warning-temp';
                warningElement.innerText = message;

                // Style the warning with modern CSS
                warningElement.style.cssText = `
                    position: fixed;
                    left: 50%;
                    top: 50%;
                    transform: translate(-50%, -50%);
                    z-index: 9999;
                    background-color: rgba(244, 206, 92, 0.9);
                    padding: 15px 25px;
                    border-radius: 8px;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                    font-size: 24px;
                    font-weight: 500;
                    color: #182b4b;
                    opacity: 0;
                    transition: opacity 0.2s ease;
                    text-align: center;
                    letter-spacing: 0.0px;
                `;

                // Add to document body
                document.body.appendChild(warningElement);

                // Force reflow to ensure transition works
                warningElement.offsetHeight;

                // Show warning with fade-in effect
                warningElement.style.opacity = '1';

                // Remove after duration with fade-out effect
                setTimeout(() => {
                    warningElement.style.opacity = '0';
                    setTimeout(() => {
                        warningElement.remove();
                    }, 200); // Wait for fade out transition
                }, duration);
            }


            // Response function
            const keyResponse = (e) => {
                this.jsPsych.pluginAPI.cancelAllKeyboardResponses()
                this.jsPsych.pluginAPI.clearAllTimeouts()
                this.data.keyPressOnset = performance.now()

                if (e !== '') {
                    // if there is a response:
                    this.data.key = e.key.toLowerCase()
                    this.data.response = this.keys[e.key.toLowerCase()]
                    const possible_responses = trial.n_stimuli === 2 ? ["right", "left"] : ["right", "left", "middle"]
                    const inverse_response = possible_responses.filter(element => element !== this.data.response)
                    this.data.rt = e.rt
                    this.n_stimuli = trial.n_stimuli

                    if (this.data.response === 'left') {
                        this.data.chosen_stimulus = this.contingency.img[0]
                        this.data.chosen_feedback = this.contingency.outcome[0]

                    } else if (this.data.response === 'right') {
                        this.data.chosen_stimulus = this.contingency.img[1]
                        this.data.chosen_feedback = this.contingency.outcome[1]
                    } else if (this.data.response === 'middle') {
                        this.data.chosen_stimulus = this.contingency.img[2]
                        this.data.chosen_feedback = this.contingency.outcome[2]
                    }

                    this.data.pavlovian_stimulus = trial.present_pavlovian ? trial.pavlovian_images[this.data.chosen_feedback] : '';

                    // Helper function
                    function capitalizeWord(word) {
                        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
                    }

                    // Identify image to be changed
                    const selImg = document.getElementById("cardChoosing" + capitalizeWord(trial.n_stimuli === 1 ? "middle" : this.data.response) + 'Img')

                    // Draw selection box:
                    if (trial.n_stimuli !== 1) {
                        selImg.style.border = '20px solid darkgrey'    
                    } else {
                        // Press selected key
                        const selKey = document.getElementById(`${this.data.response}_key`)
                        selKey.className = "spacebar-icon-pressed"

                        // Remove other keys
                        inverse_response.forEach(response => {
                            document.getElementById(`${response}_key`).style.opacity = '0';
                        });

                    }

                    if (trial.n_stimuli === 2) {
                        document.getElementById('centerTxt').innerText = '';
                    }

                    if (trial.present_feedback){
                        // Draw coin, circle around it and pavlovian background
                        const coin = document.createElement('img')
                        coin.id = 'cardChoosingCoin'
                        coin.className = 'cardChoosingCoin'

                        const coinCircle = document.createElement('div')
                        coinCircle.id = 'cardChoosingCoinCircle'
                        coinCircle.className = 'cardChoosingCoinCircle'

                        const coinBackground = document.createElement('img')
                        coinBackground.id = "cardChoosingCoinBackground"
                        coinBackground.className = "cardChoosingCoinBackground"

                        coin.src = trial.coin_images[this.data.chosen_feedback];

                        if (trial.present_pavlovian) {
                            coinBackground.src = trial.pavlovian_images[this.data.chosen_feedback];

                            document.getElementById(this.data.response).appendChild(coinBackground)
                            document.getElementById(this.data.response).appendChild(coinCircle)
                        }
                        document.getElementById(trial.n_stimuli === 1 ? "middle" : this.data.response).appendChild(coin)

                        // Set timer post response feedback
                    
                        this.jsPsych.pluginAPI.setTimeout(() => {

                            if (trial.n_stimuli !== 1){
                                inverse_response.forEach(response => {
                                    document.getElementById("cardChoosing" + capitalizeWord(response) + 'Img').style.opacity = '0';
                                });
                            }
                            
                            const ani1 = selImg.animate([
                                { transform: "rotateY(0)", visibility: "visible" },
                                { transform: "rotateY(90deg)", visibility: "hidden" },
                            ], { duration: trial.flip_duration, iterations: 1, fill: 'forwards' })
    
                            ani1.finished.then(() => {
    
                                if (trial.present_pavlovian) {
                                    // Pavlovian stimulus flips and coin appears 
                                    const ani2 = coinBackground.animate([
                                        { transform: "rotateY(90deg)", visibility: "hidden" },
                                        { transform: "rotateY(0deg)", visibility: "visible" },
                                    ], { duration: trial.flip_duration, iterations: 1, fill: 'forwards' });
    
                                    ani2.finished.then(() => {
                                        this.jsPsych.pluginAPI.setTimeout(() => {
                                            coin.style.visibility = 'visible';
                                            if (trial.circle_around_coin) {
                                                coinCircle.style.visibility = 'visible';
                                            }
                                            this.jsPsych.pluginAPI.setTimeout(endTrial, trial.feedback_duration);
                                        }, trial.pavlovian_stimulus_duration)
                                    });
                                } else {
                                    // Coin flips
                                    const ani2 = coin.animate([
                                        { transform: "rotateY(90deg)", visibility: "hidden" },
                                        { transform: "rotateY(0deg)", visibility: "visible" },
                                    ], { duration: trial.coin_flip_duration, iterations: 1, fill: 'forwards' })
                                    ani2.finished.then(() => {
                                        this.jsPsych.pluginAPI.setTimeout(endTrial, trial.feedback_duration)
                                    });
                                }
                            })
                        }, trial.choice_feedback_duration);
                    } else {
                        this.jsPsych.pluginAPI.setTimeout(endTrial, trial.choice_feedback_duration);
                    }
                    

                } else {
                    // no response
                    this.data.response = 'noresp';

                    // Set outcome to lowest possible on trial
                    this.data.chosen_feedback = Math.min(this.data.feedback_left, this.data.feedback_right);

                    if (trial.show_warning){
                        // Report warning shown
                        this.data.response_deadline_warning = true;

                        // Display messge
                        document.getElementById('centerTxt').innerText = ''
                        showTemporaryWarning("Didn't catch a response - moving on", trial.warning_duration - 200)

                        // End trial after warning message
                        this.jsPsych.pluginAPI.setTimeout(endTrial, (trial.warning_duration));
                    } else {
                        endTrial()
                    }
                }
            }

            // Keyboard listener
            this.jsPsych.pluginAPI.getKeyboardResponse({
                callback_function: keyResponse,
                valid_responses: Object.keys(this.keys),
                rt_method: 'performance',
                persist: false,
                allow_held_key: false
            });

            // Set listener for response_deadline
            if (trial.response_deadline > 0) {
                this.jsPsych.pluginAPI.setTimeout(() => {
                    keyResponse('')
                }, trial.response_deadline);
            }

        }

        // Simulation method
        simulate(trial, simulation_mode, simulation_options, load_callback) {
            if (simulation_mode == "data-only") {
                load_callback();
                this.simulate_data_only(trial, simulation_options);
            }
            if (simulation_mode == "visual") {
                this.simulate_visual(trial, simulation_options, load_callback);
            }
        }

        // Create simulated data
        create_simulation_data(trial, simulation_options) {
            // Set allowed keys
            if (trial.n_stimuli === 2) {
                // Key dictionary
                this.keys = {
                    'arrowleft': 'left',
                    'arrowright': 'right'
                }
            } else {
                this.keys = {
                    'arrowleft': 'left',
                    'arrowright': 'right',
                    'arrowup': 'middle'
                }
            }

            // Set data
            let default_data = {
                key: this.jsPsych.pluginAPI.getValidKey(Object.keys(this.keys)),
                stimulus_left: trial.stimulus_left,
                stimulus_right: trial.stimulus_right,
                feedback_left: trial.feedback_left,
                feedback_right: trial.feedback_right,
                rt: this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true),
                n_stimuli: trial.n_stimuli
            };

            if (trial.n_stimuli !== 2) {
                default_data.stimulus_middle = trial.stimulus_middle;
                default_data.feedback_middle = trial.feedback_middle;
                default_data.optimal_side = trial.optimal_side;
            } else {
                default_data.optimal_right = trial.optimal_right;
            }

            const optimalSide = trial.n_stimuli === 2 ? (default_data.optimal_right == 1 ? 'right' : 'left') : trial.optimal_side
            default_data.response = this.keys[default_data.key]
            default_data.response_optimal = default_data.response === optimalSide
            default_data.chosen_stimulus = default_data[`stimulus_${default_data.response}`]
            default_data.chosen_feedback = default_data[`feedback_${default_data.response}`]


            const data = this.jsPsych.pluginAPI.mergeSimulationData(default_data, simulation_options);
            this.jsPsych.pluginAPI.ensureSimulationDataConsistency(trial, data);
            return data;
        }

        // Data only simulation function
        simulate_data_only(trial, simulation_options) {
            const data = this.create_simulation_data(trial, simulation_options);
            this.jsPsych.finishTrial(data);
        }

        // Visual simulation function
        simulate_visual(trial, simulation_options, load_callback) {
            const data = this.create_simulation_data(trial, simulation_options);
            const display_element = this.jsPsych.getDisplayElement();
            trial.feedback_duration = 50;
            trial.choice_feedback_duration = 50;
            trial.pavlovian_stimulus_duration = 10;
            trial.flip_duration = 10;
            trial.coin_flip_duration = 10;
            this.trial(display_element, trial);
            load_callback();
            if (data.rt !== null) {
                this.jsPsych.pluginAPI.pressKey(data.key, data.rt);
            }
        }

        // Stimuli creation
        create_stimuli(num_stim) {
            let html = ''

            if (num_stim !== 2) {
                html += `<div class="cardChoosingHelperTxt3">
                            <p id="centerTxt">&zwnj;</p>
                </div>
                `
            }

            html += `
                    <div id="cardChoosingOptionBox" class="cardChoosingOptionBox">
                    `

            html += `
                    <div id='left' class="cardChoosingOptionSide">
                        <img id='cardChoosingLeftImg' ${num_stim === 1 ? `style='visibility: hidden'` : ``} src=${this.contingency.img[0]}></img> 
                    </div>

                    `;

            if (num_stim === 2) {
                html += `<div class="cardChoosingHelperTxt2">
                            <p id="centerTxt">?</p>
                        </div>
                        `;
            } else{

                html += `<div id='middle' class="cardChoosingOptionSide">
                            <img id='cardChoosingMiddleImg' src=${this.contingency.img[2]}></img>
                        </div>
                        `;
            }

            html += `
                    <div id='right' class="cardChoosingOptionSide">
                        <img id='cardChoosingRightImg' ${num_stim === 1 ? `style='visibility: hidden'` : ``} src=${this.contingency.img[1]}></img>
                    </div>
            `;

            html += `</div>`

            if (num_stim !== 2) {
                html += `<div class="cardChoosingHelperTxt3">
                            <p id="below">${num_stim === 1 ? `<span class="spacebar-icon" id="left_key">&nbsp;←&nbsp;</span>&nbsp;&nbsp;&nbsp;<span class="spacebar-icon" id="middle_key">&nbsp;↑&nbsp;</span>&nbsp;&nbsp;&nbsp;<span class="spacebar-icon" id="right_key">&nbsp;→&nbsp;</span>` : "&zwnj;"}</p>
                </div>
                `
            }
            return html
        }
    }
    cardChoosingPlugin.info = info;

    return cardChoosingPlugin;
})(jsPsychModule);



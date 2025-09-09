// Written by Haoyang Luo 2025
// Version 1.3.0: Removed use of global variables, Yaniv Abir 2025

var jsPsychExploreShipFeedback = (function (jspsych) {
  "use strict";

  const info = {
    name: "explore-ship-feedback",
    version: "1.3.0",
    parameters: {
      feedback_duration: {
        type: jspsych.ParameterType.INT,
        default: 3000,
        description: "Duration to show feedback (ms)"
      },
      base_rule: {
        type: jspsych.ParameterType.OBJECT,
        default: {},
        description: "Island transitions rule mapping for base rule"
      },
      control_rule: {
        type: jspsych.ParameterType.OBJECT,
        default: {},
        description: "Island transitions rule mapping for control rule"
      },
      effort_threshold: {
        type: jspsych.ParameterType.ARRAY,
        default: [6, 12, 18],
        description: "Effort thresholds by current strength"
      },
      scale: {
        type: jspsych.ParameterType.FLOAT,
        default: 2,
        description: "Scaling factor for effort to probability conversion"
      },
      post_trial_gap: {
        type: jspsych.ParameterType.INT,
        default: 0,
        description: "Gap between trials (ms)"
      },
      // Image paths
      general_image_path: {
        type: jspsych.ParameterType.STRING,
        default: "./assets/images/control/",
        description: "Base path for control images"
      },
      island_path: {
        type: jspsych.ParameterType.STRING,
        default: "./assets/images/control/session-specific/wk0",
        description: "Path for island images"
      }

    },
    data: {
      trialphase: {
        type: jspsych.ParameterType.STRING,
        default: "control_explore_feedback"
      },
      destination_island: {
        type: jspsych.ParameterType.STRING
      },
      control_rule_used: {
        type: jspsych.ParameterType.STRING
      },
      ship_color: {
        type: jspsych.ParameterType.STRING
      },
      probability_control: {
        type: jspsych.ParameterType.FLOAT
      }
    }
  };

  class ExploreShipFeedbackPlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }

    sigmoid(x) {
      return 1 / (1 + Math.exp(-x));
    }

    chooseControlRule(effort, current, trial) {
      const extra_effort = (effort - trial.effort_threshold[current - 1]) * trial.scale;
      const prob = this.sigmoid(extra_effort);
      return Math.random() < prob ? 'control' : 'base';
    }

    generateFeedbackHTML(trial, choice, chosenColor, destinationIsland, matchBaseRule) {
      // Invert the choice for feedback display
      const feedbackChoice = choice === 'left' ? 'right' : 'left';
      const islandSide = feedbackChoice === 'left' ? 'right' : 'left';
      
      if (matchBaseRule) {
        return `
          <main class="main-stage">
            <img class="background" src="${trial.general_image_path}/ocean.png" alt="Background"/>
            <section class="scene">
              <div class="icon-row" style="position: absolute; display: flex; align-items: center; top: 0%;">
                  <img src="${trial.general_image_path}/icon-explore.png" alt="Learning" style="width: 40px; height: 40px; margin-right: 15px;"><p style="text-align: left; color: #0F52BA;">Learning</p>
              </div>
              <img class="island-far" src="${trial.island_path}/simple_island_${destinationIsland}.png" alt="Farther island" />
              <img class="feedback-ship" src="${trial.general_image_path}/simple_ship_${chosenColor}.png" alt="Ship" style="opacity: 0;" />
            </section>
          </main>
        `;
      } else {
        return `
          <main class="main-stage">
            <img class="background" src="${trial.general_image_path}/ocean.png" alt="Background"/>
            <section class="scene">
              <div class="overlap-group" style="justify-content: space-between;">
                <div class="choice-left">
                  ${feedbackChoice === 'left' ? 
                    `<img class="ship-${feedbackChoice}" src="${trial.general_image_path}/simple_ship_${chosenColor}.png" alt="Ship" style="opacity: 0;" />` : ''}
                  ${islandSide === 'left' ? `<img class="island-near" src="${trial.island_path}/simple_island_${destinationIsland}.png" alt="Destination island" style="top: -10%;" />` : ''}
                </div>
                <img class="island-near" style="visibility: hidden;" src="${trial.general_image_path}/simple_island.png" alt="Hidden island" />
                <div class="choice-right">
                  ${feedbackChoice === 'right' ? 
                    `<img class="ship-${feedbackChoice}" src="${trial.general_image_path}/simple_ship_${chosenColor}.png" alt="Ship" style="opacity: 0;" />` : ''}
                  ${islandSide === 'right' ? `<img class="island-near" src="${trial.island_path}/simple_island_${destinationIsland}.png" alt="Destination island" style="top: -10%;" />` : ''}
                </div>
              </div>
            </section>
          </main>
        `;
      }
    }

    generateOceanCurrentsHTML(level, choice, matchBaseRule) {
      // Invert the choice for feedback display
      const feedbackChoice = choice === 'left' ? 'right' : 'left';

      // Helper function to create current lines based on level and direction
      const createCurrentLines = (matchBaseRule = true, isTrace = false, isLeft = true) => {
        let lines = '';
        if (matchBaseRule) {
          // Generate positions based on level
          const positions = {
            1: [{ top: 49, offset: 20 }],
            2: [
              { top: 43, offset: 50 },
              { top: 55, offset: 30 }
            ],
            3: [
              { top: 43, offset: 50 },
              { top: 49, offset: 20 },
              { top: 55, offset: 30 }
            ]
          };
          
          const currentPositions = positions[level] || positions[3];

          currentPositions.forEach(({ top, offset }) => {
            const position = isLeft ? 'right' : 'left';
            const styles = `top: ${top}%; ${position}: calc(5% + ${offset}px);`;

            if (isTrace) {
              lines += `<div class="current-trace" style="${styles};"></div>`;
            } else {
              lines += `<div class="current-line" style="${styles};"></div>`;
            }
          });
        } else {
          const positions = {
            1: [{ top: 80, offset: 20 }],
            2: [
              { top: 70, offset: 50 },
              { top: 90, offset: 30 }
            ],
            3: [
              { top: 70, offset: 50 },
              { top: 80, offset: 20 },
              { top: 90, offset: 30 }
            ]
          };
  
          const currentPositions = positions[level] || positions[3];
  
          currentPositions.forEach(({ top, offset }) => {
            const position = isLeft ? 'right' : 'left';
            const styles = `top: ${top}%; ${position}: calc(15% + ${offset}px);`;
  
            if (isTrace) {
              lines += `<div class="current-trace" style="${styles}; width: 70%"></div>`;
            } else {
              lines += `<div class="current-line" style="${styles}; width: 75%"></div>`;
            }
          });
        }

        return lines;
      };

      if (matchBaseRule) {
        return `
          <div class="ocean-current">
            <div class="current-group left-currents">
              ${createCurrentLines(true, true, true)}
              ${createCurrentLines(true, false, true)}
            </div>
            <div class="current-group right-currents">
              ${createCurrentLines(true, true, false)}
              ${createCurrentLines(true, false, false)}
            </div>
          </div>
        `;
      } else {
        return `
          <div class="ocean-current">
            <div class="current-group ${feedbackChoice}-horizon-currents">
            ${createCurrentLines(false, true, feedbackChoice === 'left')}
            ${createCurrentLines(false, false, feedbackChoice === 'left')}
          </div>
        `;
      }
    }

    createShipAnimation(display_element, choice, matchBaseRule) {
      // Invert the choice for feedback display
      const feedbackChoice = choice === 'left' ? 'right' : 'left';
      const islandSide = feedbackChoice === 'left' ? 'right' : 'left';

      // Get ship and island elements
      const shipImg = matchBaseRule ? display_element.querySelector(`.feedback-ship`) : display_element.querySelector(`.ship-${feedbackChoice}`);
      const islandImg = matchBaseRule ? display_element.querySelector(`.island-far`) : display_element.querySelector(`.choice-${islandSide} .island-near`);
      
      if (!shipImg || !islandImg) return;
      
      // Calculate the distance to move the ship
      const distance = matchBaseRule ? islandImg.offsetWidth/2 + shipImg.offsetWidth : islandImg.offsetWidth + shipImg.offsetWidth / 4;
      
      // Determine if ship should be flipped based on which side it starts from
      const shouldFlip = (feedbackChoice === 'left' && !matchBaseRule) || (feedbackChoice === 'right' && matchBaseRule);
      const scaleX = shouldFlip ? '-1' : '1';
      
      // Create the animation style
      const animationStyle = document.createElement('style');
      animationStyle.setAttribute('data-feedback-animation', 'true');
      
      // Define the animation with the calculated distance
      animationStyle.textContent = matchBaseRule ?`
        @keyframes moveShip {
          0% { 
            opacity: 0;
            transform: scaleX(${scaleX}) translateX(${distance}px) translateY(${shipImg.offsetHeight/2}px);
          }
          100% { 
            opacity: 1;
            transform: scaleX(${scaleX * 0.9}) scaleY(0.9) translateX(${shipImg.offsetWidth/3 + islandImg.offsetWidth/2}px);
          }
        }
        
        .ship-animate {
          animation: moveShip 600ms ease-out forwards;
        }
      ` : `
        @keyframes moveShip {
          0% { 
            opacity: 0;
            transform: scaleX(${scaleX}) translateX(0);
          }
          100% { 
            opacity: 1;
            transform: scaleX(${scaleX}) translateX(-${distance}px);
          }
        }
        
        .ship-animate {
          animation: moveShip 600ms ease-out forwards;
        }
      `;
      
      document.head.appendChild(animationStyle);
      
      // Apply the animation class
      shipImg.classList.add('ship-animate');
    }

    trial(display_element, trial) {
      // Get data from previous trial
      const lastTrial = this.jsPsych.data.getLastTrialData().values()[0];
      const choice = lastTrial.response; // 'left' or 'right'
      const chosenColor = this.jsPsych.evaluateTimelineVariable(choice);
      const nearIsland = this.jsPsych.evaluateTimelineVariable('near');
      const currentStrength = this.jsPsych.evaluateTimelineVariable('current');
      const effortLevel = lastTrial.trial_presses;

      // Determine destination island based on control rule
      const currentRule = this.chooseControlRule(
        effortLevel,
        currentStrength,
        trial
      );

      const destinationIsland = currentRule === 'base'
        ? trial.base_rule[nearIsland]
        : trial.control_rule[chosenColor];

      // Clean up any existing animation styles
      const oldStyles = document.querySelectorAll('style[data-feedback-animation]');
      oldStyles.forEach(style => style.remove());

      // Match base rule island
      const matchBaseRule = currentRule === 'base';
      
      // Generate feedback display
      display_element.innerHTML = this.generateFeedbackHTML(trial, choice, chosenColor, destinationIsland, matchBaseRule);

      // Add ocean currents only if using base rule
      // But this way also allows flexibility for future changes
      display_element.querySelector('.scene').insertAdjacentHTML(
        'beforeend', 
        this.generateOceanCurrentsHTML(currentStrength, choice, matchBaseRule)
      );
      if (!matchBaseRule) {
        display_element.querySelector(".ocean-current").style.visibility = "hidden";
      }

      // Create dynamic ship animation after DOM is ready
      setTimeout(() => {
        this.createShipAnimation(display_element, choice, matchBaseRule);
      }, 100);

      // Save data and end trial after duration
      const trial_data = {
        trialphase: "control_explore_feedback",
        destination_island: destinationIsland,
        control_rule_used: currentRule,
        ship_color: chosenColor,
        probability_control: this.sigmoid((effortLevel - trial.effort_threshold[currentStrength - 1]) * trial.scale)
      };

      this.jsPsych.pluginAPI.setTimeout(() => {
        display_element.innerHTML = '';
        this.jsPsych.finishTrial(trial_data);
      }, trial.feedback_duration);
    }

    // Simulation function
    simulate(trial, simulation_mode, simulation_options, load_callback) {
      if (simulation_mode == "data-only") {
        load_callback();
        this.simulate_data_only(trial, simulation_options);
      }
      if (simulation_mode == "visual") {
        this.simulate_visual(trial, simulation_options, load_callback);
      }
    }

    create_simulation_data(trial, simulation_options) {
      // Get data from previous trial
      const lastTrial = this.jsPsych.data.getLastTrialData().values()[0];
      const choice = lastTrial.response; // 'left' or 'right'
      const chosenColor = this.jsPsych.evaluateTimelineVariable(choice);
      const nearIsland = this.jsPsych.evaluateTimelineVariable('near');
      const currentStrength = this.jsPsych.evaluateTimelineVariable('current');
      const effortLevel = lastTrial.trial_presses;

      // Determine destination island based on control rule
      const currentRule = this.chooseControlRule(
        effortLevel,
        currentStrength,
        trial
      );

      const destinationIsland = currentRule === 'base'
        ? trial.base_rule[nearIsland]
        : trial.control_rule[chosenColor];

      const default_data = {
        trialphase: "control_explore_feedback",
        destination_island: destinationIsland,
        control_rule_used: currentRule,
        ship_color: chosenColor,
        probability_control: this.sigmoid((effortLevel - trial.effort_threshold[currentStrength - 1]) * trial.scale)
      };

      const data = this.jsPsych.pluginAPI.mergeSimulationData(default_data, simulation_options);
      this.jsPsych.pluginAPI.ensureSimulationDataConsistency(trial, data);
      return data;
    }

    simulate_data_only(trial, simulation_options) {
      const data = this.create_simulation_data(trial, simulation_options);
      this.jsPsych.finishTrial(data);
    }

    simulate_visual(trial, simulation_options, load_callback) {
      const data = this.create_simulation_data(trial, simulation_options);
      const display_element = this.jsPsych.getDisplayElement();

      // Faster visual simulation
      if (simulation_options.speed_up) {
        trial.feedback_duration = trial.feedback_duration / simulation_options.speed_up_factor;
        trial.post_trial_gap = trial.post_trial_gap / simulation_options.speed_up_factor;
      }

      this.trial(display_element, trial);
      load_callback();
    }
  }

  ExploreShipFeedbackPlugin.info = info;

  return ExploreShipFeedbackPlugin;
})(jsPsychModule);
// Written by Haoyang Luo 2025
// Version 1.2.0: Removed use of global variables, Yaniv Abir 2025

var jsPsychRewardShip = (function (jspsych) {
  "use strict";

  const info = {
    name: "reward-ship",
    version: "1.2.0",
    parameters: {
      target: {
        type: jspsych.ParameterType.STRING,
        default: undefined,
        description: "Target island for delivery"
      },
      near: {
        type: jspsych.ParameterType.STRING,
        default: undefined,
        description: "Type of the near island"
      },
      left: {
        type: jspsych.ParameterType.STRING,
        default: undefined,
        description: "Color/type of the left ship"
      },
      right: {
        type: jspsych.ParameterType.STRING,
        default: undefined,
        description: "Color/type of the right ship"
      },
      current: {
        type: jspsych.ParameterType.INT,
        default: 1,
        description: "Strength of ocean current (1-3)"
      },
      reward_decision: {
        type: jspsych.ParameterType.INT,
        default: 4000,
        description: "Time allowed for initial ship selection (ms)"
      },
      reward_effort: {
        type: jspsych.ParameterType.INT,
        default: 3000,
        description: "Time allowed for effort input after selection (ms)"
      },
      reward_amount: {
        type: jspsych.ParameterType.STRING,
        default: "",
        description: "Amount of reward in currency shown in the quest scroll"
      },
      reward_number: {
        type: jspsych.ParameterType.FLOAT,
        default: 0,
        description: "Amount of reward in number shown in the quest scroll"
      },
      choices: {
        type: jspsych.ParameterType.KEYS,
        default: ["ArrowLeft", "ArrowRight"]
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
        default: 300,
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
        default: "control_reward"
      },
      response: {
        type: jspsych.ParameterType.STRING
      },
      rt: {
        type: jspsych.ParameterType.INT
      },
      correct: {
        type: jspsych.ParameterType.BOOL
      },
      reward: {
        type: jspsych.ParameterType.FLOAT
      },
      responseTime: {
        type: jspsych.ParameterType.INT,
        array: true
      },
      trial_presses: {
        type: jspsych.ParameterType.INT
      }
    }
  };

  class RewardShipPlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }

    sigmoid(x) {
      return 1 / (1 + Math.exp(-x));
    }

    chooseControlRule(trial, effort, current) {
      const extra_effort = (effort - trial.effort_threshold[current - 1]) * trial.scale;
      const prob = this.sigmoid(extra_effort);
      return Math.random() < prob ? 'control' : 'base';
    }

    trial(display_element, trial) {
      // Initialize trial variables
      let selectedKey = null;
      let lastPressTime = 0;
      let trial_presses = 0;
      let responseTime = [];
      let choice = null;
      let choice_rt = 0;

      // Generate trial HTML
      const generateHTML = () => {
        const far = trial.base_rule[trial.near];
        return `
          <main class="main-stage">
            <img class="background" src="${trial.general_image_path}/ocean.png" alt="Background"/>
            <section class="scene">
              <img class="island-far" style="visibility: hidden;" src="${trial.island_path}/simple_island_${far}.png" alt="Farther island" />
              <div class="quest-scroll">
                <p style="position: absolute;z-index: 4;top: 1%;font-size: 2.5vh;color: maroon;margin-top: 0px;margin-bottom: 0px;font-weight: 600;">Target Island</p>
                <img class="quest-scroll-img" src="${trial.general_image_path}/scroll.png" alt="Quest scroll">
                <img class="island-target glowing-border" src="${trial.island_path}/simple_island_${trial.target}.png" alt="Target island">
                <div class="quest-reward" style="position: absolute;display: inline-flex;z-index: 4;top: 72%;flex-direction: row;align-items: center;background-color: #eedfbc;border-radius: 10px;">
                  <p style="font-size: 2.5vh;color: maroon;margin-top: 0px;margin-bottom: 0px;margin-left: 10px;font-weight: 500;"><strong>${trial.reward_amount}</strong></p>
                  <img src="${trial.general_image_path}/${trial.reward_amount === "£2" ? `200p.png`: `50pence.png`}" style="height:5em;margin: 10px;">
                </div>
              </div>
              <div class="overlap-group">
                <div class="choice-left">
                  <div class="fuel-container-left">
                    <div class="fuel-indicator-container">
                      <div class="fuel-indicator-bar"></div>
                    </div>
                  </div>
                  <img class="ship-left" src="${trial.general_image_path}/simple_ship_${trial.left}.png" alt="Left ship" />
                  <img class="arrow-left" src="${trial.general_image_path}/left.png" alt="Left arrow" />
                </div>
                <img class="island-near" style="visibility: visible;" src="${trial.general_image_path}/simple_island.png" alt="Nearer island" />
                <div class="choice-right">
                  <div class="fuel-container-right">
                    <div class="fuel-indicator-container">
                      <div class="fuel-indicator-bar"></div>
                    </div>
                  </div>
                  <img class="ship-right" src="${trial.general_image_path}/simple_ship_${trial.right}.png" alt="Right ship" />
                  <img class="arrow-right" src="${trial.general_image_path}/left.png" alt="Right arrow" />
                </div>
              </div>
              ${this.generateOceanCurrentsHTML(trial.current)}
            </section>
          </main>
        `;
      };

      
      display_element.innerHTML = generateHTML();

      // Function to create and animate fuel icons
      const createFuelIcon = (container) => {
        const fuelIcon = document.createElement('img');
        fuelIcon.src = `${trial.general_image_path}/fuel.png`;
        fuelIcon.className = 'fuel-icon fuel-animation';
        container.appendChild(fuelIcon);

        fuelIcon.addEventListener('animationend', () => {
          container.removeChild(fuelIcon);
        });
      };

      // Handle initial ship selection
      const handleKeypress = (info) => {
        if (!selectedKey) {

          this.jsPsych.pluginAPI.cancelKeyboardResponse(firstKey_listener);
          if (info.key === 'ArrowLeft') {
            selectedKey = 'left';
            document.querySelector('.arrow-left').classList.add('highlight');
            document.querySelector('.choice-right').style.visibility = 'hidden';
          } else if (info.key === 'ArrowRight') {
            selectedKey = 'right';
            document.querySelector('.arrow-right').classList.add('highlight');
            document.querySelector('.choice-left').style.visibility = 'hidden';
          }
          this.jsPsych.pluginAPI.setTimeout(() => {
            if (selectedKey === 'left') {
              document.querySelector('.fuel-container-left .fuel-indicator-container').style.opacity = '1';
              setupRepeatedKeypress('ArrowLeft');
            } else if (selectedKey === 'right') {
              document.querySelector('.fuel-container-right .fuel-indicator-container').style.opacity = '1';
              setupRepeatedKeypress('ArrowRight');
            }
            document.querySelector('.island-near').style.visibility = 'visible';
            document.querySelector('.island-far').style.visibility = 'visible';
            document.querySelector('.ocean-current').style.visibility = 'visible';
          }, 100);

          choice = selectedKey;
          choice_rt = info.rt;

          // Start effort phase timer
          this.jsPsych.pluginAPI.setTimeout(() => {
            // Cancel all keyboard responses
            this.jsPsych.pluginAPI.cancelAllKeyboardResponses();
            
            // Apply fade-out animation to the selected ship
            if (selectedKey === 'left') {
              display_element.querySelector('.ship-left').classList.add('fade-out-left');
            } else if (selectedKey === 'right') {
              display_element.querySelector('.ship-right').classList.add('fade-out-right');
            }

            // End trial after animation completes
            this.jsPsych.pluginAPI.setTimeout(() => {
              endTrial();
            }, 350);
          }, trial.reward_effort + 100); // Adding 100ms to ensure smooth transition and animation completion
        }
      };

      // Handle repeated keypresses for effort
      const handleRepeatedKeypress = (info) => {
        trial_presses++;
        responseTime.push(info.rt - lastPressTime);
        lastPressTime = info.rt;

        const container = selectedKey === 'left' ? 
          document.querySelector('.fuel-container-left') :
          document.querySelector('.fuel-container-right');
        
        createFuelIcon(container);

        const fuelBar = container.querySelector('.fuel-indicator-bar');
        const progress = Math.min((trial_presses / 30) * 100, 100);
        fuelBar.style.width = `${progress}%`;

        if (progress === 100) {
          fuelBar.style.backgroundColor = '#00ff00';
        }
      };

      // Setup repeated keypress listener
      const setupRepeatedKeypress = (key) => {
        this.jsPsych.pluginAPI.getKeyboardResponse({
          callback_function: handleRepeatedKeypress,
          valid_responses: [key],
          rt_method: 'performance',
          persist: true,
          allow_held_key: false,
          minimum_valid_rt: 0
        });
      };

      // Initial keyboard listener
      const firstKey_listener = this.jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: handleKeypress,
        valid_responses: ['ArrowLeft', 'ArrowRight'],
        rt_method: 'performance',
        persist: false,
        allow_held_key: false,
        minimum_valid_rt: 100
      });

      // Start decision phase timer
      this.jsPsych.pluginAPI.setTimeout(() => {
        if (!selectedKey) {
          endTrial();
        }
      }, trial.reward_decision);

      const endTrial = () => {
        // Kill keyboard listeners
        this.jsPsych.pluginAPI.cancelAllKeyboardResponses();

        // Determine destination island based on control rule
        const currentRule = this.chooseControlRule(
          trial,
          trial_presses, 
          trial.current
        );

        const destinationIsland = currentRule === 'base' 
          ? trial.base_rule[trial.near]
          : trial.control_rule[choice === "left" ? trial.left : trial.right];

        const correct = trial.target === destinationIsland;
        const reward = correct ? trial.reward_number : 0;

        // Save data
        const trial_data = {
          trialphase: "control_reward",
          response: choice,
          rt: choice_rt,
          correct: correct,
          reward: reward,
          responseTime: responseTime,
          trial_presses: trial_presses,
        };

        // Clear display
        display_element.innerHTML = '';

        // End trial
        this.jsPsych.finishTrial(trial_data);
      };
    }

    generateOceanCurrentsHTML(level) {
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
      
      // Generate the HTML for currents
      let leftTraces = '', leftLines = '', rightTraces = '', rightLines = '';
      
      currentPositions.forEach(({ top, offset }) => {
        leftTraces += `<div class="current-trace" style="top: ${top}%; right: calc(5% + ${offset}px);"></div>`;
        leftLines += `<div class="current-line" style="top: ${top}%; right: calc(5% + ${offset}px);"></div>`;
        
        rightTraces += `<div class="current-trace" style="top: ${top}%; left: calc(5% + ${offset}px);"></div>`;
        rightLines += `<div class="current-line" style="top: ${top}%; left: calc(5% + ${offset}px);"></div>`;
      });
      
      return `
        <div class="ocean-current" style="visibility: hidden;">
          <div class="current-group left-currents">
            ${leftTraces}
            ${leftLines}
          </div>
          <div class="current-group right-currents">
            ${rightTraces}
            ${rightLines}
          </div>
        </div>
      `;
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
      const keyToChoice = {"ArrowLeft": "left", "ArrowRight": "right"};
      const trial_presses = this.jsPsych.randomization.randomInt(2, 20);

      // Simulate choice data and outcomes
      const choice = keyToChoice[this.jsPsych.pluginAPI.getValidKey(trial.choices)];

      // Determine destination island based on control rule
      const currentRule = this.chooseControlRule(
        trial,
        trial_presses, 
        trial.current
      );

      const destinationIsland = currentRule === 'base' 
        ? trial.base_rule[trial.near]
        : trial.control_rule[choice === "left" ? trial.left : trial.right];

      const correct = trial.target === destinationIsland;
      const reward = correct ? trial.reward_number : 0;


      const default_data = {
        trialphase: "control_reward",
        response: choice,
        rt: Math.floor(this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true)),
        correct: correct,
        reward: reward,
        responseTime: Array.from({ length: trial_presses }, () => Math.floor(this.jsPsych.randomization.sampleExGaussian(100, 10, 0.5, true))),
        trial_presses: trial_presses,
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
      const choiceToKey = {"left": "ArrowLeft", "right": "ArrowRight"};
      const data = this.create_simulation_data(trial, simulation_options);
      const display_element = this.jsPsych.getDisplayElement();
      
      // Faster visual simulation
      if (simulation_options.speed_up) {
        trial.reward_decision = trial.reward_decision / simulation_options.speed_up_factor;
        trial.reward_effort = trial.reward_effort / simulation_options.speed_up_factor; 
        trial.post_trial_gap = trial.post_trial_gap / simulation_options.speed_up_factor;
      }
      
      this.trial(display_element, trial);
      load_callback();

      if (data.rt!== null) {
        let t = data.rt;
        this.jsPsych.pluginAPI.pressKey(choiceToKey[data.response], t);
        data.responseTime.forEach((rt, i) => {
          t += rt;
          this.jsPsych.pluginAPI.pressKey(choiceToKey[data.response], t);
        });
      }
    }
  }

  RewardShipPlugin.info = info;

  return RewardShipPlugin;
})(jsPsychModule);

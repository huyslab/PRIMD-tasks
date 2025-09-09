// Written by Haoyang Luo 2025
// Version 1.1.0: Removed use of global variables, Yaniv Abir 2025

var jsPsychRewardPrompt = (function (jspsych) {
  "use strict";

  const info = {
    name: "reward-prompt",
    version: "1.1.0",
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
      reward_amount: {
        type: jspsych.ParameterType.STRING,
        default: "",
        description: "Amount of reward shown in the quest scroll"
      },
      choices: {
        type: jspsych.ParameterType.KEYS,
        default: ["ArrowLeft", "ArrowRight"]
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
      rt: {
        type: jspsych.ParameterType.INT
      },
      trialphase: {
        type: jspsych.ParameterType.STRING,
        default: "control_reward_prompt"
      }
    }
  };

  class RewardPromptShipPlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }

    trial(display_element, trial) {
      // Initialize trial variables
      const startTime = performance.now();

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
            <div class="instruction-dialog" style="bottom:20%; width: 50%; min-width: 400px;">
                <div class="instruction-content" style="font-size: 1.25em; text-align: center;">
                </div>
            </div>
          </main>
        `;
      };

      
      display_element.innerHTML = generateHTML();

      const end_trial = () => {
        if (typeof lastKeyListener !== "undefined") {
          this.jsPsych.pluginAPI.cancelKeyboardResponse(lastKeyListener);
        }
        var trial_data = {
          rt: performance.now() - startTime,
          trialphase: "control_reward_prompt"
        };
        this.jsPsych.finishTrial(trial_data);
      };

      // var lastKeyListener = this.jsPsych.pluginAPI.getKeyboardResponse({
      //   callback_function: end_trial,
      //   valid_responses: trial.choices,
      //   rt_method: "performance",
      //   persist: false,
      //   allow_held_key: false
      // });

      // Change the instruction dialog text
      const instructionContent = display_element.querySelector('.instruction-content');

      if (trial.choices !== "NO_KEYS") {
        const pages = [
          {
            html: `
              <p>From now on, we will give you a <strong>target fruit island</strong></p>
              <p><strong>If you manage to reach it</strong>, you can earn the coin as a bonus<br>At the end of the game, you’ll earn a proportion of the total coins collected</p>
              <p>Use what you learned about home fruit islands and ocean currents</p>
              <p><strong>When you are ready, press <span class="spacebar-icon">&nbsp;→&nbsp;</span> to continue</strong></p>
            `,
            showExtra: false
          }
        ];
      
        const showElements = (yes) => {
          ['island-far','ocean-current']
            .forEach(sel => document.querySelector(`.${sel}`).style.visibility = yes ? 'visible' : 'hidden');
        };

        // navigation: allow left/right arrows to move back and forth
        let idx = 0;
        const renderPage = () => {
          instructionContent.innerHTML = pages[idx].html;
          showElements(pages[idx].showExtra);
        };
        const handleKey = (info) => {
          if (info.key === trial.choices[1]) {
            idx++;
          } else if (info.key === trial.choices[0]) {
            idx = Math.max(0, idx - 1);
          }
          if (idx >= pages.length) {
            end_trial();
          } else {
            renderPage();
            this.jsPsych.pluginAPI.getKeyboardResponse({
              callback_function: handleKey,
              valid_responses: trial.choices,
              rt_method: "performance",
              persist: false,
              allow_held_key: false
            });
          }
        };
        // start navigation
        renderPage();
        this.jsPsych.pluginAPI.getKeyboardResponse({
          callback_function: handleKey,
          valid_responses: trial.choices,
          rt_method: "performance",
          persist: false,
          allow_held_key: false,
          minimum_valid_rt: 1000
        });
      }

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
      const default_data = {
        trialphase: "control_reward_prompt",
        response: this.jsPsych.pluginAPI.getValidKey(["ArrowRight"]),
        rt: this.jsPsych.randomization.randomInt(1100, 1200)
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
        trial.reward_decision = trial.reward_decision / simulation_options.speed_up_factor;
        trial.reward_effort = trial.reward_effort / simulation_options.speed_up_factor; 
        trial.post_trial_gap = trial.post_trial_gap / simulation_options.speed_up_factor;
      }
      
      this.trial(display_element, trial);
      load_callback();

      if (data.rt !== null) {
        // It works with the current setup for the plugin, since there's only one instruction page so one keypress to end the trial
        // But if there are multiple pages, it's better to simulate multiple keypresses based on the number of pages
        this.jsPsych.pluginAPI.pressKey(data.response, data.rt);
      }
    }
  }

  RewardPromptShipPlugin.info = info;

  return RewardPromptShipPlugin;
})(jsPsychModule);

// Written by Haoyang Luo 2025
// Version 1.1.1: Removed use of global variables, Yaniv Abir 2025

var jsPsychPredictHomeBase = (function (jspsych) {
  "use strict";

  const info = {
    name: "predict-home-base",
    version: "1.1.1",
    parameters: {
      ship: {
        type: jspsych.ParameterType.STRING,
        default: undefined,
        description: "Color/type of the ship to predict"
      },
      predict_decision: {
        type: jspsych.ParameterType.INT,
        default: 6000,
        description: "Time allowed for prediction (ms)"
      },
      predict_choice: {
        type: jspsych.ParameterType.INT,
        default: 300,
        description: "Delay after choice before ending trial (ms)"
      },
      choices : {
        type: jspsych.ParameterType.STRING,
        default: ["i2", "i3", "i4", "i1"],
        array: true,
        description: "Island choices",
      },
      button_html: {
        type: jspsych.ParameterType.FUNCTION,
        default: function(choice, trial) {
          return `<button class="destination-button"><img src="${trial.island_path}/island_icon_${choice}.png" style="width:100px;"></button>`;
        }
      },
      control_rule: {
        type: jspsych.ParameterType.OBJECT,
        default: {},
        description: "Island transitions rule mapping for control rule"
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
        default: "control_predict_homebase"
      },
      response: {
        type: jspsych.ParameterType.STRING
      },
      rt: {
        type: jspsych.ParameterType.INT
      },
      correct: {
        type: jspsych.ParameterType.BOOL
      }
    }
  };

  class PredictHomeBasePlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }

    trial(display_element, trial) {
      // Initialize response tracking
      var response = {
        rt: null,
        button: null
      };

      // Generate trial HTML
      const html = `
        <div class="instruction-stage" style="transform: unset;">
          <img class="background" style="top: -5vh;" src="${trial.general_image_path}/ocean.png" alt="Background"/>
          <section class="scene">
            <div class="overlap-group">
              <div class="choice-left">
                <img class="island-near" src="${trial.general_image_path}/simple_island.png" style="visibility:hidden;" alt="Nearer island" />
                <img class="ship-left" src="${trial.general_image_path}/simple_ship_${trial.ship}.png" style="top:-10%" alt="Prediction ship" />
              </div>
            </div>
          </section>
        </div>
        <p style="position: relative; top: -5vh;"><strong><span class="highlight-txt">Please use the mouse and click on the home fruit island for the ship above.</span></strong></p>
        <div class="island-choices">
        </div>
        <div class="icon-row" style="position: absolute; display: flex; align-items: center; top: 0%; transform: translateX(-50%); left: 50%;">
            <img src="${trial.general_image_path}/icon-predict.png" alt="Test" style="width: 40px; height: 40px; margin-right: 15px;"><p style="text-align: left; color: #0F52BA;">Test</p>
        </div>
      `;

      display_element.innerHTML = html;

      const buttonGroupElement = document.querySelector(".island-choices");
      for (const [choiceIndex, choice] of trial.choices.entries()) {
        buttonGroupElement.insertAdjacentHTML("beforeend", trial.button_html(choice, trial));
        const buttonElement = buttonGroupElement.lastChild;
        buttonElement.dataset.choice = choiceIndex.toString();
        buttonElement.addEventListener("click", () => {
          after_response(choiceIndex);
          // End trial after delay
          this.jsPsych.pluginAPI.setTimeout(end_trial, trial.predict_choice);
        });
      }

      var start_time = performance.now();

      function after_response(choice) {
        var end_time = performance.now();
        var rt = Math.round(end_time - start_time);
        response.button = parseInt(choice);
        response.rt = rt;
        const stimulusElement = display_element.querySelector(".instruction-stage");
        stimulusElement.classList.add("responded");
        for (const button of buttonGroupElement.children) {
          button.setAttribute("disabled", "disabled");
        }
        const button = display_element.querySelector(`.destination-button[data-choice="${choice}"]`);
        if (button) {
          button.style.borderColor = "#f4ce5c";
        }
      }

      // End trial if no response after timeout
      if (trial.predict_decision !== null) {
        this.jsPsych.pluginAPI.setTimeout(() => {
          if (!response.choice) end_trial();
        }, trial.predict_decision);
      }

      const end_trial = () => {
        // Save data
        const trial_data = {
          trialphase: "control_predict_homebase",
          rt: response.rt,
          response: response.button,
          button: trial.choices[response.button],
          correct: trial.control_rule[trial.ship] === trial.choices[response.button]
        };

        // Clear display
        display_element.innerHTML = '';

        // End trial
        this.jsPsych.finishTrial(trial_data);
      };
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
      let button = this.jsPsych.randomization.randomInt(0, trial.choices.length - 1);
      const default_data = {
        trialphase: "control_predict_homebase",
        response: button,
        rt: Math.floor(this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true)),
        correct: trial.control_rule[trial.ship] === trial.choices[button]
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
        trial.predict_decision = trial.predict_decision / simulation_options.speed_up_factor;
        trial.predict_choice = trial.predict_choice / simulation_options.speed_up_factor;
        trial.post_trial_gap = trial.post_trial_gap / simulation_options.speed_up_factor;
      }

      this.trial(display_element, trial);
      load_callback();

      if (data.rt !== null) {
        this.jsPsych.pluginAPI.clickTarget(
          display_element.querySelector(
            `.island-choices [data-choice="${data.response}"]`
          ),
          data.rt
        );
      }
    }
  }

  PredictHomeBasePlugin.info = info;

  return PredictHomeBasePlugin;
})(jsPsychModule);

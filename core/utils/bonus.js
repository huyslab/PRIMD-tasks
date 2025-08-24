/**
 * Bonus calculation utilities for experimental tasks
 * Handles bonus computation and payment tracking across different experimental modules
 */

import { postToParent } from "./data_handling.js";

/**
 * Retrieves task-specific bonus data based on the task type
 * @param {string} task - The task identifier ("pilt-to-test", "reversal", "wm", "control", "vigour", "pit")
 * @returns {Object} Object with earned, min, and max bonus values
 */
function getTaskBonusData(task) {
    switch (task) {
        case "pilt-to-test":
            // Combined PILT and vigour/PIT bonus for main experimental condition
            const pilt_bonus = computeRelativePILTBonus();
            const vigour_pit_bonus = computeRelativeVigourPITBonus();
            return {
                earned: pilt_bonus["earned"] + vigour_pit_bonus["earned"],
                min: pilt_bonus["min"] + vigour_pit_bonus["min"],
                max: pilt_bonus["max"] + vigour_pit_bonus["max"]
            };
        case "reversal":
            return computeRelativeReversalBonus();
        case "wm":
            return computeRelativePILTBonus();
        case "control":
            return computeRelativeControlBonus();
        case "vigour": // only for testing vigour module
            return computeRelativeVigourPITBonus();
        case "pit": // only for testing pit module
            return computeRelativeVigourPITBonus();
        default:
            return { earned: 0, min: 0, max: 0 };
    }
}

/**
 * Rounds a numeric value to a specified number of decimal places
 * @param {number} value - The number to round
 * @param {number} digits - Number of decimal places (default: 2)
 * @returns {number} The rounded value
 */
function roundDigits(value, digits = 2) {
    const multiplier = Math.pow(10, digits);
    return Math.round(value * multiplier) / multiplier;
}

/**
 * Creates a deep copy of the session state object
 * @returns {Object} Deep copy of window.session_state
 */
function deepCopySessionState() {
    const base = window.session_state || {};
    const copy = {};
    for (const key in base) {
        copy[key] = { ...base[key] };
    }
    return copy;
}

/**
 * Computes the total bonus payment for the current task
 * Scales performance between minimum and maximum bonus amounts
 * @returns {number} Total bonus amount in GBP
 */

function computeTotalBonus() {
    // Maximum bonus amounts for each task type
    const max_bonus = {
        "pilt-to-test": 2.45,
        "reversal": 0.5,
        "wm": 0.8,
        "control": 1.25
    }[window.task];

    const min_prop_bonus = 0.6; // Minimum proportion of maximum bonus guaranteed
    const min_bonus = max_bonus * min_prop_bonus;

    const session_state_obj = deepCopySessionState();

    // Initialize the task-specific object if it doesn't exist
    if (!session_state_obj[window.task]) {
        session_state_obj[window.task] = {
            earned: 0,
            min: 0,
            max: 0
        };
    }
    
    // Get the previous bonus values from session state for this specific task
    const prevBonus = {
        earned: session_state_obj[window.task].earned || 0,
        min: session_state_obj[window.task].min || 0,
        max: session_state_obj[window.task].max || 0
    };

    const taskBonus = getTaskBonusData(window.task);

    // Calculate the total bonus based on the current bonus and last recorded bonus
    const earned = prevBonus.earned + taskBonus.earned;
    const min = prevBonus.min + taskBonus.min;
    const max = prevBonus.max + taskBonus.max;

    // Calculate proportion of performance between min and max possible scores
    const prop = Math.max(0, Math.min(1, (earned - min) / (max - min)));
    const totalBonus = prop * (max_bonus - min_bonus) + min_bonus;

    // Add insurance to ensure bonus is never below minimum or NaN
    return Number.isNaN(totalBonus) ? min_bonus : totalBonus;
}

/**
 * Updates the session state with current task bonus information
 * Sends updated bonus data to parent window via postMessage
 */

function updateBonusState(settings) {
    // Initialize an updated session state object
    const updated_session_state_obj = deepCopySessionState();

    // Initialize the task-specific object if it doesn't exist
    if (!updated_session_state_obj[settings.task_name]) {
        updated_session_state_obj[settings.task_name] = {
            earned: 0,
            min: 0,
            max: 0
        };
    }
    
    // Get the previous bonus values from session state for this specific task
    const prevBonus = {
        earned: updated_session_state_obj[settings.task_name].earned || 0,
        min: updated_session_state_obj[settings.task_name].min || 0,
        max: updated_session_state_obj[settings.task_name].max || 0
    };
    console.log(`Last saved bonus for ${settings.task_name}:`, prevBonus);

    // Get task-specific bonus data
    const taskBonus = settings.__task.computeBonus() || {earned: 0, min: 0, max: 0};
    
    // Calculate the new bonus values
    const newBonus = {
        earned: prevBonus.earned + taskBonus.earned,
        min: prevBonus.min + taskBonus.min,
        max: prevBonus.max + taskBonus.max
    };

    // Update the task-specific values in the session state
    updated_session_state_obj[settings.task_name].earned = roundDigits(newBonus.earned);
    if (settings.task_name !== "reversal") {
        // For all tasks except reversal, we update the min and max in bonus state
        updated_session_state_obj[settings.task_name].min = roundDigits(newBonus.min);
        updated_session_state_obj[settings.task_name].max = roundDigits(newBonus.max);
    }

    // Send the updated state back to the parent window
    console.log("To-be-updated bonus:", updated_session_state_obj);
    postToParent({
        session_state: JSON.stringify(updated_session_state_obj)
    });
}

/**
 * jsPsych trial configuration for displaying bonus payment information
 * Shows final bonus amount and handles bonus state updates
 */

const bonus_trial = {
    type: jsPsychHtmlButtonResponse,
    css_classes: ['instructions'],
    stimulus: function (trial) {
        // Determine context-appropriate terminology
        let event = window.context === "relmed" ? "module" : "session";
        let stimulus =  `Congratulations! You are nearly at the end of this ${event}!`      
        const total_bonus = computeTotalBonus();
        stimulus += `
                <p>It is time to reveal your total bonus payment for this ${event}.</p>
                <p>Altogether, you will earn an extra ${total_bonus.toLocaleString('en-GB', { style: 'currency', currency: 'GBP' })}.</p>
            `;
        return stimulus;
    },
    choices: ['Continue'],
    data: { trialphase: 'bonus_trial' },
    on_start: () => {
      updateState(`bonus_trial`);
    },
    on_finish: (data) => {
      const bonus = computeTotalBonus().toFixed(2);
      
      data.bonus = bonus;

      // Send bonus information to parent window
      postToParent({bonus: bonus});
      
      updateState('bonus_trial_end');
    },
    simulation_options: {
      simulate: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' // Simulate the bonus trial in development mode
    }
  };

/**
 * Computes bonus payments for relative piggy bank tasks based on trial performance.
 * 
 * @param {string} trialphase - The trial phase identifier to filter trials by
 * @returns {Object} Bonus calculation results
 * @returns {number} returns.earned - Actual bonus earned from the last trial's total reward (converted to currency units)
 * @returns {number} returns.min - Minimum possible bonus based on task parameters
 * @returns {number} returns.max - Maximum possible bonus based on task duration and parameters
 * 
 * @description
 * Calculates three bonus values:
 * - earned: Takes the final total_reward and converts to currency (×0.01)
 * - min: Sum of minimum rewards (1 × magnitude ÷ ratio) across all trials
 * - max: Sum of maximum rewards (10 × duration × magnitude ÷ ratio) across all trials
 * 
 * Returns zero values if no trials found or calculations result in NaN.
 */
function computeRelativePiggyTasksBonus(trialphase) {
    const trials = jsPsych.data.get().filter({trialphase});

    if (trials.count() === 0) {
        // console.log(`No trials found for ${trialphase}. Returning default values.`);
        return { earned: 0, min: 0, max: 0 };
    }

    const earned = trials.select('total_reward').values.slice(-1)[0] * 0.01;
    const values = trials.values();

    const min = values.reduce((sum, trial) => 
        sum + (1 * trial.timeline_variables.magnitude * 0.01 / trial.timeline_variables.ratio), 0);

    const max = values.reduce((sum, trial) => 
        sum + (10 * trial.trial_duration / 1000 * 
            (trial.timeline_variables.magnitude * 0.01 / trial.timeline_variables.ratio)), 0);

    return { 
        earned: isNaN(earned) ? 0 : earned, 
        min: isNaN(min) ? 0 : min, 
        max: isNaN(max) ? 0 : max
    };
};

// Export functions for use in other modules
export {
    getTaskBonusData,
    roundDigits,
    deepCopySessionState,
    computeTotalBonus,
    updateBonusState,
    bonus_trial,
    computeRelativePiggyTasksBonus
};

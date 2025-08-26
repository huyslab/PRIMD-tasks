/**
 * Acceptability Questionnaire Utilities
 * 
 * This module provides utilities for creating standardized acceptability questionnaires
 * for different experimental tasks. Each questionnaire assesses three key dimensions:
 * - Task difficulty (1-5 scale)
 * - Task enjoyment (1-5 scale) 
 * - Task clarity/comprehension (1-5 scale)
 * 
 */

// Introduction screen shown before acceptability questions
const acceptability_intro =
{
    type: jsPsychInstructions,
    css_classes: ['instructions'],
    pages: [
        `<p>Please answer the following short questions.</p>`
    ],
    show_clickable_nav: true,
    data: { trialphase: "pre_debrief_instructions" }
};

/**
 * Creates a standardized acceptability questionnaire for a specific task
 * 
 * @param {string} taskName - Short identifier for the task (used in data field names)
 * @param {string} gameDescription - Human-readable description of the game/task
 * @returns {Array} Array containing intro screen and Likert scale questionnaire
 * 
 * @example
 * // Create acceptability questionnaire for a card game
 * const cardGameAcceptability = createAcceptabilityTask("cards", "card choosing game");
 * 
 * @example
 * // Create acceptability questionnaire for a working memory task
 * const wmAcceptability = createAcceptabilityTask("wm", "one-card memory game");
 */
export function createAcceptabilityTask(taskName, gameDescription) {
    return [
        acceptability_intro,
        {
            type: jsPsychSurveyLikert,
            preamble: `<p>Please answer these questions regarding the ${gameDescription}:<p>`,
            questions: [
                {
                    prompt: `How difficult was the ${gameDescription}?`,
                    labels: ["1<br>Not at all", "2", "3", "4", "5<br>Very difficult"],
                    required: true,
                    name: `${taskName}_difficulty`
                },
                {
                    prompt: `How enjoyable was the ${gameDescription}?`,
                    labels: ["1<br>Not at all", "2", "3", "4", "5<br>Very enjoyable"],
                    required: true,
                    name: `${taskName}_enjoy`
                },
                {
                    prompt: `Was it clear to you what you needed to do in the ${gameDescription}?`,
                    labels: ["1<br>Not clear at all", "2", "3", "4", "5<br>Extremely clear"],
                    required: true,
                    name: `${taskName}_clear`
                }
            ],
            data: {
                trialphase: `acceptability_${taskName}` // Used for data analysis and filtering
            }
        }
    ];
}

// Example usage - uncomment to create specific task acceptability questionnaires:
// const acceptability_PILT = createAcceptabilityTask("pilt", "card choosing game");
// const acceptability_vigour = createAcceptabilityTask("vigour", "piggy-bank game");
// const acceptability_PIT = createAcceptabilityTask("pit", "piggy-bank game in cloudy space");
// const acceptability_ltm = createAcceptabilityTask("ltm", "card choosing game with 3 cards");
// const acceptability_wm = createAcceptabilityTask("wm", "one-card game you just completed");
// const acceptability_reversal = createAcceptabilityTask("reversal", "squirrel game");


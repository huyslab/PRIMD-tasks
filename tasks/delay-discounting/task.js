import { updateState, noChoiceWarning, canBeWarned } from '@utils/index.js';

// Monetary Choice Questionnaire

const DD_SUM_DELAYS = [
    { today: 54, later: 55, delay: 117 },
    { today: 55, later: 75, delay: 61 },
    { today: 19, later: 25, delay: 53 },
    { today: 31, later: 85, delay: 7 },
    { today: 14, later: 25, delay: 19 },
    { today: 47, later: 50, delay: 160 },
    { today: 15, later: 35, delay: 13 },
    { today: 25, later: 60, delay: 14 },
    { today: 78, later: 80, delay: 162 },
    { today: 40, later: 55, delay: 62 },
    { today: 11, later: 30, delay: 7 },
    { today: 67, later: 75, delay: 119 },
    { today: 34, later: 35, delay: 186 },
    { today: 27, later: 50, delay: 21 },
    { today: 69, later: 85, delay: 91 },
    { today: 49, later: 60,  delay: 89 },
    { today: 80, later: 85, delay: 157 },
    { today: 24, later: 35, delay: 29 },
    { today: 33, later: 80, delay: 14 },
    { today: 28, later: 30, delay: 179 },
    { today: 34, later: 50, delay: 30 },
    { today: 25, later: 30, delay: 80 },
    { today: 41, later: 75, delay: 20 },
    { today: 54, later: 60, delay: 111 },
    { today: 54, later: 80, delay: 30 },
    { today: 22, later: 25, delay: 136 },
    { today: 20, later: 55, delay: 7 },
]

const dd_choices = DD_SUM_DELAYS.map((d) => {
    return {
        choices: [`£${d.today}\ntoday`, `£${d.later}\nin ${d.delay} days`],
        sum_today: d.today,
        sum_later: d.later,
        delay: d.delay
    }
})

const ddTrial = (settings) => {
    return {
        type: jsPsychHtmlButtonResponse,
        stimulus: "<p>Would you prefer:</p>",
        choices: jsPsych.timelineVariable("choices"),
        button_html: function(choice, choice_index) {
            return `<button class="jspsych-btn dd-btn">${choice}</button>`;
        },
        enable_button_after: 300,
        trial_duration: () => {
            if (canBeWarned(settings)){
                return settings.default_response_deadline
            } else {
                return settings.long_response_deadline
            }
        },
        data: {
            sum_today: jsPsych.timelineVariable("sum_today"),
            sum_later: jsPsych.timelineVariable("sum_later"),
            delay: jsPsych.timelineVariable("delay"),
            trialphase: "dd_task"
        },
        post_trial_gap: 200,
        on_finish: (data) => {
            if (data.response === null){

                // Update general warning counter
                const gen_n_warnings = jsPsych.data.get().last(1).select("n_warnings").values[0];
                
                jsPsych.data.addProperties({
                    n_warnings: gen_n_warnings + 1
                });

            }
        }
    }
};

const dd_instructions = {
    type: jsPsychInstructions,
    css_classes: ['instructions'],
    pages: [
        "<p>On each turn of the first task, you'll see two hypothetical options for winning money. Each time, just pick the one you prefer.</p>",
        "<p>For each of the next 27 choices, please indicate which reward you would prefer: the smaller reward today, or the larger reward in the specified number of days.</p>"
    ],
    show_clickable_nav: true,
    on_start: () => {
        updateState("dd_instructions_start");
    },
    on_finish: () => {
        jsPsych.data.addProperties({
            dd_n_warnings: 0
        });

        updateState("dd_task_start");
    },
    data: {
        trialphase: "dd_instructions"
    }
};

export function createDelayDiscountingTimeline(settings) {
    return [
    dd_instructions,
    {
        timeline: [
            ddTrial(settings),
            noChoiceWarning("response", "", "dd")
        ],
        timeline_variables: dd_choices,
        on_finish: (data) => {
            data.chosen_later = data.response === null ? null : data.response == 1
        }
    }
    ]
}


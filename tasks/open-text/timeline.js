/**
 * Open Text Task Timeline
 * 
 * This module creates the complete timeline for the open text response task,
 * including instructions and RELMED (Reward and Effort Learning in Mental Depression)
 * open-ended questions about participants' recent experiences and motivations.
 */

import { User, question_trial, timeWord } from "./utils.js"
import { openTextInstructions } from "./instructions.js"
import { saveDataREDCap } from "@utils/index.js"

/**
 * RELMED open-ended questions array
 * These questions assess participants' recent rewarding experiences, expectations,
 * and motivational goals as part of the depression and reward processing research
 */
const RELMED_QS = [
    "<p>Please describe any <b>rewarding experiences</b> you've had during the past week.</p><p>How have these experiences affected you personally?</p>",
    "<p>Describe specific times in the past week when things turned out <b>better than you expected</b>. How did these experiences affect your energy and motivation?</p>",
    "<p>Describe specific times in the past week when things turned out <b>worse than you expected</b>. How did these experiences affect your energy and motivation?</p>",
    "<p>What <b>meaningful goals</b> have you been motivated to pursue in the past week?</p>"
]

/**
 * Creates the complete timeline for the open text response task
 * Assembles instructions and RELMED question trials with proper formatting and validation
 * 
 * @param {Object} settings - Task configuration settings
 * @param {number} settings.min_words - Minimum words required per response
 * @param {number} settings.writing_time - Time allowed for writing responses (seconds)
 * @param {number} settings.qs_read_time - Additional time for reading questions (seconds)
 * @param {boolean} settings.prevent_paste - Whether to prevent pasting into text areas
 * @param {string} settings.oq_timelimit_text - Display text for time limit
 * 
 * @returns {Array} Array of jsPsych timeline objects for the complete open text task
 */
export function createOpenTextTimeline(settings) {
    // Initialize user session tracking object
    const currentUser = new User()
    
    let openTextTimeline = []

    // Transform RELMED questions into jsPsych-compatible format
    let relmed_question_array = []
    let q = 0
    for (let relmed_q of RELMED_QS) {
        q += 1
        // Create question object with HTML formatting and word counter
        let tmp_json = {
            prompt: `<div id="qs_instr">` + relmed_q + `</div>` + timeWord(settings),
            rows: 8,                    // Text area height
            columns: 100,               // Text area width
            name: 'relmed_q' + q.toString(), // Unique identifier for data storage
        }
        relmed_question_array.push(tmp_json)
    }

    // Create individual trial objects for each RELMED question
    let q_count = 0
    let relmed_open_timeline_array = []
    let q_max = relmed_question_array.length
    
    for (let i = 0; i < q_max; i++) {
        q_count += 1
        // Create question trial with user tracking and settings
        relmed_open_timeline_array.push(question_trial(relmed_question_array, i, q_count, currentUser, settings))
    }
    
    // Wrap question trials in timeline with completion callback
    let relmed_open_timeline = {
        timeline: relmed_open_timeline_array,
        on_timeline_finish: () => {
            // Clean up CSS classes and save final data
            document.body.className = '';
            saveDataREDCap(3);
        }
    }

    // Assemble complete timeline: instructions followed by questions
    openTextTimeline.push(openTextInstructions(settings))  // Task instructions
    openTextTimeline.push(relmed_open_timeline)            // RELMED question trials
    
    return openTextTimeline
}

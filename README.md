# RELMED Task Battery

## Overview
This repository aims to provide easy to customize code for the RELMED task battery. This system provides a standardized interface for creating and combining experimental timelines, making it easy to build complete experiments from individual task components. The framework is built on top of jsPsych and follows a modular architecture that promotes code reusability and consistency across different experimental paradigms.

## Available Tasks

The battery currently includes the following experimental tasks:

### Learning & Decision Making Tasks Based on Card Choosing
- **PILT** - Probabilistic Instrumental Learning Task: A card-choosing task measuring probabilistic learning with 2-choice decisions
- **WM** - Working Memory Task: Anne Collins's RLWM task with 3-choice decisions and reward-only feedback
- **Post Learning Test** - Extinction test phase for evaluating learning performance after card-choosing tasks
- **Pavlovian Lottery** - Conditioning task creating associations between visual cues and monetary rewards

### Reward & Motivation Tasks Based on Repeated Key Pressing
- **Max Press Test** - Tests maximum key press speed for calibrating effort-based tasks
- **Vigour Task** - Measures instrumental action vigour as a function of reward rate
- **PIT** - Pavlovian-Instrumental Transfer Task: Measures action vigour in extinction with Pavlovian cues

### Control & Exploration Tasks
- **Control Task** - Measures control-seeking, information-seeking, and reward-seeking behavior

### Miscellaneous Tasks
- **Delay Discounting** - Measures preferences for smaller-sooner vs larger-later monetary rewards
- **Open Text** - Collects open-ended text responses with customizable time limits and validation

## Repository Structure

```
relmed_task_battery/
├── README
├── api/                          # Task registry and unified interface
│   ├── index.js                 # Main API entry point
│   ├── task-registry.js         # Task definitions and configuration
│   ├── module-registry.js       # Module definitions for multi-task experiments
│   ├── messages.js              # Instruction messages for modules
│   └── utils.js                 # Core API utility functions
├── tasks/                       # Individual task implementations
│   ├── card-choosing/           # PILT and WM tasks
│   ├── control/                 # Control task
│   ├── delay-discounting/       # Delay discounting task
│   ├── max-press-test/          # Max press speed test
│   ├── open-text/               # Open text questions
│   ├── pavlovian-lottery/       # Pavlovian conditioning
│   └── piggy-banks/             # Vigour and PIT tasks
├── core/                        # Shared utilities and jsPsych
│   ├── utils/                   # Common utility functions
│   └── jspsych/                 # jsPsych library and plugins
├── assets/                      # Static resources
│   ├── images/                  # Task images and stimuli
│   └── sequences/               # Experimental sequences/parameters
└── examples/                    # Working example HTML files
```

## How to Build an Experiment

### Creating Experiments is Simple

**If you don't need to modify task behavior**, creating an experiment is straightforward - you just need to write an HTML file that loads the required dependencies and calls the API functions. The framework handles all the task logic, timing, and data collection automatically.

**You have two main approaches:**
1. **Individual Tasks**: Build experiments by combining individual tasks using `createTaskTimeline()`
2. **Modules**: Use collections of tasks using `createModuleTimeline()` 

### Approach 1: Individual Tasks

This approach gives you maximum flexibility to customize which tasks to include and their order.

#### Steps to Create an HTML Experiment File

1. **Set up HTML structure**: Create a basic HTML page with a display element for jsPsych

2. **Load dependencies in the `<head>`**:
   - jsPsych core library (`jspsych.js`)
   - Required jsPsych plugins (varies by task)
   - Task-specific plugin files (check task requirements)
   - Core utilities as ES6 modules
   - CSS files (jsPsych core + task-specific styles)

3. **Initialize jsPsych** with display settings and completion handlers

4. **Create experiment logic**:
   - Import API functions (`createTaskTimeline`, `getTaskInfo`, etc.)
   - Use `createTaskTimeline()` to generate task timelines with optional configuration
   - Combine multiple tasks by concatenating their timelines
   - Add experiment entry/exit (fullscreen, etc.)

5. **Run the experiment** using `jsPsych.run()`

#### Single vs Multiple Tasks

- **Single Task**: Call `createTaskTimeline()` once with your desired configuration
- **Multiple Tasks**: Call `createTaskTimeline()` for each task and combine the resulting arrays into one timeline
- **Task Order**: Simply arrange the timeline arrays in the order you want tasks to appear

### Approach 2: Predefined Modules

Modules are predefined collections of tasks designed to be completed in a single session. They include task sequencing, instruction messages, and standardized configurations.

#### Available Modules

- **`full_battery`**: Complete RELMED task battery with all tasks and questionnaires
- **`screening`**: Shortened version for participant screening with key tasks

#### Using Modules

```javascript
// Import module functions
import { createModuleTimeline, getModuleInfo, listModules } from '/api/index.js';

// Get information about available modules
console.log(listModules()); // ['full_battery', 'screening']
console.log(getModuleInfo('screening')); // Detailed module information

// Create timeline for a module
const timeline = await createModuleTimeline('screening', {
    session: 'screening',
    sequence: 'screening'
});

// Run the experiment
await jsPsych.run([enterExperiment, ...timeline, exitFullscreen]);
```

#### Module Configuration

Modules support three levels of configuration (in order of precedence):
1. **Module-level config**: Applied to all tasks in the module
2. **Element-level config**: Applied to specific tasks within the module 
3. **Runtime config**: Passed to `createModuleTimeline()`, overrides all others

```javascript
// Module definition example (from module-registry.js)
{
    name: "Screening Module",
    moduleConfig: {           // Applied to all tasks
        session: "screening",
        sequence: "screening"
    },
    elements: [
        { type: "task", name: "PILT", config: { present_pavlovian: false } }, // Task-specific config
        { type: "instructions", config: { text: "start_message" } }
    ]
}

// Runtime configuration overrides everything
const timeline = await createModuleTimeline('screening', {
    session: 'custom_session'  // This will override moduleConfig.session
});
```

#### Creating Custom Modules

You can define your own modules in `api/module-registry.js`:

```javascript
export const ModuleRegistry = {
    my_custom_module: {
        name: "My Custom Module",
        moduleConfig: {
            session: "custom",
            sequence: "wk0"
        },
        elements: [
            { type: "instructions", config: { text: "start_message" } },
            { type: "task", name: "PILT" },
            { type: "task", name: "control", config: { max_instruction_fails: 5 } },
            { type: "task", name: "open_text" },
            { type: "instructions", config: { text: "end_message" } }
        ]
    }
};
```

### Required Files and Dependencies

**For every experiment, you must include:**

1. **jsPsych core files**: Always load `jspsych.js` and required plugins
2. **Core utilities**: Load `/core/utils/index.js` as a module
3. **Task-specific files**: Check each task's requirements in the task registry
4. **CSS files**: Include `jspsych.css` and task-specific stylesheets

**Task-specific requirements** (check `api/task-registry.js` for complete details):
- **PILT/WM**: Requires `plugin-card-choosing.js` and `styles.css`
- **Control**: Requires multiple control plugins and `styles.css`
- **Vigour/PIT**: Requires piggy-banks plugins and `styles.css`
- **Delay Discounting**: Requires only core plugins and `styles.css`

### Task Configuration

Each task accepts a configuration object to customize behavior. If you don't need to change anything, you can use the default settings by passing an empty object `{}` or omitting the configuration entirely.

**Example configurations for different tasks:**

```javascript
// PILT with custom settings
const piltConfig = {
    task_name: "pilt",
    n_choices: 2,
    valence: "mixed",           // "mixed", "reward", "punishment", "both"
    present_pavlovian: true,
    sequence: 'wk0',
    include_instructions: true
};

// Control task with custom timing
const controlConfig = {
    session: "wk0",
    max_instruction_fails: 3,
    default_response_deadline: 4000,
    long_response_deadline: 6000
};

// Delay discounting with default settings (just pass empty object)
const ddConfig = {};
```

### Getting Task Information

Use `getTaskInfo()` to explore available configuration options:

```javascript
const taskInfo = getTaskInfo('PILT');
console.log(taskInfo.configOptions);  // Shows all available config options
console.log(taskInfo.defaultConfig);  // Shows default values
```

## API Reference

### Core Functions

#### Individual Tasks
- `createTaskTimeline(taskName, config)` - Creates a timeline for the specified task
- `getTaskInfo(taskName)` - Returns task information including configuration options
- `listTasks()` - Returns array of all available task names
- `getTask(taskName)` - Returns the complete task object from registry

#### Modules (Multi-Task Collections)
- `createModuleTimeline(moduleName, config)` - Creates a timeline for an entire module
- `getModuleInfo(moduleName)` - Returns module information including task sequence
- `listModules()` - Returns array of all available module names
- `getModule(moduleName)` - Returns the complete module object from registry

#### Messages and Instructions
- `getMessage(moduleName, messageKey, settings)` - Retrieves instruction messages for modules

### Utility Functions

- `enterExperiment` - Standard fullscreen entry point for experiments
- Various bonus calculation, data handling, and resumption utilities in `/core/utils/`

### Task Names

Use these exact strings when calling `createTaskTimeline()`:
- `'PILT'`, `'WM'`, `'post_learning_test'`, `'post_PILT_test'`, `'post_WM_test'`
- `'delay_discounting'`, `'vigour'`, `'vigour_test'`, `'PIT'` 
- `'control'`, `'max_press_test'`, `'pavlovian_lottery'`, `'open_text'`
- `'reversal'`, `'acceptability_judgment'`

### Module Names

Use these exact strings when calling `createModuleTimeline()`:
- `'full_battery'` - Complete RELMED task battery 
- `'screening'` - Shortened screening version

## Examples

Complete working examples are available in the `examples/` folder:

### Individual Task Examples
- `PILT.html` - Card choosing learning task
- `control.html` - Control-seeking task  
- `delay-discounting.html` - Intertemporal choice task
- `vigour.html` - Action vigour task
- And more...

Each example demonstrates proper file loading, API usage, and task configuration for that specific task type.

### Module Example
- `experiment.html` - Complete module-based experiment using `createModuleTimeline()`

This example shows how to:
- Load all required dependencies for multiple tasks
- Use URL parameters to select modules (`full_battery` vs `screening`)
- Handle module configuration and timeline creation
- Support simulation mode for testing

**Key features demonstrated:**
```javascript
// Module selection based on URL parameter
const module_name = session == "screening" ? 'screening' : 'full_battery';

// Module timeline creation
const timeline = await createModuleTimeline(module_name, settings);

// Complete experiment structure
const fullTimeline = [
    enterExperiment,
    ...timeline,
    exitFullscreen
];
```
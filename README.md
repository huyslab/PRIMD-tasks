# RELMED probabilistic learning task pilot #8
This reposistory hosts the experiment website for the eighth pilot for RELMED (Internal name Pilot 8?), which includes PILT, Vigour, PIT, reversal, WM, control, and questionnaires. The task is coded with jsPsych.

However, only WM and Control will be tested for Pilot 8.

Data is written to REDCap via a call to an AWS lamda function.

## Files in this repository
```
.
├── consent.html - landing page, consent form.
├── experiment.html - main experiment script, participants are redirected here from conset.html
├── PILT.js - main script for PILT
├── PILT_instructions.js - instructions for PILT
├── plugin-PLT.js - plugin for PILT trial
├── pilot6_pilt.json - trial sequence for PILT
├── pilot6_pilt_test.json - trial sequence for PILT test phase
├── vigour.js - main vigour task script
├── vigour_instructions.js - vigour task 
├── visgour_styles.css - stylesheet for vigour task
├── post-vigour-test.js - script for post vigour task test
├── vigour.json - trial sequence for vigour task
├── reversal.js - main script for reversal task
├── PIT.js - main script for PIT transfer phase
├── questionnaires.js - main script for all the questionnaires
├── plugin-reversal.js - plugin for reversal trial
├── pilot4_reversal_sequence.js - trial sequence for reversal task
├── utils.js - functions and trial objects shared across tasks
├── jspsych - jsPsych library/
│   └── .
└── lambda - AWS lambda function scripts/
    └── .
```


<!-- LOADING-TEST-RESULTS -->

### 🧪 Can all tasks load?

| Session | Task | Chromium | Firefox | WebKit |
|---------|------|----------|---------|--------|
| screening | screening | ✅ Success | ❌ Failed | ✅ Success |
| wk0 | pilt-to-test | ❌ Failed | ❌ Failed | ❌ Failed |
| wk0 | reversal | ✅ Success | ❌ Failed | ✅ Success |
| wk0 | control | ❌ Failed | ❌ Failed | ❌ Failed |
| wk0 | wm | ❌ Failed | ❌ Failed | ❌ Failed |
| wk2 | pilt-to-test | ❌ Failed | ❌ Failed | ❌ Failed |
| wk2 | reversal | ✅ Success | ❌ Failed | ✅ Success |
| wk2 | control | ❌ Failed | ❌ Failed | ❌ Failed |
| wk2 | wm | ❌ Failed | ❌ Failed | ❌ Failed |
| wk4 | pilt-to-test | ❌ Failed | ❌ Failed | ❌ Failed |
| wk4 | reversal | ✅ Success | ❌ Failed | ✅ Success |
| wk4 | control | ❌ Failed | ❌ Failed | ❌ Failed |
| wk4 | wm | ❌ Failed | ❌ Failed | ❌ Failed |
| wk24 | pilt-to-test | ❌ Failed | ❌ Failed | ❌ Failed |
| wk24 | reversal | ✅ Success | ❌ Failed | ✅ Success |
| wk24 | control | ❌ Failed | ❌ Failed | ❌ Failed |
| wk24 | wm | ❌ Failed | ❌ Failed | ❌ Failed |
| wk28 | pilt-to-test | ❌ Failed | ❌ Failed | ❌ Failed |
| wk28 | reversal | ✅ Success | ❌ Failed | ✅ Success |
| wk28 | control | ❌ Failed | ❌ Failed | ❌ Failed |
| wk28 | wm | ❌ Failed | ❌ Failed | ❌ Failed |
| wk0 | quests | ❌ Failed | ❌ Failed | ❌ Failed |
| wk2 | quests | ❌ Failed | ❌ Failed | ❌ Failed |
| wk4 | quests | ❌ Failed | ❌ Failed | ❌ Failed |
| wk24 | quests | ✅ Success | ❌ Failed | ✅ Success |
| wk28 | quests | ✅ Success | ❌ Failed | ✅ Success |
| wk6 | quests | ✅ Success | ❌ Failed | ✅ Success |
| wk8 | quests | ✅ Success | ❌ Failed | ✅ Success |
| wk52 | quests | ✅ Success | ❌ Failed | ✅ Success |

<!-- LOADING-TEST-RESULTS -->
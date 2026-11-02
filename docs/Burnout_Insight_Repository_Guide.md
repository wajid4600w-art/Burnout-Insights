# Burnout Insight — Repository Guide

## 1. Project purpose

Burnout Insight is a standalone English website for educational reflection on exhaustion and workplace pressure. It runs in a browser and does not require an account, server, or database.

The project has two related goals:

1. Help a person understand patterns in personal and work-related exhaustion.
2. Provide practical, non-clinical suggestions for workplace concerns and recovery.

The site must not be presented as a medical diagnostic tool.

## 2. User experience

### Full assessment

The full assessment contains 25 mixed questions:

- 13 Copenhagen Burnout Inventory (CBI) exhaustion questions.
- 12 project-created workplace questions.

The questions are shuffled when a new full assessment begins. The Personal burnout meter uses the CBI questions. The Work-related burnout meter uses the 12 workplace questions for the live survey view. The final report also keeps the official CBI personal and work-related scores plus the workplace area analysis.

Each answer updates the live meters. A selected radio answer can be submitted with Enter or with the Continue button.

### Immediate support

Immediate support provides a shorter focused check-in for one concern, such as workload, control, coworker tension, or exhaustion. The saved focused report includes:

- Category name.
- Score from 0 to 100.
- Colored percentage meter.
- Short explanation.
- Practical steps.
- All focused responses.

### Results and records

Full results can show:

- Personal exhaustion.
- Work-related exhaustion.
- Colored severity ranges.
- Workplace area scores.
- Summary explanation.
- Detailed analysis.
- Practical next steps.
- A private seven-day plan.

Completed reports are saved in browser storage. Records can be opened, deleted, restored from the recycle bin, and reviewed later with all saved responses.

### PDF reports

The records page creates a formatted report containing selected records. The browser print dialog is used because a standalone browser page cannot silently generate a valid PDF without a PDF-generation library. Select **Save as PDF** in the print dialog to create the final `.pdf` file.

The formatted report includes report names, report numbering, date and time, colored score graphs, workplace analysis, recommendations, and responses.

## 3. Repository structure

| Path | Responsibility |
|---|---|
| `website/index.html` | Generated standalone browser file |
| `website/app.js` | UI rendering, routing, survey state, records, reports, exports, and interactions |
| `website/core.js` | Canonical questions, answer scales, CBI scoring, workplace scoring, and sources |
| `website/style.css` | Visual system, responsive layout, severity colors, cards, meters, and print styles |
| `website/build.py` | Embeds CSS and JavaScript into `index.html` |
| `docs/Burnout_Insight_Repository_Guide.md` | Source version of this guide |
| `docs/Burnout_Insight_Repository_Guide.pdf` | PDF version of this guide |

The published repository contains the ready-to-use `website` folder and README. The larger development project contains the test suite and supporting project files.

## 4. Scoring design

The canonical scoring logic lives in `website/core.js`.

### CBI scoring

CBI answer choices are converted to:

`100, 75, 50, 25, 0`

The personal score averages P01–P06. The work-related CBI score averages W01–W07. W07 is reverse-scored because the question asks about energy available for family and friends during leisure time.

### Workplace scoring

The 12 workplace questions are grouped into six areas:

- Workload
- Control
- Reward
- Community
- Fairness
- Values

Each area has two questions. Positive and negative wording is handled by the workplace scoring helper. These scores are project-created educational indicators and are not official Areas of Worklife Survey results.

### Severity bands

The user interface uses three descriptive ranges:

- Lower: below 34.
- Elevated: 34 through 66.
- Higher: 67 and above.

These are presentation bands, not clinical cutoffs.

## 5. Data and privacy

The browser stores records under local storage keys used by the application:

- `burnout-insight-records-v1`
- `burnout-insight-recycle-v1`
- `burnout-insight-progress-v1`

The application does not send answers to a server. Users should understand that browser storage can be cleared and that reports may contain sensitive personal reflections.

## 6. Development workflow

After editing `app.js`, `core.js`, or `style.css`, rebuild the standalone page:

```bash
python website/build.py
```

Run the scoring regression tests from the development project:

```bash
node Burnout_Insight_ALL_IN_ONE/tests/scoring.test.cjs
```

Also check JavaScript syntax:

```bash
node --check website/app.js
```

The generated `website/index.html` should be synchronized with the source files before publishing.

## 7. Design principles

- English-only interface.
- Clear headings and simple language.
- Responsive layout for desktop and mobile.
- Live colored meters.
- Complete saved reports rather than answer-only history.
- Practical suggestions without diagnostic claims.
- Local-first privacy with no required account.
- Accessible form controls, labels, focus handling, and keyboard submission.

## 8. Important limitation

Burnout Insight is an educational reflection tool. It cannot determine whether a person has burnout or another health condition. It should not replace professional medical, psychological, occupational-health, or workplace support.

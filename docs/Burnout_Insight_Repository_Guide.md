# Burnout Insight — Complete Website and Repository Guide

## 1. What Burnout Insight is

Burnout Insight is an English-only browser website for learning about exhaustion, work pressure, and possible workplace causes. It is designed as a private educational self-check, not as a medical or psychological diagnosis.

The website helps a person:

- Notice personal exhaustion patterns.
- Notice exhaustion connected with work.
- Review workplace conditions that may add pressure.
- Understand what the scores mean in simple language.
- Choose practical next steps.
- Save and review complete reports later.
- Track small actions with a private seven-day plan.

It works as a standalone website. There is no required account, server, login, or database.

## 2. What the website can do

### Full 25-question assessment

The full survey contains 25 questions in a mixed random order:

- 13 CBI exhaustion questions.
- 12 workplace questions.

The questions are not shown as “all personal first, then all work” questions. They are mixed to make the assessment feel more natural.

The survey provides:

- One question at a time.
- Progress indicator.
- Question-specific practical advice.
- Two live meters during the survey.
- Colored lower, elevated, and higher ranges.
- Enter-key submission after an answer is selected.
- Back navigation and the ability to change an answer.
- Responsive layout for desktop and mobile.

The live meters are:

1. **Personal burnout** — based on the 13 CBI exhaustion questions.
2. **Work-related burnout** — based on the 12 workplace questions in the live survey view.

The final report also calculates the official CBI personal and CBI work-related scores separately, together with the six workplace-area scores.

### Immediate Support

Immediate Support is a shorter focused survey for a specific concern. Available areas include:

- Workload.
- Control and decision-making.
- Coworker tension or conflict.
- Exhaustion and energy.

Each focused report can show:

- The selected concern.
- Number of questions answered.
- Score from 0 to 100.
- Colored percentage meter.
- Severity range.
- Explanation of the result.
- Practical suggestions.
- Alternative check-in ideas when appropriate.
- Every focused question and answer in the saved record.

### Results and explanations

The full result page can include:

- Personal exhaustion meter.
- Work-related exhaustion meter.
- Score ranges and descriptions.
- Workplace area cards.
- A normal summary of the burnout pattern.
- Detailed analysis of workplace conditions.
- Suggested actions for the person.
- Possible actions for an employer or organization.
- A best starting point.
- Safety guidance about when to seek professional support.
- Explanation of the assessment methods and limitations.
- A private seven-day improvement plan.

The user can choose a normal summary or detailed analysis. The normal summary is shorter; detailed analysis contains more workplace explanation and supporting information.

### Records and history

Completed assessments are saved as full reports, not only as raw answers. Records can include:

- Report type and name.
- Date and time.
- Personal and work-related scores.
- Workplace-area scores.
- Explanations.
- Recommendations.
- All question and answer pairs.
- Immediate Support scores and guidance.

The Records page allows users to:

- Open and review a saved report.
- Keep multiple reports from different dates.
- Select several reports.
- Download or print a combined report.
- Delete a report.
- Restore a deleted report from the recycle bin.
- Permanently empty the recycle bin.

The Records link stays available even when there are no saved records.

### Professional report and PDF output

The report layout is designed for review or submission. It can contain:

- Burnout Insight title and report heading.
- Report name and report number.
- Date and time.
- Colored score graphs.
- Percentage values.
- Workplace analysis.
- Advice and next steps.
- Full responses.
- Multiple reports in one document.

Because this is a standalone browser application, the report uses the browser print system. Select **Create PDF report**, then choose **Save as PDF** in the print dialog to create a real `.pdf` file.

### Dashboard

The home dashboard provides circular visual meters with severity colors. It can combine saved records and current answers to give an overall view. The dashboard is intended to help a user notice trends across assessments, not to create a clinical diagnosis.

### Seven-day progress plan

After an assessment, the website can create a private seven-day plan. It can include:

- Small recovery actions.
- A realistic work boundary.
- One action related to a workplace area.
- Daily checkboxes.
- Daily energy check-ins.
- A weekly view of progress.

The plan is stored locally in the browser.

## 3. Methods and models covered

### Copenhagen Burnout Inventory (CBI)

The CBI is used to structure the exhaustion questions. It separates:

- **Personal burnout** — general physical and emotional exhaustion.
- **Work-related burnout** — exhaustion connected with work.

The CBI questions use five answer choices. The application converts them to:

`100, 75, 50, 25, 0`

The personal score averages P01–P06. The work-related CBI score averages W01–W07. W07 is reverse-scored because having more energy for family and friends during leisure time indicates less work-related exhaustion.

The website explains that a higher score means more reported exhaustion on this educational scale. It does not convert the score into a probability of having burnout.

### Six Areas of Worklife

The 12 project-created workplace questions are organized into six workplace areas:

1. **Workload** — amount, pace, deadlines, and time pressure.
2. **Control** — influence, autonomy, decision-making, and flexibility.
3. **Reward** — recognition, feedback, and whether effort feels valued.
4. **Community** — relationships, communication, teamwork, and support.
5. **Fairness** — consistency, transparency, and fair treatment.
6. **Values** — alignment between work practices and professional values.

Each area has two questions. Positive and negative wording is scored in the correct direction. These are educational project questions inspired by the framework; they are not presented as official results from the licensed or official Areas of Worklife Survey.

### Job Demands–Resources (JD-R) model

The website uses the JD-R model to explain possible workplace patterns:

- **Job demands** are pressures that require sustained effort, such as workload, deadlines, interruptions, emotional demands, or unclear expectations.
- **Job resources** are supports that help a person manage work, such as autonomy, feedback, recognition, teamwork, fairness, and practical support.

The model is used to explain why high demands and limited resources may make exhaustion harder to manage. It is used for education and suggestions, not for diagnosis or proof of causation.

### Severity presentation bands

The interface uses simple descriptive bands:

- **Lower** — below 34.
- **Elevated** — 34 through 66.
- **Higher** — 67 and above.

These are visual communication bands created for the project. They are not medical cutoffs and do not determine whether someone has burnout.

## 4. Benefits of the website

Burnout Insight can help a user:

- Start a private conversation about exhaustion.
- Separate general exhaustion from workplace pressure.
- See which workplace conditions may deserve attention.
- Turn a broad concern into one practical next step.
- Compare reports over time.
- Keep a full record rather than remembering only a final number.
- Prepare for a conversation with a trusted person, manager, occupational-health service, or professional.
- Notice whether small changes improve daily energy.

For a student, team, or project demonstration, it also shows:

- A complete browser-based assessment flow.
- Data-driven scoring.
- Accessible form interaction.
- Responsive interface design.
- Local storage records.
- Report generation and print styling.
- A clear separation between scientific inspiration and project-created content.

## 5. Repository structure

| Path | Responsibility |
|---|---|
| `website/index.html` | Generated standalone browser file |
| `website/app.js` | Pages, routing, survey state, meters, records, reports, exports, and interactions |
| `website/core.js` | Canonical questions, answer scales, CBI scoring, workplace scoring, and sources |
| `website/style.css` | Visual system, responsive layout, severity colors, cards, meters, and print styles |
| `website/build.py` | Embeds CSS and JavaScript into `index.html` |
| `docs/Burnout_Insight_Repository_Guide.md` | Source version of this guide |
| `docs/Burnout_Insight_Repository_Guide.pdf` | PDF version of this guide |

The published repository contains the ready-to-use website and README. The larger development project contains the regression tests and supporting project files.

## 6. Data, privacy, and report storage

The website stores information in the browser under:

- `burnout-insight-records-v1`
- `burnout-insight-recycle-v1`
- `burnout-insight-progress-v1`

No account is required. The application does not send answers to a server. Clearing browser storage can remove records and progress plans. Reports may contain sensitive personal reflections, so users should keep downloaded files private.

## 7. Development workflow

After editing `app.js`, `core.js`, or `style.css`, rebuild the standalone page:

```bash
python website/build.py
```

Check JavaScript syntax:

```bash
node --check website/app.js
```

Run the scoring regression tests from the development project:

```bash
node Burnout_Insight_ALL_IN_ONE/tests/scoring.test.cjs
```

The generated `website/index.html` should be synchronized with the source files before publishing.

## 8. Design and accessibility principles

- English-only interface.
- Plain, supportive language.
- Clear headings and consistent visual hierarchy.
- Responsive desktop and mobile layouts.
- Color-coded meters with text labels, not color alone.
- Labeled form controls.
- Focus handling after navigation.
- Keyboard-friendly answer submission.
- Complete records instead of answer-only history.
- Practical suggestions without diagnostic claims.
- Local-first privacy.

## 9. Important limitations

Burnout Insight is an educational reflection tool. It cannot determine whether a person has burnout, depression, anxiety, or another health condition. It does not prove that work caused exhaustion and does not predict professionalism, performance, or future health.

Persistent, severe, or disruptive symptoms should be discussed with a qualified healthcare or mental-health professional. Workplace concerns may also be discussed with a trusted support person, manager, occupational-health service, or appropriate organizational resource.

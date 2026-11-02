# Burnout Insight

Burnout Insight is a small, English-only website for reflecting on exhaustion and workplace pressure. It is designed to be easy to open, easy to use, and private.

## What the tool can do

- Ask 25 questions in a mixed order.
- Use 13 personal/work-exhaustion questions for the **Personal burnout** score.
- Use 12 workplace questions for the **Work-related burnout** score.
- Update both meters while the assessment is being completed.
- Show lower, elevated, and higher ranges with matching colors.
- Move to the next question when an answer is selected and **Enter** is pressed.
- Give a normal summary or a more detailed analysis.
- Offer focused **Immediate support** check-ins for a specific concern.
- Save full reports and all question/answer details in browser records.
- View, delete, restore, and review saved reports.
- Create a formatted report for printing and saving as a real PDF.
- Provide a private seven-day progress plan.
- Work without an account, server, or external database.

The results are educational indicators. They are not a medical diagnosis.

## Open the website

1. Open the `website` folder.
2. Double-click `index.html`.
3. Use the site in any modern browser.

No installation is required for normal use.

## Main user flow

1. Select **Find my pattern** for the full assessment.
2. Read the short information notice and continue.
3. Answer the mixed questions. Select an option and press **Enter**, or click **Continue**.
4. Review the two colored burnout meters and the suggested next steps.
5. Choose **Records** to review saved reports.
6. Select reports and choose **Create PDF report**. In the print dialog, choose **Save as PDF**.
7. Use **My progress** to follow a private seven-day plan.

For one concern, choose **Get immediate help**, select a category, and complete the shorter focused check-in.

## Repository files

| File | Purpose |
|---|---|
| `website/index.html` | Ready-to-open standalone website |
| `website/app.js` | Pages, survey flow, meters, records, reports, and interactions |
| `website/core.js` | Questions, answer options, and scoring rules |
| `website/style.css` | Layout, colors, meters, responsive design, and print styling |
| `website/build.py` | Combines the source files into `index.html` |
| `tests/scoring.test.cjs` | Scoring regression tests in the development project |
| `docs/Burnout_Insight_Repository_Guide.pdf` | Detailed project documentation |

## Rebuild after a change

From the repository root, run:

```bash
python website/build.py
```

Run the scoring tests from the development project with:

```bash
node Burnout_Insight_ALL_IN_ONE/tests/scoring.test.cjs
```

After changing `app.js`, `core.js`, or `style.css`, rebuild `index.html` before opening or publishing the website.

## How scoring works

- CBI answers are converted to a 0–100 scale.
- The personal score averages the six personal exhaustion questions.
- The work-related score uses the seven CBI work questions.
- The final CBI energy question is reverse-scored because more available leisure energy indicates less work exhaustion.
- The 12 workplace questions are used for workplace-area analysis and practical guidance.
- A higher score means more reported exhaustion or concern on this educational scale.

## Privacy and limitations

Records are stored in the browser's local storage on the device being used. There is no account and no server upload. Clearing browser storage can remove saved records.

The workplace questions are project-created educational questions. The site should not be used to diagnose burnout, depression, or another health condition. Persistent, severe, or disruptive symptoms should be discussed with a qualified professional.

# Burnout Insight

Burnout Insight is a standalone browser-based educational tool for reflecting on personal exhaustion, work-related exhaustion, and workplace conditions.

## Repository contents

```text
website/
├── index.html   # Ready-to-open standalone website
├── app.js       # Interface, assessment flow, records, progress, and interactions
├── core.js      # Questions and scoring logic
├── style.css    # Website styling and responsive layout
└── build.py     # Rebuilds index.html from the source files
```

## How to use

### Open the website

Open `website/index.html` directly in a modern browser.

No server, account, database, or package installation is required.

### Use the assessment

1. Choose **Find my pattern** for the complete assessment, or choose **Get immediate help** for focused questions about a specific concern.
2. Read each question and select the answer that best describes your experience.
3. Continue through the questions to view the result.
4. Review the horizontal score meters, workplace areas, explanations, and suggested next steps.
5. Use **Records** to review saved results, open a specific record, delete or restore records, or download selected records together.
6. Use **My progress** to create and update a private seven-day improvement plan.

### Rebuild the standalone page

When `app.js`, `core.js`, or `style.css` changes, run:

```bash
python website/build.py
```

This embeds the source files into `website/index.html`, which is the browser-ready version.

## Privacy and storage

Assessment records and progress are stored locally in the browser using `localStorage`. The website does not send answers to a server or require a user account.

## Important

This is an educational self-reflection tool, not a medical diagnosis. It does not determine whether someone has burnout or another health condition. Seek qualified professional support for persistent, severe, or concerning symptoms.

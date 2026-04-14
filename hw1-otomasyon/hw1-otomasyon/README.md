# HW1 – Job Application Assistant (Google Antigravity)

An automation workflow built with **Google Antigravity** that captures a job description, processes it, saves it to Google Sheets, and generates a tailored cover letter using the Anthropic Claude API.

## Antigravity Project Structure

```
hw1-antigravity/
├── .agents/
│   ├── workflows/
│   │   └── job-application-assistant.md   ← Antigravity Workflow (trigger: /job-application-assistant)
│   ├── skills/
│   │   └── cover-letter-writer/
│   │       └── SKILL.md                   ← AI writing skill
│   └── rules/
│       └── project-rules.md               ← Agent coding rules
├── app.js          ← Primary logic (all 4 workflow steps)
├── package.json
├── .env.example
└── README.md
```

## Workflow Architecture

```
HTTP POST /webhook  (Trigger)
        ↓
processJobData()    (Processing Function)
        ↓
Google Sheets API   (External API)
        ↓
Anthropic Claude    (AI Completion → Cover Letter)
        ↓
Google Sheets API   (Update row with cover letter)
```

## Using in Antigravity

1. Open this project folder in Antigravity.
2. In the agent panel, type `/job-application-assistant` to trigger the workflow.
3. The agent will ask for job details and execute all steps automatically.

## Setup & Run

```bash
npm install
cp .env.example .env    # fill in API keys
npm start
```

## Test via HTTP

```bash
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "jobTitle": "Software Engineer",
    "company": "Acme Corp",
    "description": "We are looking for a Node.js developer...",
    "applicantName": "Jane Doe",
    "skills": "Node.js, Express, AWS"
  }'
```

---
description: Job Application Assistant – accepts a job description, generates a tailored cover letter with AI, and saves the result to Google Sheets.
---

# Job Application Assistant Workflow

This workflow implements the HW1 architecture:
**HTTP Trigger → Processing Function → Google Sheets (External API) → AI Completion**

---

## Steps

### Step 1 – Trigger: Accept Job Description Input
1. Ask the user to provide the following fields (or read them from an incoming HTTP request body):
   - `jobTitle` (required)
   - `company` (required)
   - `description` (required – paste the full job posting text)
   - `applicantName` (optional, default from `.env`)
   - `applicantEmail` (optional)
   - `skills` (optional – comma-separated list)
2. Validate that `jobTitle`, `company`, and `description` are not empty.
3. If any required field is missing, ask the user to provide it before continuing.

### Step 2 – Processing Function: Map & Transform Data
1. Trim all string values.
2. Add a `submittedAt` timestamp (ISO 8601).
3. Set `status` to `"pending"`.
4. Build a structured `applicationData` object:
   ```json
   {
     "jobTitle": "...",
     "company": "...",
     "description": "...",
     "applicantName": "...",
     "applicantEmail": "...",
     "skills": "...",
     "submittedAt": "2026-...",
     "status": "pending"
   }
   ```

### Step 3 – External API: Save to Google Sheets
// turbo
1. Call `saveToGoogleSheets(applicationData)` in `app.js`.
2. Append a new row to the **Applications** sheet with columns:
   `Timestamp | Job Title | Company | Name | Email | Skills | Status | Cover Letter`
3. Store the returned row range (e.g. `Applications!A2:H2`) for the update in Step 4.
4. Log the result: `[SHEETS] Row appended: <range>`

### Step 4 – AI Completion: Generate Cover Letter
// turbo
1. Call `generateCoverLetter(applicationData)` in `app.js`.
2. Send a structured prompt to **Anthropic Claude** (claude-sonnet-4-20250514) containing:
   - Job title, company, applicant name, skills, and full job description.
3. Receive the generated cover letter text.
4. Call `updateCoverLetterInSheets(coverLetter, rowRange)` to write the result back to column H.
5. Return the full response to the caller:
   ```json
   {
     "success": true,
     "jobTitle": "...",
     "company": "...",
     "coverLetterPreview": "first 200 chars...",
     "sheetRange": "Applications!A2:H2"
   }
   ```

---

## How to Trigger This Workflow

In the Antigravity agent panel, type:
```
/job-application-assistant
```

Or send an HTTP POST request to the running server:
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

---

## Error Handling
- If Google Sheets API fails → return 500 with error message; do not proceed to AI step.
- If Anthropic API fails → the row already exists in Sheets; log the error and return 500.
- All errors are caught in the top-level try/catch in `app.js`.

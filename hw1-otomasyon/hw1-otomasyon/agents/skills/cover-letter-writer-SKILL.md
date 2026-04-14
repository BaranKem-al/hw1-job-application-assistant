---
name: cover-letter-writer
description: Writes a professional, tailored cover letter given a job title, company name, applicant skills, and job description. Use when generating application documents.
---

# Cover Letter Writer Skill

This skill generates a polished, three-paragraph cover letter tailored to a specific job posting.

## Instructions

1. **Read the context**: Extract `jobTitle`, `company`, `applicantName`, `skills`, and `description` from the current workflow data.

2. **Build the prompt**: Structure the Anthropic API call with:
   - Role context: "You are a professional career coach."
   - Job details injected clearly (title, company, skills, full description).
   - Constraint: 3 paragraphs maximum, professional tone, specific to the role.

3. **Generate the letter**: Call the Anthropic Messages API:
   - Model: `claude-sonnet-4-20250514`
   - Max tokens: 800
   - Include: opening hook, skill alignment, call to action.

4. **Return the result**: Plain text cover letter, ready to save or email.

## Output Format

```
Dear Hiring Manager at [Company],

[Opening paragraph – strong hook, mention specific role and company]

[Middle paragraph – align applicant skills with job requirements]

[Closing paragraph – call to action, express enthusiasm, provide contact]

Sincerely,
[Applicant Name]
```

## Example Usage

This skill is invoked automatically by the `job-application-assistant` workflow in Step 4.
It can also be triggered standalone:

> "Write a cover letter for a Backend Engineer role at Stripe. My skills are Python, FastAPI, and PostgreSQL."

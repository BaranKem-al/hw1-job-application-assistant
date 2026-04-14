/**
 * HW1 – Job Application Assistant
 * Google Antigravity Project
 *
 * Architecture (as defined in .agents/workflows/job-application-assistant.md):
 *   HTTP Trigger → Processing Function → Google Sheets → AI Completion
 *
 * Setup:
 *   npm install
 *   cp .env.example .env   # fill in your API keys
 *   node app.js
 *
 * Trigger the workflow in Antigravity:
 *   /job-application-assistant
 *
 * Or via HTTP:
 *   curl -X POST http://localhost:3000/webhook \
 *     -H "Content-Type: application/json" \
 *     -d '{"jobTitle":"SWE","company":"Acme","description":"..."}'
 */

require("dotenv").config();
const express = require("express");
const axios = require("axios");
const { google } = require("googleapis");

const app = express();
app.use(express.json());





app.post("/webhook", async (req, res) => {
  console.log("[TRIGGER] Webhook received:", req.body);

  try {

    const applicationData = processJobData(req.body);
    console.log("[PROCESS] Mapped data:", applicationData);


    const sheetRow = await saveToGoogleSheets(applicationData);
    console.log("[SHEETS] Row appended:", sheetRow);


    const coverLetter = await generateCoverLetter(applicationData);
    console.log("[AI] Cover letter generated, length:", coverLetter.length);

    await updateCoverLetterInSheets(coverLetter, sheetRow);

    res.json({
      success: true,
      data: {
        jobTitle: applicationData.jobTitle,
        company: applicationData.company,
        coverLetterPreview: coverLetter.substring(0, 200) + "...",
        sheetRange: sheetRow,
      },
    });
  } catch (error) {
    console.error("[ERROR]", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/", (req, res) =>
  res.json({ status: "Job Application Assistant running 🚀" })
);





function processJobData(raw) {
  if (!raw.jobTitle || !raw.company || !raw.description) {
    throw new Error(
      "Missing required fields: jobTitle, company, description"
    );
  }
  return {
    jobTitle: raw.jobTitle.trim(),
    company: raw.company.trim(),
    description: raw.description.trim(),
    applicantName: raw.applicantName || process.env.APPLICANT_NAME || "Applicant",
    applicantEmail: raw.applicantEmail || process.env.APPLICANT_EMAIL || "",
    skills: Array.isArray(raw.skills)
      ? raw.skills.join(", ")
      : raw.skills || "",
    submittedAt: new Date().toISOString(),
    status: "pending",
  };
}


async function getGoogleSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

async function saveToGoogleSheets(data) {
  const sheets = await getGoogleSheetsClient();
  const response = await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: "Applications!A:H",
    valueInputOption: "USER_ENTERED",
    resource: {
      values: [[
        data.submittedAt,
        data.jobTitle,
        data.company,
        data.applicantName,
        data.applicantEmail,
        data.skills,
        data.status,
        "", // cover letter filled after AI step
      ]],
    },
  });
  return response.data.updates.updatedRange;
}

async function updateCoverLetterInSheets(coverLetter, range) {
  const sheets = await getGoogleSheetsClient();
  const rowNum = range.match(/\d+/)?.[0];
  if (!rowNum) return;
  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: `Applications!H${rowNum}`,
    valueInputOption: "USER_ENTERED",
    resource: { values: [[coverLetter]] },
  });
}


async function generateCoverLetter(data) {
  const prompt = `You are a professional career coach. Write a concise, tailored cover letter for the following job application.

Job Title: ${data.jobTitle}
Company: ${data.company}
Applicant Name: ${data.applicantName}
Applicant Skills: ${data.skills || "Not specified"}

Job Description:
${data.description}

Write a professional cover letter (3 paragraphs max). Be specific to the role and company. End with a clear call to action.`;

  const response = await axios.post(
    "https://api.anthropic.com/v1/messages",
    {
      model: "claude-sonnet-4-20250514",
      max_tokens: 800,
      messages: [{ role: "user", content: prompt }],
    },
    {
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
    }
  );

  return response.data.content[0].text;
}


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Job Application Assistant listening on port ${PORT}`);
  console.log(`   Antigravity workflow: /job-application-assistant`);
  console.log(`   HTTP trigger:         POST /webhook`);
});

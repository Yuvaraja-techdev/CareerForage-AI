import { HumanMessage, SystemMessage } from "@langchain/core/messages"
import llm from "../config/llm.js"

export const resumeAgent = async (resumeText) => {
    try {
        const response = await llm.invoke([
            new SystemMessage(`
You are an Expert ATS Resume Analyzer.

Analyze the given resume text carefully and thoroughly.

Extract and evaluate the following:
- Full Name ("name")
- Email ("email")
- Phone Number ("phone")
- Professional Summary ("summary")
- Technical Skills ("skills" as an array of skill strings)
- Projects ("projects" as an array of project title/description strings)
- Education ("education" as an array of education strings)
- Experience ("experience" as an array of experience strings)
- Strengths ("strengths" as an array of 4-6 concise key strengths)
- Weaknesses ("weaknesses" as an array of 2-4 weakness/improvement points)
- Missing Skills ("missingSkills" as an array of important missing skills for their role)
- Suggested Job Role ("suggestedRole" string, e.g. "Full Stack Developer", "Backend Developer", "Frontend Developer", "DevOps Engineer")
- ATS Score ("score" integer from 0 to 100)
- Recommendations ("recommendations" as an array of 3-5 actionable improvement suggestions)

IMPORTANT RULES:
1. Return ONLY valid JSON.
2. Do not use markdown backticks or explanations.
3. Every field must exist in the output JSON.
4. Ensure all array elements are strings.

Response JSON Format:
{
  "name": "",
  "email": "",
  "phone": "",
  "summary": "",
  "skills": [],
  "projects": [],
  "education": [],
  "experience": [],
  "strengths": [],
  "weaknesses": [],
  "missingSkills": [],
  "suggestedRole": "",
  "score": 0,
  "recommendations": []
}
`),
            new HumanMessage(resumeText),
        ])

        let rawContent = typeof response.content === "string" 
            ? response.content 
            : JSON.stringify(response.content);

        let cleaned = rawContent
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim();

        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            cleaned = jsonMatch[0];
        }

        return JSON.parse(cleaned);
    } catch (error) {
        console.error("Resume Agent Parse/Inference Error:", error);
        throw new Error("Failed to analyze resume with AI: " + error.message);
    }
}
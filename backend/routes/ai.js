import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/suggest', protect, async (req, res) => {
    const { title } = req.body;

    if (!title || title.trim() === "") {
        return res.status(400).json({ error: "Task title is required for AI generation." });
    }

    // Capture the key inside the route call to avoid undefined module-loading issues
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("❌ Environment Configuration Error: GEMINI_API_KEY is not being read correctly by Node.js.");
        return res.status(500).json({ error: "Backend environment key missing." });
    }

    console.log(`📥 [AI Route] Received raw title string from frontend: "${title}"`);

    try {
        // Initialize securely inside the scope of the request handler
        const genAI = new GoogleGenerativeAI(apiKey);
        // const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
            You are an expert project manager assistant inside a Kanban productivity app.
            Analyze the following task title: "${title}"
            
            Generate an automated breakdown for this task. You must follow these strict structural constraints:
            1. The "description" should be a single, short, concise summary sentence (maximum 15 words).
            2. The "subtasks" must be a clean JSON array containing exactly 3 to 4 actionable, practical, step-by-step distinct action strings.

            Return the output strictly matching this JSON format structure:
            {
                "description": "Short concise summary sentence here.",
                "subtasks": ["Step 1 action item", "Step 2 action item", "Step 3 action item"]
            }
        `;

        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.7,
                responseMimeType: "application/json"
            }
        });

        const rawResponseText = result.response.text();
        const parsedAIResult = JSON.parse(rawResponseText);

        console.log("✅ [AI Route] Structured response generated successfully!");
        return res.status(200).json(parsedAIResult);

    } catch (error) {
        console.error("❌ AI provider generation error:", error);
        
        // Solid fallback layer to keep your UI operational if network errors occur
        return res.status(500).json({
            error: "Failed to generate content from AI engine.",
            description: "Provide a brief task description...",
            subtasks: ["Review initial objective", "Break down custom goals", "Complete task card assignment"]
        });
    }
});

export default router;
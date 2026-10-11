import redis from "../../../shared/redis/redis.js";
import { resumeAgent } from "../agents/resume.agent.js";
import extractText from "../config/pdf.js";
import Resume from "../models/resume.model.js";
import fs from "fs";

export const uploadResume = async (req, res) => {
    const file = req.file;
    try {
        if (!file) {
            return res.status(400).json({
                success: false,
                message: "Resume PDF is required",
            });
        }
        const userId = req.headers["x-user-id"];

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "UserId is required",
            });
        }

        const resumeText = await extractText(file.path);
        const resumeData = await resumeAgent(resumeText);

        const normalizeArray = (arr) => {
            if (!Array.isArray(arr)) return [];
            return arr.map((item) => (typeof item === "object" ? JSON.stringify(item) : String(item)));
        };

        const sanitizedData = {
            name: resumeData?.name || "Candidate",
            email: resumeData?.email || "",
            phone: resumeData?.phone || "",
            summary: resumeData?.summary || "",
            skills: normalizeArray(resumeData?.skills),
            projects: normalizeArray(resumeData?.projects),
            education: normalizeArray(resumeData?.education),
            experience: normalizeArray(resumeData?.experience),
            strengths: normalizeArray(resumeData?.strengths),
            weaknesses: normalizeArray(resumeData?.weaknesses),
            missingSkills: normalizeArray(resumeData?.missingSkills),
            suggestedRole: resumeData?.suggestedRole || "Software Developer",
            score: typeof resumeData?.score === "number" ? resumeData.score : Number(resumeData?.score) || 75,
            recommendations: normalizeArray(resumeData?.recommendations),
        };

        let resume = await Resume.findOne({ userId });

        if (resume) {
            Object.assign(resume, {
                ...sanitizedData,
                extractedText: resumeText,
            });
            await resume.save();
        } else {
            resume = await Resume.create({
                userId,
                extractedText: resumeText,
                ...sanitizedData,
            });
        }

        try {
            await redis.set(`resume:${userId}`, JSON.stringify(resume));
        } catch (redisErr) {
            console.warn("Redis set cache warning:", redisErr.message);
        }

        if (file?.path && fs.existsSync(file.path)) {
            try {
                fs.unlinkSync(file.path);
            } catch (unlinkErr) {
                console.warn("Unlink warning:", unlinkErr.message);
            }
        }

        return res.status(200).json({
            success: true,
            message: "Resume analyzed successfully",
            data: resume,
        });

    } catch (error) {
        console.error("Upload Resume Error:", error);

        if (file?.path && fs.existsSync(file.path)) {
            try {
                fs.unlinkSync(file.path);
            } catch (unlinkErr) {
                console.warn("Unlink error in catch block:", unlinkErr.message);
            }
        }

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to analyze resume",
        });
    }
};

export const getResume = async (req, res) => {
    try {
        const userId = req.headers["x-user-id"];
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "UserId is required",
            });
        }

        try {
            const cache = await redis.get(`resume:${userId}`);
            if (cache) {
                return res.status(200).json({
                    success: true,
                    source: "redis",
                    data: JSON.parse(cache),
                });
            }
        } catch (redisErr) {
            console.warn("Redis get cache warning:", redisErr.message);
        }

        const resume = await Resume.findOne({ userId });

        if (!resume) {
            return res.status(404).json({
                success: false,
                message: "resume not found",
            });
        }

        try {
            await redis.set(`resume:${userId}`, JSON.stringify(resume));
        } catch (redisErr) {
            console.warn("Redis set cache warning:", redisErr.message);
        }

        return res.status(200).json({
            success: true,
            source: "mongoDb",
            data: resume,
        });

    } catch (error) {
        console.error("Get Resume Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
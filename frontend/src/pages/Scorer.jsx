import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from "motion/react"
import { FiAlertCircle, FiTrendingUp, FiUploadCloud, FiUser, FiZap, FiCheckCircle } from 'react-icons/fi'
import api from '../utils/axios'
import { useDispatch, useSelector } from 'react-redux'
import { setResume } from '../redux/resumeSlice'
import { PolarAngleAxis, RadialBar, RadialBarChart } from "recharts"
import { useCoins } from '../apis/user.api'

const ScoreRing = ({ score = 0 }) => {
    const numericScore = Number(score) || 0;
    const color = numericScore >= 75 ? "#7c3aed" : numericScore >= 50 ? "#f59e0b" : "#ef4444";
    
    return (
        <div className="relative flex items-center justify-center">
            <RadialBarChart
                width={110}
                height={110}
                cx={55}
                cy={55}
                innerRadius={40}
                outerRadius={53}
                startAngle={90}
                endAngle={-270}
                data={[{ value: numericScore, fill: color }]}
                barSize={8}
            >
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar background={{ fill: "rgba(255,255,255,0.12)" }} dataKey="value" cornerRadius={8} />
            </RadialBarChart>

            <div className="absolute flex items-center">
                <span className="text-lg font-bold text-white leading-none">{numericScore}</span>
                <span className="text-[9px] text-gray-400 mt-0.5">/100</span>
            </div>
        </div>
    );
};

const Tag = ({ text, color = "purple" }) => {
    const styles = {
        purple: "bg-purple-500/10 text-purple-300 border-purple-500/20",
        red: "bg-red-500/10 text-red-300 border-red-500/20",
        green: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
        yellow: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    };
    return (
        <span className={`text-[11px] px-2.5 py-1 rounded-md border font-medium ${styles[color] || styles.purple}`}>
            {text}
        </span>
    );
};

const Navbar = ({ label }) => {
    const navigate = useNavigate();
    return (
        <motion.nav
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="fixed inset-x-0 top-0 z-20 border-b border-black/8 bg-white/80 backdrop-blur-xl"
        >
            <div className="mx-auto flex h-12 max-w-7xl items-center justify-start px-3 sm:px-5">
                <div 
                    onClick={() => navigate("/dashboard")}
                    className="flex cursor-pointer items-center gap-1.5"
                >
                    <span className="text-sm font-extrabold sm:text-base text-[#0A0A0A]">CareerForage AI</span>
                    <span className="hidden rounded bg-black/5 px-1.5 py-0.5 text-[10px] text-black/50 sm:block">{label}</span>
                </div>
            </div>
        </motion.nav>
    );
};

function Scorer({ setUser }) {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const { resume } = useSelector((state) => state.resume);

    useEffect(() => {
        const fetchResume = async () => {
            try {
                const res = await api.get("/api/resume/get-resume");
                if (res?.data?.data) {
                    dispatch(setResume(res.data.data));
                }
            } catch {
                // User has not uploaded/analyzed a resume yet
            }
        };
        if (!resume) {
            fetchResume();
        }
    }, [dispatch, resume]);


    const uploadResume = async () => {
        if (!file) {
            alert("Please select a PDF file");
            return;
        }
        try {
            setLoading(true);

            try {
                const coinResponse = await useCoins({ coins: 10, action: "resume-scorer" });
                if (setUser && coinResponse?.interviewCoin !== undefined) {
                    setUser((prev) => ({
                        ...prev,
                        interviewCoin: coinResponse.interviewCoin,
                    }));
                }
            } catch (coinErr) {
                setLoading(false);
                const coinMsg = coinErr?.response?.data?.message || "Failed to use coins. Please check your coin balance or sign in again.";
                alert(coinMsg);
                return;
            }



            const formData = new FormData();
            formData.append("resume", file);

            const response = await api.post("/api/resume/upload", formData);

            if (response?.data?.data) {
                dispatch(setResume(response.data.data));
            }
            setLoading(false);

        } catch (error) {
            console.error("Resume Upload Error:", error);
            const errorMsg = error?.response?.data?.message || "Upload failed. Please ensure the PDF has readable text and try again.";
            alert(errorMsg);
            setLoading(false);
        }
    };

    // Scorer Analysis Result Section
    if (resume) {
        const score = Number(resume.score) || 0;
        const scoreLabel = score >= 75 ? "Strong" : score >= 50 ? "Average" : "Needs Work";

        return (
            <div className="min-h-screen bg-white text-[#0A0A0A]">
                <Navbar label="Resume Scorer" />

                <section className="max-w-6xl mx-auto px-3 pt-18 sm:pt-20 pb-8 space-y-3.5">
                    {/* Header */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-[10px] text-black/40 tracking-widest uppercase mb-0.5">Resume Analysis</p>
                            <h2 className="text-lg font-bold">{resume?.name || "Candidate"}</h2>
                        </div>
                        <button 
                            onClick={() => dispatch(setResume(null))}
                            className="text-[10px] sm:text-xs text-black/50 hover:text-[#0A0A0A] border border-black/15 hover:border-black/35 px-2.5 py-1 rounded-lg transition-colors"
                        >
                            Re-upload
                        </button>
                    </div>

                    {/* Score Card */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.05 }}
                        className="relative overflow-hidden bg-[#000000]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-4 sm:flex-row shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent pointer-events-none" />

                        <div className="relative">
                            <ScoreRing score={score} />
                        </div>
                        <div className="relative">
                            <p className="text-white/50 text-xs mb-0.5">Resume Score</p>
                            <p className="text-lg sm:text-xl font-bold mb-1.5 text-white">
                                {scoreLabel}
                            </p>
                            <div className="flex items-center gap-1.5">
                                <FiUser className="text-purple-400 text-xs" />
                                <span className="text-xs text-purple-300">{resume?.suggestedRole || "Software Engineer"}</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Strengths & Weaknesses Grid */}
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {/* Strengths */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.07 }}
                            className="relative overflow-hidden bg-[#000000]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent pointer-events-none" />
                            <div className="relative flex items-center gap-1.5 mb-2.5">
                                <FiCheckCircle className="text-emerald-400" size={14} />
                                <span className="text-xs font-semibold text-white">Strengths</span>
                            </div>

                            <div className="relative flex flex-wrap gap-1.5">
                                {Array.isArray(resume?.strengths) && resume.strengths.length > 0 ? (
                                    resume.strengths.map((s, idx) => (
                                        <Tag key={`strength-${idx}`} text={s} color="green" />
                                    ))
                                ) : (
                                    <p className="text-xs text-white/40">No specific strengths recorded.</p>
                                )}
                            </div>
                        </motion.div>

                        {/* Weaknesses */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.07 }}
                            className="relative overflow-hidden bg-[#000000]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent pointer-events-none" />
                            <div className="relative flex items-center gap-1.5 mb-2.5">
                                <FiAlertCircle className="text-amber-400" size={14} />
                                <span className="text-xs font-semibold text-white">Weaknesses</span>
                            </div>

                            <div className="relative flex flex-wrap gap-1.5">
                                {Array.isArray(resume?.weaknesses) && resume.weaknesses.length > 0 ? (
                                    resume.weaknesses.map((w, idx) => (
                                        <Tag key={`weakness-${idx}`} text={w} color="yellow" />
                                    ))
                                ) : (
                                    <p className="text-xs text-white/40">No major weaknesses identified.</p>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* Missing Skills */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.09 }}
                        className="relative overflow-hidden bg-[#000000]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent pointer-events-none" />
                        <div className="relative flex items-center gap-1.5 mb-2.5">
                            <FiZap className="text-red-400" size={14} />
                            <span className="text-xs font-semibold text-white">Missing Skills</span>
                        </div>

                        <div className="relative flex flex-wrap gap-1.5">
                            {Array.isArray(resume?.missingSkills) && resume.missingSkills.length > 0 ? (
                                resume.missingSkills.map((m, idx) => (
                                    <Tag key={`missing-${idx}`} text={m} color="red" />
                                ))
                            ) : (
                                <p className="text-xs text-white/40">No missing skills detected for this profile.</p>
                            )}
                        </div>
                    </motion.div>

                    {/* Recommendations List */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.12 }}
                        className="relative overflow-hidden bg-[#000000]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent pointer-events-none" />
                        <div className="relative flex items-center gap-1.5 mb-3">
                            <FiTrendingUp className="text-purple-400" size={14} />
                            <span className="text-xs font-semibold text-white">Recommendations</span>
                        </div>

                        <div className="relative space-y-2">
                            {Array.isArray(resume?.recommendations) && resume.recommendations.length > 0 ? (
                                resume.recommendations.map((r, idx) => (
                                    <div key={`rec-${idx}`} className="flex items-start gap-2.5">
                                        <span className="flex-shrink-0 w-4 h-4 rounded-full bg-white/10 text-white/60 text-[10px] flex items-center justify-center font-medium mt-0.5">
                                            {idx + 1}
                                        </span>
                                        <p className="text-xs text-white/80 leading-relaxed">{r}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-white/40">No recommendations at this time.</p>
                            )}
                        </div>
                    </motion.div>
                </section>
            </div>
        );
    }

    // Resume Upload Section (Initial State)
    return (
        <div className="min-h-screen bg-white text-[#0A0A0A]">
            <Navbar label="Resume Scorer" />

            <section className="flex min-h-screen items-center justify-center px-3 pt-18 pb-6">
                <motion.div
                    initial={{ y: 60, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.05 }}
                    className="relative w-full max-w-sm rounded-3xl overflow-hidden bg-[#000000]/90 backdrop-blur-2xl border border-white/10 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.25)] sm:p-6"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent pointer-events-none" />

                    <p className="relative text-[10px] text-white/40 tracking-widest uppercase mb-1.5">
                        Step 1 of 2
                    </p>

                    <div className="relative w-full h-1 bg-white/10 rounded-full mb-4">
                        <div className="h-1 bg-white rounded-full w-1/2" />
                    </div>

                    <h2 className="relative text-lg font-bold mb-1 text-white">
                        Upload Your Resume
                    </h2>
                    <p className="relative text-white/45 text-xs mb-4">
                        We&apos;ll score it and give you actionable feedback
                    </p>

                    <label className={`relative flex flex-col items-center justify-center w-full h-40 sm:h-48 rounded-2xl border-2 border-dashed cursor-pointer transition-colors ${
                        file
                            ? "border-white/40 bg-white/[0.06]"
                            : "border-white/15 bg-white/[0.03] hover:border-white/30"
                    }`}>
                        <FiUploadCloud className={`text-4xl sm:text-5xl mb-2.5 ${file ? "text-white" : "text-white/30"}`} />
                        <p className="text-xs font-medium text-white/80 text-center px-3 truncate max-w-full">
                            {file ? file.name : "Click or drag PDF here"}
                        </p>
                        <p className="text-[10px] text-white/35 mt-1">PDF only · Max 20MB</p>

                        <input 
                            type="file"
                            accept=".pdf"
                            className="hidden"
                            onChange={(e) => setFile(e.target.files[0])}
                        />
                    </label>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={uploadResume}
                        disabled={!file || loading} 
                        className="relative mt-4 w-full h-10 rounded-xl font-semibold text-xs bg-white text-[#0A0A0A] shadow-[0_4px_14px_rgba(255,255,255,0.15)] hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                    >
                        {loading ? "Analyzing..." : "Analyze Resume →"}
                    </motion.button>
                </motion.div>
            </section>
        </div>
    );
}

export default Scorer;

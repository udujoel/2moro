"use client";

import { useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TopBar } from "@/components/top-bar";
import { useUser } from "@/components/user-provider";
import { motion } from "framer-motion";
import { ArrowLeft, DollarSign, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveFinancialSnapshot, generateFinancialAnalysis } from "@/app/actions/compass";

export default function FinancialsPage() {
    const { user } = useUser();
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        debt: "",
        liabilities: "",
        assets: "",
        cash: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        // Only allow numbers
        if (value === "" || /^\d+$/.test(value)) {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsSaving(true);

        // Save snapshot
        const saveResult = await saveFinancialSnapshot(user.id, {
            debt: parseInt(formData.debt) || 0,
            liabilities: parseInt(formData.liabilities) || 0,
            assets: parseInt(formData.assets) || 0,
            cash: parseInt(formData.cash) || 0,
        });

        if (saveResult.success) {
            // Generate AI analysis
            await generateFinancialAnalysis(user.id);

            // Redirect back to Compass
            setTimeout(() => {
                router.push("/compass");
            }, 1000);
        } else {
            alert("Failed to save financial data. Please try again.");
            setIsSaving(false);
        }
    };

    const isFormValid =
        formData.debt !== "" ||
        formData.liabilities !== "" ||
        formData.assets !== "" ||
        formData.cash !== "";

    return (
        <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden">
            <Sidebar className="hidden md:flex shrink-0 z-30" />

            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-muted/10">
                <TopBar title="Update Financials" />

                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    <Link
                        href="/compass"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Compass
                    </Link>

                    <div className="max-w-2xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-card border border-border rounded-3xl p-8 md:p-12 shadow-xl"
                        >
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <DollarSign className="w-8 h-8 text-green-500" />
                                </div>
                                <h1 className="text-3xl font-bold mb-2">Financial Snapshot</h1>
                                <p className="text-muted-foreground">
                                    Enter your current financial information to get AI-powered insights
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        💳 Total Debt
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                                            $
                                        </span>
                                        <input
                                            type="text"
                                            name="debt"
                                            value={formData.debt}
                                            onChange={handleChange}
                                            placeholder="0"
                                            className="w-full pl-8 pr-4 py-3 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Credit cards, student loans, personal loans, etc.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        🏠 Liabilities
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                                            $
                                        </span>
                                        <input
                                            type="text"
                                            name="liabilities"
                                            value={formData.liabilities}
                                            onChange={handleChange}
                                            placeholder="0"
                                            className="w-full pl-8 pr-4 py-3 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Mortgage, car payments, other recurring obligations
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        🏦 Total Assets
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                                            $
                                        </span>
                                        <input
                                            type="text"
                                            name="assets"
                                            value={formData.assets}
                                            onChange={handleChange}
                                            placeholder="0"
                                            className="w-full pl-8 pr-4 py-3 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Property value, investments, retirement accounts, etc.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        💰 Cash on Hand
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                                            $
                                        </span>
                                        <input
                                            type="text"
                                            name="cash"
                                            value={formData.cash}
                                            onChange={handleChange}
                                            placeholder="0"
                                            className="w-full pl-8 pr-4 py-3 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Checking, savings, emergency fund
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={!isFormValid || isSaving}
                                    className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            Save & Get AI Analysis
                                        </>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                </main>
            </div>
        </div>
    );
}

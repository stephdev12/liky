"use client";

import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
	const [theme, setTheme] = useState<"light" | "dark">("light");
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		// Check existing attribute or system preference or saved localStorage
		const savedTheme = localStorage.getItem("likyai-theme") as "light" | "dark" | null;
		if (savedTheme) {
			setTheme(savedTheme);
			document.documentElement.setAttribute("data-theme", savedTheme);
			document.documentElement.classList.toggle("dark", savedTheme === "dark");
		} else {
			const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
			const initialTheme = prefersDark ? "dark" : "light";
			setTheme(initialTheme);
			document.documentElement.setAttribute("data-theme", initialTheme);
			document.documentElement.classList.toggle("dark", initialTheme === "dark");
		}
	}, []);

	const toggleTheme = () => {
		const nextTheme = theme === "light" ? "dark" : "light";
		setTheme(nextTheme);
		localStorage.setItem("likyai-theme", nextTheme);
		document.documentElement.setAttribute("data-theme", nextTheme);
		document.documentElement.classList.toggle("dark", nextTheme === "dark");
	};

	if (!mounted) {
		return (
			<button
				aria-label="Changer le thème"
				className={cn(
					"size-8 rounded-full border border-border/80 flex items-center justify-center bg-card text-muted-foreground transition-colors",
					className
				)}
			>
				<Sun className="size-4" />
			</button>
		);
	}

	return (
		<button
			aria-label={`Passer au mode ${theme === "light" ? "sombre" : "clair"}`}
			onClick={toggleTheme}
			className={cn(
				"relative size-8 rounded-full border border-border/80 flex items-center justify-center bg-card/80 backdrop-blur-sm text-foreground hover:bg-muted transition-colors overflow-hidden cursor-pointer",
				className
			)}
		>
			<AnimatePresence mode="wait" initial={false}>
				{theme === "dark" ? (
					<motion.div
						key="moon"
						initial={{ y: -16, opacity: 0, rotate: -45 }}
						animate={{ y: 0, opacity: 1, rotate: 0 }}
						exit={{ y: 16, opacity: 0, rotate: 45 }}
						transition={{ duration: 0.25, ease: "easeOut" }}
						className="flex items-center justify-center text-[var(--lime)]"
					>
						<Moon className="size-4 fill-[var(--lime)]/20" />
					</motion.div>
				) : (
					<motion.div
						key="sun"
						initial={{ y: -16, opacity: 0, rotate: -45 }}
						animate={{ y: 0, opacity: 1, rotate: 0 }}
						exit={{ y: 16, opacity: 0, rotate: 45 }}
						transition={{ duration: 0.25, ease: "easeOut" }}
						className="flex items-center justify-center text-amber-500"
					>
						<Sun className="size-4" />
					</motion.div>
				)}
			</AnimatePresence>
		</button>
	);
}

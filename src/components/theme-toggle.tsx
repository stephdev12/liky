"use client";

import React, { useEffect, useState } from "react";
import { CoolIcon } from "@/components/icons/coolicon";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
	const [theme, setTheme] = useState<"light" | "dark">("light");
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		// Check existing data-theme attribute on documentElement or localStorage
		const currentAttr = document.documentElement.getAttribute("data-theme") as "light" | "dark" | null;
		const savedTheme = (localStorage.getItem("likyai-theme") as "light" | "dark" | null) || currentAttr;
		
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

		// Listen for global theme changes across instances & pages
		const handleThemeChange = (e: Event) => {
			const customEvent = e as CustomEvent<"light" | "dark">;
			if (customEvent.detail) {
				setTheme(customEvent.detail);
			}
		};

		// Listen for multi-tab localStorage changes
		const handleStorage = (e: StorageEvent) => {
			if (e.key === "likyai-theme" && (e.newValue === "light" || e.newValue === "dark")) {
				setTheme(e.newValue);
				document.documentElement.setAttribute("data-theme", e.newValue);
				document.documentElement.classList.toggle("dark", e.newValue === "dark");
			}
		};

		window.addEventListener("likyai-theme-change", handleThemeChange);
		window.addEventListener("storage", handleStorage);

		return () => {
			window.removeEventListener("likyai-theme-change", handleThemeChange);
			window.removeEventListener("storage", handleStorage);
		};
	}, []);

	const toggleTheme = () => {
		const nextTheme = theme === "light" ? "dark" : "light";
		setTheme(nextTheme);
		localStorage.setItem("likyai-theme", nextTheme);
		document.documentElement.setAttribute("data-theme", nextTheme);
		document.documentElement.classList.toggle("dark", nextTheme === "dark");
		window.dispatchEvent(new CustomEvent("likyai-theme-change", { detail: nextTheme }));
	};

	if (!mounted) {
		return (
			<button
				aria-label="Changer le thème"
				className={cn(
					"size-8 rounded-full border border-[var(--line)] flex items-center justify-center bg-[var(--field)] text-[var(--mute)] transition-colors",
					className
				)}
			>
				<CoolIcon name="sun" size={16} duotone secondaryColor="currentColor" />
			</button>
		);
	}

	return (
		<button
			aria-label={`Passer au mode ${theme === "light" ? "sombre" : "clair"}`}
			onClick={toggleTheme}
			className={cn(
				"relative size-8 rounded-full border border-[var(--line)] flex items-center justify-center bg-[var(--field)] text-[var(--ink)] hover:bg-[var(--hover)] transition-colors overflow-hidden cursor-pointer",
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
						className="flex items-center justify-center text-emerald-400"
					>
						<CoolIcon name="moon" size={16} duotone secondaryColor="currentColor" />
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
						<CoolIcon name="sun" size={16} duotone secondaryColor="currentColor" />
					</motion.div>
				)}
			</AnimatePresence>
		</button>
	);
}

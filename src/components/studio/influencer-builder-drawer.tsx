"use client";

import React, { useState } from "react";
import { CoolIcon } from "@/components/icons/coolicon";
import { cn } from "@/lib/utils";

interface InfluencerBuilderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCharacterCreated: (character: {
    id: string;
    name: string;
    avatarUrl: string;
    summary: string;
  }) => void;
}

export function InfluencerBuilderDrawer({
  isOpen,
  onClose,
  onCharacterCreated,
}: InfluencerBuilderDrawerProps) {
  const [mode, setMode] = useState<"scratch" | "me">("scratch");
  const [characterName, setCharacterName] = useState("Amina");
  const [isGenerating, setIsGenerating] = useState(false);

  // Attributs modulaires
  const [characterType, setCharacterType] = useState("Average");
  const [gender, setGender] = useState("Female");
  const [build, setBuild] = useState("Athletic");
  const [height, setHeight] = useState("Average");
  const [proportions, setProportions] = useState("Long limbs");
  const [headShape, setHeadShape] = useState("Standard");
  const [neck, setNeck] = useState("Standard");
  const [hairstyle, setHairstyle] = useState("Bob");
  const [hairColor, setHairColor] = useState("Jet black");
  const [eyeShape, setEyeShape] = useState("Almond");
  const [eyeColor, setEyeColor] = useState("Brown");
  const [skinColor, setSkinColor] = useState("Olive");
  const [features, setFeatures] = useState<string[]>(["Dimples"]);
  const [facialHair, setFacialHair] = useState("Clean");
  const [distinctive, setDistinctive] = useState<string[]>([]);
  const [accessories, setAccessories] = useState("None");
  const [ethnicity, setEthnicity] = useState("African");
  const [age, setAge] = useState("Adult");
  const [stylePreset, setStylePreset] = useState("Retro");
  const [promptEnabled, setPromptEnabled] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [freeGens, setFreeGens] = useState(true);

  if (!isOpen) return null;

  const handleShuffle = () => {
    const types = ["Average", "Bold", "Extreme", "Insect"];
    const genders = ["Female", "Male", "Trans man", "Trans woman"];
    const builds = ["Slim", "Athletic", "Muscular", "Curvy"];
    const heights = ["Average", "Tall", "Very tall"];
    const eyes = ["Black", "Brown", "Hazel", "Green", "Blue"];
    const hairs = ["Bob", "Bald", "Buzz cut", "Bowl cut", "Afro", "Wavy"];
    const hairColors = ["Jet black", "Dark brown", "Chestnut", "Ginger", "Blonde"];
    const ethnic = ["African", "Asian", "European", "Indian"];
    const styles = ["Retro", "Sporty", "Streetwear", "Luxury", "Casual"];

    setCharacterType(types[Math.floor(Math.random() * types.length)]);
    setGender(genders[Math.floor(Math.random() * genders.length)]);
    setBuild(builds[Math.floor(Math.random() * builds.length)]);
    setHeight(heights[Math.floor(Math.random() * heights.length)]);
    setEyeColor(eyes[Math.floor(Math.random() * eyes.length)]);
    setHairstyle(hairs[Math.floor(Math.random() * hairs.length)]);
    setHairColor(hairColors[Math.floor(Math.random() * hairColors.length)]);
    setEthnicity(ethnic[Math.floor(Math.random() * ethnic.length)]);
    setStylePreset(styles[Math.floor(Math.random() * styles.length)]);
  };

  const handleCreate = async () => {
    setIsGenerating(true);

    const summary = `${gender} ${ethnicity}, ${age}, ${build} (${height}), ${hairstyle} (${hairColor}), ${eyeShape} ${eyeColor} eyes, ${skinColor} skin, ${stylePreset} style`;
    const promptCompiled = promptEnabled && customPrompt.trim()
      ? `${summary}. ${customPrompt}`
      : summary;

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "image",
          model: "ai_influencer",
          prompt: `High-end multi-angle photorealistic influencer master portrait: ${promptCompiled}, 8k studio lighting, photoreal skin texture`,
          aspectRatio: "9:16",
          creditsCost: 8,
        }),
      });

      const data = await res.json();
      const avatarUrl = data.resultUrl || "/assets/studios/studio-ugc.jpg";

      onCharacterCreated({
        id: `inf_${Date.now()}`,
        name: characterName.toLowerCase().replace(/[^a-z0-9]/g, "_") || "influencer",
        avatarUrl,
        summary,
      });

      onClose();
    } catch {
      onCharacterCreated({
        id: `inf_${Date.now()}`,
        name: characterName.toLowerCase().replace(/[^a-z0-9]/g, "_") || "influencer",
        avatarUrl: "/assets/studios/studio-ugc.jpg",
        summary,
      });
      onClose();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer Container (Responsive: bottom sheet on mobile, right drawer on desktop) */}
      <div className="fixed inset-x-0 bottom-0 sm:inset-y-0 sm:right-0 sm:left-auto w-full sm:w-[500px] h-[92vh] sm:h-screen bg-[#111110] text-[#F8F8F5] border-t sm:border-t-0 sm:border-l border-white/10 shadow-2xl z-50 flex flex-col justify-between overflow-hidden animate-in slide-in-from-bottom sm:slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
          <div className="w-8" />
          <h2 className="font-heading text-[16px] font-semibold text-white tracking-tight">
            Create Influencer
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <CoolIcon name="close-md" size={16} duotone={false} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-6 text-[13px] scrollbar-thin">
          
          {/* Hero Banner: AI INFLUENCER */}
          <div className="relative w-full h-32 rounded-2xl overflow-hidden bg-gradient-to-r from-[#1c1c1a] via-[#2a2a26] to-[#1c1c1a] border border-white/10 flex items-center justify-between px-6 shadow-inner">
            <div className="w-20 h-28 rounded-xl overflow-hidden bg-black/40 border border-white/10 flex items-end justify-center shadow-lg transform -rotate-2">
              <div className="w-16 h-24 bg-gradient-to-t from-[#D8FF64]/20 to-transparent flex items-center justify-center">
                <CoolIcon name="user-01" size={40} duotone secondaryColor="#D8FF64" className="text-white/80" />
              </div>
            </div>

            <div className="text-center px-2">
              <span className="font-heading text-[22px] sm:text-[24px] font-extrabold tracking-tight text-[#D8FF64] drop-shadow-[0_0_15px_rgba(216,255,100,0.3)] block">
                AI INFLUENCER
              </span>
              <span className="text-[11px] font-medium text-white/60 tracking-wider uppercase block mt-0.5">
                Consistent Character Engine
              </span>
            </div>

            <div className="w-20 h-28 rounded-xl overflow-hidden bg-black/40 border border-white/10 flex items-end justify-center shadow-lg transform rotate-2">
              <div className="w-16 h-24 bg-gradient-to-t from-emerald-500/20 to-transparent flex items-center justify-center">
                <CoolIcon name="user-01" size={40} duotone secondaryColor="#34D399" className="text-white/80" />
              </div>
            </div>
          </div>

          {/* Mode Switch: Build from me vs Build from scratch */}
          <div className="p-1 rounded-full bg-white/5 border border-white/10 grid grid-cols-2 text-[12px] font-medium">
            <button
              type="button"
              onClick={() => setMode("me")}
              className={cn(
                "py-2 rounded-full transition-all cursor-pointer text-center",
                mode === "me"
                  ? "bg-white text-black font-semibold shadow-md"
                  : "text-white/60 hover:text-white"
              )}
            >
              Build from me
            </button>
            <button
              type="button"
              onClick={() => setMode("scratch")}
              className={cn(
                "py-2 rounded-full transition-all cursor-pointer text-center",
                mode === "scratch"
                  ? "bg-white text-black font-semibold shadow-md"
                  : "text-white/60 hover:text-white"
              )}
            >
              Build from scratch
            </button>
          </div>

          {/* Nom du personnage */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-white/40 block mb-1.5">
              Avatar Handle / Name (@)
            </label>
            <input
              type="text"
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
              placeholder="amina, thomas, sarah..."
              className="w-full h-9 px-3 rounded-xl bg-white/5 border border-white/10 text-white text-[13px] outline-none focus:border-[#D8FF64]"
            />
          </div>

          {mode === "me" ? (
            <div className="p-6 rounded-2xl border-2 border-dashed border-white/20 bg-white/5 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#D8FF64]/10 text-[#D8FF64] flex items-center justify-center mx-auto">
                <CoolIcon name="folder-upload" size={24} duotone />
              </div>
              <div>
                <span className="text-[14px] font-medium text-white block">
                  Déposez votre selfie ou portrait de face
                </span>
                <p className="text-[11.5px] text-white/50 max-w-xs mx-auto mt-1">
                  Photo claire, regard caméra pour extraire vos traits et verrouiller la cohérence de votre jumeau numérique.
                </p>
              </div>
              <button
                type="button"
                className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-[12px] font-medium transition-colors cursor-pointer"
              >
                Sélectionner une photo
              </button>
            </div>
          ) : (
            <>
              {/* 1. Character type */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-white/50 block mb-2.5">
                  Character type
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: "Average", label: "Average", img: "/assets/influencer/type_average.jpg" },
                    { id: "Bold", label: "Bold", img: "/assets/influencer/type_bold.jpg" },
                    { id: "Extreme", label: "Extreme", img: "/assets/influencer/type_extreme.jpg" },
                    { id: "Insect", label: "Insect", img: "/assets/influencer/type_insect.jpg" },
                  ].map((item) => {
                    const active = characterType === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setCharacterType(item.id)}
                        className={cn(
                          "flex flex-col items-center p-1.5 rounded-2xl border transition-all cursor-pointer group text-center overflow-hidden",
                          active
                            ? "bg-[#D8FF64]/10 border-[#D8FF64] ring-1 ring-[#D8FF64]"
                            : "bg-[#181817] border-white/10 hover:border-white/20 hover:bg-white/5"
                        )}
                      >
                        <div className="w-full aspect-square rounded-xl mb-1.5 overflow-hidden bg-black/40 border border-white/10">
                          <img
                            src={item.img}
                            alt={item.label}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <span className={cn("text-[11px] font-medium truncate w-full px-0.5", active ? "text-[#D8FF64] font-semibold" : "text-white/70")}>
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Gender */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-white/50 block mb-2.5">
                  Gender
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: "Female", label: "Female", img: "/assets/influencer/gender_female.jpg" },
                    { id: "Male", label: "Male", img: "/assets/influencer/gender_male.jpg" },
                    { id: "Trans man", label: "Trans man", img: "/assets/influencer/gender_transman.jpg" },
                    { id: "Trans woman", label: "Trans woman", img: "/assets/influencer/gender_transwoman.jpg" },
                  ].map((item) => {
                    const active = gender === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setGender(item.id)}
                        className={cn(
                          "flex flex-col items-center p-1.5 rounded-2xl border transition-all cursor-pointer group text-center overflow-hidden",
                          active
                            ? "bg-[#D8FF64]/10 border-[#D8FF64] ring-1 ring-[#D8FF64]"
                            : "bg-[#181817] border-white/10 hover:border-white/20 hover:bg-white/5"
                        )}
                      >
                        <div className="w-full aspect-square rounded-xl mb-1.5 overflow-hidden bg-black/40 border border-white/10">
                          <img
                            src={item.img}
                            alt={item.label}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <span className={cn("text-[11px] font-medium truncate w-full px-0.5", active ? "text-[#D8FF64] font-semibold" : "text-white/70")}>
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Build */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-white/50 block mb-2.5">
                  Build
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: "Slim", label: "Slim", img: "/assets/influencer/build_slim.jpg" },
                    { id: "Athletic", label: "Athletic", img: "/assets/influencer/build_athletic.jpg" },
                    { id: "Muscular", label: "Muscular", img: "/assets/influencer/build_muscular.jpg" },
                    { id: "Curvy", label: "Curvy", img: "/assets/influencer/build_curvy.jpg" },
                  ].map((item) => {
                    const active = build === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setBuild(item.id)}
                        className={cn(
                          "flex flex-col items-center p-1.5 rounded-2xl border transition-all cursor-pointer group text-center overflow-hidden",
                          active
                            ? "bg-[#D8FF64]/10 border-[#D8FF64] ring-1 ring-[#D8FF64]"
                            : "bg-[#181817] border-white/10 hover:border-white/20 hover:bg-white/5"
                        )}
                      >
                        <div className="w-full aspect-square rounded-xl mb-1.5 overflow-hidden bg-black/40 border border-white/10">
                          <img
                            src={item.img}
                            alt={item.label}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <span className={cn("text-[11px] font-medium truncate w-full px-0.5", active ? "text-[#D8FF64] font-semibold" : "text-white/70")}>
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Height & Proportions */}
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-white/50 block mb-2">
                    Height
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "Average", label: "Average", img: "/assets/influencer/height_average.jpg" },
                      { id: "Tall", label: "Tall", img: "/assets/influencer/height_tall.jpg" },
                      { id: "Very tall", label: "Very tall", img: "/assets/influencer/height_verytall.jpg" },
                    ].map((h) => {
                      const active = height === h.id;
                      return (
                        <button
                          key={h.id}
                          type="button"
                          onClick={() => setHeight(h.id)}
                          className={cn(
                            "flex flex-col items-center p-1.5 rounded-2xl border transition-all cursor-pointer group text-center overflow-hidden",
                            active
                              ? "bg-[#D8FF64]/10 border-[#D8FF64] ring-1 ring-[#D8FF64]"
                              : "bg-[#181817] border-white/10 hover:border-white/20 hover:bg-white/5"
                          )}
                        >
                          <div className="w-full aspect-square rounded-xl mb-1.5 overflow-hidden bg-black/40 border border-white/10">
                            <img
                              src={h.img}
                              alt={h.label}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <span className={cn("text-[11px] font-medium truncate w-full px-0.5", active ? "text-[#D8FF64] font-semibold" : "text-white/70")}>
                            {h.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-white/50 block mb-2">
                    Proportions
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: "Long limbs", label: "Long limbs", img: "/assets/influencer/prop_longlimbs.jpg" },
                      { id: "Short legs", label: "Short legs", img: "/assets/influencer/prop_shortlegs.jpg" },
                      { id: "Broad shoulders", label: "Broad", img: "/assets/influencer/prop_broadshoulders.jpg" },
                      { id: "Tiny waist", label: "Tiny waist", img: "/assets/influencer/prop_tinywaist.jpg" },
                    ].map((p) => {
                      const active = proportions === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setProportions(p.id)}
                          className={cn(
                            "flex flex-col items-center p-1.5 rounded-2xl border transition-all cursor-pointer group text-center overflow-hidden",
                            active
                              ? "bg-[#D8FF64]/10 border-[#D8FF64] ring-1 ring-[#D8FF64]"
                              : "bg-[#181817] border-white/10 hover:border-white/20 hover:bg-white/5"
                          )}
                        >
                          <div className="w-full aspect-square rounded-xl mb-1.5 overflow-hidden bg-black/40 border border-white/10">
                            <img
                              src={p.img}
                              alt={p.label}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <span className={cn("text-[10px] font-medium truncate w-full px-0.5", active ? "text-[#D8FF64] font-semibold" : "text-white/70")}>
                            {p.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 5. Head shape & Neck */}
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-white/50 block mb-2">
                    Head shape
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: "Standard", label: "Standard", img: "/assets/influencer/head_standard.jpg" },
                      { id: "Long", label: "Long", img: "/assets/influencer/head_long.jpg" },
                      { id: "Tiny", label: "Tiny", img: "/assets/influencer/head_tiny.jpg" },
                      { id: "High forehead", label: "High", img: "/assets/influencer/head_highforehead.jpg" },
                    ].map((hs) => (
                      <button
                        key={hs.id}
                        type="button"
                        onClick={() => setHeadShape(hs.id)}
                        className={cn(
                          "flex flex-col items-center p-1.5 rounded-2xl border transition-all cursor-pointer group text-center overflow-hidden",
                          headShape === hs.id
                            ? "bg-[#D8FF64]/10 border-[#D8FF64] ring-1 ring-[#D8FF64]"
                            : "bg-[#181817] border-white/10 hover:border-white/20 hover:bg-white/5"
                        )}
                      >
                        <div className="w-full aspect-square rounded-xl mb-1.5 overflow-hidden bg-black/40 border border-white/10">
                          <img
                            src={hs.img}
                            alt={hs.label}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <span className={cn("text-[10px] font-medium truncate w-full px-0.5", headShape === hs.id ? "text-[#D8FF64] font-semibold" : "text-white/70")}>
                          {hs.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-white/50 block mb-2">
                    Neck
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: "Standard", label: "Standard", img: "/assets/influencer/neck_standard.jpg" },
                      { id: "Column", label: "Column", img: "/assets/influencer/neck_column.jpg" },
                      { id: "Long", label: "Long", img: "/assets/influencer/neck_long.jpg" },
                      { id: "Short", label: "Short", img: "/assets/influencer/neck_short.jpg" },
                    ].map((n) => (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => setNeck(n.id)}
                        className={cn(
                          "flex flex-col items-center p-1.5 rounded-2xl border transition-all cursor-pointer group text-center overflow-hidden",
                          neck === n.id
                            ? "bg-[#D8FF64]/10 border-[#D8FF64] ring-1 ring-[#D8FF64]"
                            : "bg-[#181817] border-white/10 hover:border-white/20 hover:bg-white/5"
                        )}
                      >
                        <div className="w-full aspect-square rounded-xl mb-1.5 overflow-hidden bg-black/40 border border-white/10">
                          <img
                            src={n.img}
                            alt={n.label}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <span className={cn("text-[10px] font-medium truncate w-full px-0.5", neck === n.id ? "text-[#D8FF64] font-semibold" : "text-white/70")}>
                          {n.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 6. Hairstyle & Hair Color */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-white/50 block mb-2.5">
                  Hairstyle
                </label>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[
                    { id: "Bob", label: "Bob", img: "/assets/influencer/hair_bob.jpg" },
                    { id: "Bald", label: "Bald", img: "/assets/influencer/hair_bald.jpg" },
                    { id: "Buzz cut", label: "Buzz cut", img: "/assets/influencer/hair_buzzcut.jpg" },
                    { id: "Bowl cut", label: "Bowl cut", img: "/assets/influencer/hair_bowlcut.jpg" },
                  ].map((hair) => {
                    const active = hairstyle === hair.id;
                    return (
                      <button
                        key={hair.id}
                        type="button"
                        onClick={() => setHairstyle(hair.id)}
                        className={cn(
                          "flex flex-col items-center p-1.5 rounded-2xl border transition-all cursor-pointer group text-center overflow-hidden",
                          active
                            ? "bg-[#D8FF64]/10 border-[#D8FF64] ring-1 ring-[#D8FF64]"
                            : "bg-[#181817] border-white/10 hover:border-white/20 hover:bg-white/5"
                        )}
                      >
                        <div className="w-full aspect-square rounded-xl mb-1.5 overflow-hidden bg-black/40 border border-white/10">
                          <img
                            src={hair.img}
                            alt={hair.label}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <span className={cn("text-[11px] font-medium truncate w-full px-0.5", active ? "text-[#D8FF64] font-semibold" : "text-white/70")}>
                          {hair.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Hair Color Swatches */}
                <label className="text-[11px] font-semibold uppercase tracking-wider text-white/50 block mb-2">
                  Hair Color
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: "Jet black", hex: "#111111" },
                    { id: "Dark brown", hex: "#3E2723" },
                    { id: "Chestnut", hex: "#6D4C41" },
                    { id: "Ginger", hex: "#D85C27" },
                  ].map((color) => {
                    const active = hairColor === color.id;
                    return (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => setHairColor(color.id)}
                        className={cn(
                          "p-2 rounded-xl border transition-all cursor-pointer flex flex-col items-center gap-1.5",
                          active ? "border-[#D8FF64] bg-[#D8FF64]/10" : "border-white/10 bg-white/5"
                        )}
                      >
                        <div className="w-full h-8 rounded-lg shadow-inner" style={{ backgroundColor: color.hex }} />
                        <span className="text-[10.5px] text-white/80 truncate">{color.id}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 7. Ethnicity */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-white/50 block mb-2.5">
                  Ethnicity
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: "African", label: "African", img: "/assets/influencer/ethnicity_african.jpg" },
                    { id: "Asian", label: "Asian", img: "/assets/influencer/ethnicity_asian.jpg" },
                    { id: "European", label: "European", img: "/assets/influencer/ethnicity_european.jpg" },
                    { id: "Indian", label: "Indian", img: "/assets/influencer/ethnicity_indian.jpg" },
                  ].map((eth) => {
                    const active = ethnicity === eth.id;
                    return (
                      <button
                        key={eth.id}
                        type="button"
                        onClick={() => setEthnicity(eth.id)}
                        className={cn(
                          "flex flex-col items-center p-1.5 rounded-2xl border transition-all cursor-pointer group text-center overflow-hidden",
                          active
                            ? "bg-[#D8FF64]/10 border-[#D8FF64] ring-1 ring-[#D8FF64]"
                            : "bg-[#181817] border-white/10 hover:border-white/20 hover:bg-white/5"
                        )}
                      >
                        <div className="w-full aspect-square rounded-xl mb-1.5 overflow-hidden bg-black/40 border border-white/10">
                          <img
                            src={eth.img}
                            alt={eth.label}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <span className={cn("text-[11px] font-medium truncate w-full px-0.5", active ? "text-[#D8FF64] font-semibold" : "text-white/70")}>
                          {eth.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 8. Age & Skin color */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-white/50 block mb-2">
                    Age
                  </label>
                  <div className="flex gap-1.5">
                    {["Adult", "Mature", "Senior"].map((a) => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => setAge(a)}
                        className={cn(
                          "flex-1 py-1.5 rounded-lg text-center text-[11px] border transition-all cursor-pointer",
                          age === a
                            ? "bg-white text-black font-semibold"
                            : "bg-white/5 border-white/5 text-white/60"
                        )}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-white/50 block mb-2">
                    Skin color
                  </label>
                  <div className="flex gap-1.5">
                    {[
                      { id: "Porcelain", hex: "#FBE7D6" },
                      { id: "Fair", hex: "#F3D0B7" },
                      { id: "Light", hex: "#E3B393" },
                      { id: "Olive", hex: "#BE9473" },
                    ].map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSkinColor(s.id)}
                        className={cn(
                          "flex-1 h-7 rounded-lg border transition-all cursor-pointer relative",
                          skinColor === s.id ? "ring-2 ring-[#D8FF64] border-black" : "border-white/10"
                        )}
                        style={{ backgroundColor: s.hex }}
                        title={s.id}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* 9. Eye shape & Eye color */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-white/50 block mb-2.5">
                  Eye shape
                </label>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[
                    { id: "Almond", label: "Almond", img: "/assets/influencer/eye_almond.jpg" },
                    { id: "Round", label: "Round", img: "/assets/influencer/eye_round.jpg" },
                    { id: "Monolid", label: "Monolid", img: "/assets/influencer/eye_monolid.jpg" },
                    { id: "Close-set", label: "Close-set", img: "/assets/influencer/eye_closeset.jpg" },
                  ].map((item) => {
                    const active = eyeShape === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setEyeShape(item.id)}
                        className={cn(
                          "flex flex-col items-center p-1.5 rounded-2xl border transition-all cursor-pointer group text-center overflow-hidden",
                          active
                            ? "bg-[#D8FF64]/10 border-[#D8FF64] ring-1 ring-[#D8FF64]"
                            : "bg-[#181817] border-white/10 hover:border-white/20 hover:bg-white/5"
                        )}
                      >
                        <div className="w-full aspect-square rounded-xl mb-1.5 overflow-hidden bg-black/40 border border-white/10">
                          <img
                            src={item.img}
                            alt={item.label}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <span className={cn("text-[10px] font-medium truncate w-full px-0.5", active ? "text-[#D8FF64] font-semibold" : "text-white/70")}>
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <label className="text-[11px] font-semibold uppercase tracking-wider text-white/50 block mb-2">
                  Eye color
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: "Black", hex: "#1A1A1A" },
                    { id: "Brown", hex: "#5D4037" },
                    { id: "Hazel", hex: "#9E8B52" },
                    { id: "Green", hex: "#4E7D56" },
                  ].map((color) => {
                    const active = eyeColor === color.id;
                    return (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => setEyeColor(color.id)}
                        className={cn(
                          "p-2 rounded-xl border transition-all cursor-pointer flex flex-col items-center gap-1.5",
                          active ? "border-[#D8FF64] bg-[#D8FF64]/10" : "border-white/10 bg-white/5"
                        )}
                      >
                        <div className="w-full h-7 rounded-lg" style={{ backgroundColor: color.hex }} />
                        <span className="text-[10px] text-white/80">{color.id}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 10. Facial Features */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-white/50 block mb-2.5">
                  Features
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: "Dimples", label: "Dimples", img: "/assets/influencer/feat_dimples.jpg" },
                    { id: "Freckles", label: "Freckles", img: "/assets/influencer/feat_freckles.jpg" },
                    { id: "Heavy eye bags", label: "Heavy bags", img: "/assets/influencer/feat_heavyeyebags.jpg" },
                    { id: "Blush", label: "Blush", img: "/assets/influencer/feat_blush.jpg" },
                  ].map((feat) => {
                    const active = features.includes(feat.id);
                    return (
                      <button
                        key={feat.id}
                        type="button"
                        onClick={() => {
                          setFeatures((prev) =>
                            prev.includes(feat.id) ? prev.filter((f) => f !== feat.id) : [...prev, feat.id]
                          );
                        }}
                        className={cn(
                          "flex flex-col items-center p-1.5 rounded-2xl border transition-all cursor-pointer group text-center overflow-hidden",
                          active
                            ? "bg-[#D8FF64]/10 border-[#D8FF64] ring-1 ring-[#D8FF64]"
                            : "bg-[#181817] border-white/10 hover:border-white/20 hover:bg-white/5"
                        )}
                      >
                        <div className="w-full aspect-square rounded-xl mb-1.5 overflow-hidden bg-black/40 border border-white/10">
                          <img
                            src={feat.img}
                            alt={feat.label}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <span className={cn("text-[10px] font-medium truncate w-full px-0.5", active ? "text-[#D8FF64] font-semibold" : "text-white/70")}>
                          {feat.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 11. Facial hair & Accessories */}
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-white/50 block mb-2">
                    Facial hair
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: "Clean", label: "Clean", img: "/assets/influencer/hair_clean.jpg" },
                      { id: "Stubble", label: "Stubble", img: "/assets/influencer/hair_stubble.jpg" },
                      { id: "Full beard", label: "Full beard", img: "/assets/influencer/hair_fullbeard.jpg" },
                      { id: "Goatee", label: "Goatee", img: "/assets/influencer/hair_goatee.jpg" },
                    ].map((fh) => {
                      const active = facialHair === fh.id;
                      return (
                        <button
                          key={fh.id}
                          type="button"
                          onClick={() => setFacialHair(fh.id)}
                          className={cn(
                            "flex flex-col items-center p-1.5 rounded-2xl border transition-all cursor-pointer group text-center overflow-hidden",
                            active
                              ? "bg-[#D8FF64]/10 border-[#D8FF64] ring-1 ring-[#D8FF64]"
                              : "bg-[#181817] border-white/10 hover:border-white/20 hover:bg-white/5"
                          )}
                        >
                          <div className="w-full aspect-square rounded-xl mb-1.5 overflow-hidden bg-black/40 border border-white/10">
                            <img
                              src={fh.img}
                              alt={fh.label}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <span className={cn("text-[10px] font-medium truncate w-full px-0.5", active ? "text-[#D8FF64] font-semibold" : "text-white/70")}>
                            {fh.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-white/50 block mb-2">
                    Accessories
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: "None", label: "None", img: "/assets/influencer/acc_none.jpg" },
                      { id: "Glasses", label: "Glasses", img: "/assets/influencer/acc_glasses.jpg" },
                      { id: "Headphones", label: "Headphones", img: "/assets/influencer/acc_headphones.jpg" },
                      { id: "Jewelry", label: "Jewelry", img: "/assets/influencer/acc_jewelry.jpg" },
                    ].map((acc) => {
                      const active = accessories === acc.id;
                      return (
                        <button
                          key={acc.id}
                          type="button"
                          onClick={() => setAccessories(acc.id)}
                          className={cn(
                            "flex flex-col items-center p-1.5 rounded-2xl border transition-all cursor-pointer group text-center overflow-hidden",
                            active
                              ? "bg-[#D8FF64]/10 border-[#D8FF64] ring-1 ring-[#D8FF64]"
                              : "bg-[#181817] border-white/10 hover:border-white/20 hover:bg-white/5"
                          )}
                        >
                          <div className="w-full aspect-square rounded-xl mb-1.5 overflow-hidden bg-black/40 border border-white/10">
                            <img
                              src={acc.img}
                              alt={acc.label}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <span className={cn("text-[10px] font-medium truncate w-full px-0.5", active ? "text-[#D8FF64] font-semibold" : "text-white/70")}>
                            {acc.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 12. Distinctive features */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-white/50 block mb-2.5">
                  Distinctive features
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: "Odd eyes", label: "Odd eyes", img: "/assets/influencer/distinct_oddeyes.jpg" },
                    { id: "Face tattoo", label: "Tattoo", img: "/assets/influencer/distinct_facetattoo.jpg" },
                    { id: "Piercing", label: "Piercing", img: "/assets/influencer/distinct_piercing.jpg" },
                    { id: "Ear piercing", label: "Ear", img: "/assets/influencer/distinct_earpiercing.jpg" },
                  ].map((dist) => {
                    const active = distinctive.includes(dist.id);
                    return (
                      <button
                        key={dist.id}
                        type="button"
                        onClick={() => {
                          setDistinctive((prev) =>
                            prev.includes(dist.id) ? prev.filter((d) => d !== dist.id) : [...prev, dist.id]
                          );
                        }}
                        className={cn(
                          "flex flex-col items-center p-1.5 rounded-2xl border transition-all cursor-pointer group text-center overflow-hidden",
                          active
                            ? "bg-[#D8FF64]/10 border-[#D8FF64] ring-1 ring-[#D8FF64]"
                            : "bg-[#181817] border-white/10 hover:border-white/20 hover:bg-white/5"
                        )}
                      >
                        <div className="w-full aspect-square rounded-xl mb-1.5 overflow-hidden bg-black/40 border border-white/10">
                          <img
                            src={dist.img}
                            alt={dist.label}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <span className={cn("text-[10px] font-medium truncate w-full px-0.5", active ? "text-[#D8FF64] font-semibold" : "text-white/70")}>
                          {dist.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 13. Style */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-white/50 block mb-2.5">
                  Style
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "Retro", label: "Retro", img: "/assets/influencer/style_retro.jpg" },
                    { id: "Sporty", label: "Sporty", img: "/assets/influencer/style_sporty.jpg" },
                  ].map((s) => {
                    const active = stylePreset === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setStylePreset(s.id)}
                        className={cn(
                          "flex flex-col items-center p-1.5 rounded-2xl border transition-all cursor-pointer group text-center overflow-hidden",
                          active
                            ? "bg-[#D8FF64]/10 border-[#D8FF64] ring-1 ring-[#D8FF64]"
                            : "bg-[#181817] border-white/10 hover:border-white/20 hover:bg-white/5"
                        )}
                      >
                        <div className="w-full aspect-square rounded-xl mb-1.5 overflow-hidden bg-black/40 border border-white/10">
                          <img
                            src={s.img}
                            alt={s.label}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <span className={cn("text-[11px] font-medium truncate w-full px-0.5", active ? "text-[#D8FF64] font-semibold" : "text-white/70")}>
                          {s.label}
                        </span>
                      </button>
                    );
                  })}

                  {/* Upload style card */}
                  <button
                    type="button"
                    className="p-2 rounded-2xl border border-dashed border-white/20 bg-white/5 hover:bg-white/10 text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                      <CoolIcon name="folder-upload" size={18} duotone className="text-[#D8FF64]" />
                    </div>
                    <span className="text-[10px] font-medium text-white/80 leading-tight">Add reference</span>
                  </button>
                </div>
              </div>

              {/* 12. Prompt Switch */}
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-medium text-white">Prompt</span>
                  <input
                    type="checkbox"
                    checked={promptEnabled}
                    onChange={(e) => setPromptEnabled(e.target.checked)}
                    className="accent-[#D8FF64] size-4 cursor-pointer"
                  />
                </div>
                {promptEnabled && (
                  <textarea
                    rows={2}
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Instructions détaillées pour le style, pose, vêtements..."
                    className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-[12px] text-white resize-none outline-none focus:border-[#D8FF64]"
                  />
                )}
              </div>
            </>
          )}
        </div>

        {/* Fixed Bottom Bar: Free gens toggle + Shuffle + Lime Generate button */}
        <div className="p-4 border-t border-white/10 bg-[#111110] space-y-2.5 shrink-0">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5 text-[11.5px] text-white/70">
              <CoolIcon name="star" size={13} duotone secondaryColor="#D8FF64" className="text-[#D8FF64]" />
              <span>Free gens: 5</span>
            </div>
            <input
              type="checkbox"
              checked={freeGens}
              onChange={(e) => setFreeGens(e.target.checked)}
              className="accent-[#D8FF64] size-4 cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleShuffle}
              className="w-11 h-11 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer shrink-0"
              title="Shuffle parameters"
            >
              <CoolIcon name="shuffle" size={18} duotone={false} />
            </button>

            <button
              type="button"
              onClick={handleCreate}
              disabled={isGenerating}
              className="flex-1 h-11 rounded-full bg-[#D8FF64] hover:bg-[#cbf54a] text-black font-bold text-[13.5px] flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <CoolIcon name="loading" size={16} className="animate-spin text-black" duotone={false} />
                  <span>Synthesizing Influencer…</span>
                </>
              ) : (
                <>
                  <span>Generate</span>
                  <CoolIcon name="star" size={14} duotone={false} className="text-black" />
                  <span className="font-mono text-xs">1.125 cr</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

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
                    { id: "Average", label: "Average", color: "from-blue-500/20" },
                    { id: "Bold", label: "Bold", color: "from-amber-500/20" },
                    { id: "Extreme", label: "Extreme", color: "from-emerald-500/20" },
                    { id: "Insect", label: "Insect", color: "from-purple-500/20" },
                  ].map((item) => {
                    const active = characterType === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setCharacterType(item.id)}
                        className={cn(
                          "flex flex-col items-center p-2 rounded-2xl border transition-all cursor-pointer group text-center",
                          active
                            ? "bg-[#D8FF64]/10 border-[#D8FF64] ring-1 ring-[#D8FF64]"
                            : "bg-[#181817] border-white/10 hover:border-white/20 hover:bg-white/5"
                        )}
                      >
                        <div className={cn("w-14 h-14 rounded-xl mb-1.5 flex items-center justify-center bg-gradient-to-b to-black/40 border border-white/10", item.color)}>
                          <CoolIcon name="user-01" size={24} duotone secondaryColor={active ? "#D8FF64" : undefined} className={active ? "text-[#D8FF64]" : "text-white/60"} />
                        </div>
                        <span className={cn("text-[11px] font-medium truncate w-full", active ? "text-[#D8FF64] font-semibold" : "text-white/70")}>
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
                    { id: "Female", label: "Female", symbol: "♀" },
                    { id: "Male", label: "Male", symbol: "♂" },
                    { id: "Trans man", label: "Trans man", symbol: "⚧" },
                    { id: "Trans woman", label: "Trans woman", symbol: "⚧" },
                  ].map((item) => {
                    const active = gender === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setGender(item.id)}
                        className={cn(
                          "flex flex-col items-center p-2.5 rounded-2xl border transition-all cursor-pointer group text-center",
                          active
                            ? "bg-[#D8FF64]/10 border-[#D8FF64] ring-1 ring-[#D8FF64]"
                            : "bg-[#181817] border-white/10 hover:border-white/20 hover:bg-white/5"
                        )}
                      >
                        <div className="w-12 h-12 rounded-xl mb-1.5 flex items-center justify-center bg-white/5 border border-white/10 text-xl font-bold">
                          {item.symbol}
                        </div>
                        <span className={cn("text-[11px] font-medium truncate w-full", active ? "text-[#D8FF64] font-semibold" : "text-white/70")}>
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
                    { id: "Slim", label: "Slim" },
                    { id: "Athletic", label: "Athletic" },
                    { id: "Muscular", label: "Muscular" },
                    { id: "Curvy", label: "Curvy" },
                  ].map((item) => {
                    const active = build === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setBuild(item.id)}
                        className={cn(
                          "flex flex-col items-center p-2 rounded-2xl border transition-all cursor-pointer group text-center",
                          active
                            ? "bg-[#D8FF64]/10 border-[#D8FF64] ring-1 ring-[#D8FF64]"
                            : "bg-[#181817] border-white/10 hover:border-white/20 hover:bg-white/5"
                        )}
                      >
                        <div className="w-14 h-16 rounded-xl mb-1.5 flex items-center justify-center bg-white/5 border border-white/10">
                          <CoolIcon name="user-01" size={26} duotone className={active ? "text-[#D8FF64]" : "text-white/60"} />
                        </div>
                        <span className={cn("text-[11px] font-medium truncate w-full", active ? "text-[#D8FF64] font-semibold" : "text-white/70")}>
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
                    {["Average", "Tall", "Very tall"].map((h) => {
                      const active = height === h;
                      return (
                        <button
                          key={h}
                          type="button"
                          onClick={() => setHeight(h)}
                          className={cn(
                            "py-2 rounded-xl text-center text-[12px] border transition-all cursor-pointer",
                            active
                              ? "bg-white text-black font-semibold shadow-sm"
                              : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                          )}
                        >
                          {h}
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
                    {["Long limbs", "Short legs", "Broad shoulders", "Tiny waist"].map((p) => {
                      const active = proportions === p;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setProportions(p)}
                          className={cn(
                            "py-2 px-1 rounded-xl text-center text-[10.5px] border transition-all cursor-pointer",
                            active
                              ? "bg-[#D8FF64]/10 border-[#D8FF64] text-[#D8FF64] font-medium"
                              : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                          )}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 5. Head shape & Neck */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-white/50 block mb-1.5">
                    Head shape
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {["Standard", "Long", "Tiny", "High forehead"].map((hs) => (
                      <button
                        key={hs}
                        type="button"
                        onClick={() => setHeadShape(hs)}
                        className={cn(
                          "py-1.5 rounded-lg text-center text-[11px] border transition-all cursor-pointer",
                          headShape === hs
                            ? "bg-white text-black font-semibold"
                            : "bg-white/5 border-white/5 text-white/60"
                        )}
                      >
                        {hs}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-white/50 block mb-1.5">
                    Neck
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {["Standard", "Column", "Long", "Short"].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setNeck(n)}
                        className={cn(
                          "py-1.5 rounded-lg text-center text-[11px] border transition-all cursor-pointer",
                          neck === n
                            ? "bg-white text-black font-semibold"
                            : "bg-white/5 border-white/5 text-white/60"
                        )}
                      >
                        {n}
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
                  {["Bob", "Bald", "Buzz cut", "Bowl cut"].map((hair) => {
                    const active = hairstyle === hair;
                    return (
                      <button
                        key={hair}
                        type="button"
                        onClick={() => setHairstyle(hair)}
                        className={cn(
                          "p-2 rounded-2xl border transition-all cursor-pointer group text-center",
                          active
                            ? "bg-[#D8FF64]/10 border-[#D8FF64] ring-1 ring-[#D8FF64]"
                            : "bg-[#181817] border-white/10 hover:border-white/20"
                        )}
                      >
                        <div className="w-12 h-12 rounded-xl mb-1 flex items-center justify-center bg-white/5 border border-white/10 mx-auto">
                          <CoolIcon name="user-01" size={22} duotone className={active ? "text-[#D8FF64]" : "text-white/60"} />
                        </div>
                        <span className={cn("text-[11px] font-medium truncate block", active ? "text-[#D8FF64]" : "text-white/70")}>
                          {hair}
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

              {/* 7. Ethnicity & Age */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-white/50 block mb-2.5">
                  Ethnicity
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {["African", "Asian", "European", "Indian"].map((eth) => {
                    const active = ethnicity === eth;
                    return (
                      <button
                        key={eth}
                        type="button"
                        onClick={() => setEthnicity(eth)}
                        className={cn(
                          "p-2 rounded-2xl border transition-all cursor-pointer group text-center",
                          active
                            ? "bg-[#D8FF64]/10 border-[#D8FF64] ring-1 ring-[#D8FF64]"
                            : "bg-[#181817] border-white/10 hover:border-white/20"
                        )}
                      >
                        <div className="w-12 h-12 rounded-xl mb-1 flex items-center justify-center bg-white/5 border border-white/10 mx-auto">
                          <CoolIcon name="user-01" size={22} duotone className={active ? "text-[#D8FF64]" : "text-white/60"} />
                        </div>
                        <span className={cn("text-[11px] font-medium truncate block", active ? "text-[#D8FF64]" : "text-white/70")}>
                          {eth}
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
                  {["Almond", "Round", "Monolid", "Close-set"].map((item) => {
                    const active = eyeShape === item;
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setEyeShape(item)}
                        className={cn(
                          "py-2 px-1 rounded-xl text-center text-[11px] border transition-all cursor-pointer",
                          active
                            ? "bg-[#D8FF64]/10 border-[#D8FF64] text-[#D8FF64] font-medium"
                            : "bg-white/5 border-white/10 text-white/70"
                        )}
                      >
                        {item}
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

              {/* 10. Facial hair & Distinctive features */}
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-white/50 block mb-2">
                    Facial hair
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {["Clean", "Stubble", "Full beard", "Goatee"].map((fh) => {
                      const active = facialHair === fh;
                      return (
                        <button
                          key={fh}
                          type="button"
                          onClick={() => setFacialHair(fh)}
                          className={cn(
                            "py-2 rounded-xl text-center text-[11px] border transition-all cursor-pointer",
                            active
                              ? "bg-white text-black font-semibold"
                              : "bg-white/5 border-white/10 text-white/70"
                          )}
                        >
                          {fh}
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
                    {["None", "Glasses", "Headphones", "Jewelry"].map((acc) => {
                      const active = accessories === acc;
                      return (
                        <button
                          key={acc}
                          type="button"
                          onClick={() => setAccessories(acc)}
                          className={cn(
                            "py-2 rounded-xl text-center text-[11px] border transition-all cursor-pointer",
                            active
                              ? "bg-[#D8FF64]/10 border-[#D8FF64] text-[#D8FF64] font-medium"
                              : "bg-white/5 border-white/10 text-white/70"
                          )}
                        >
                          {acc}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 11. Style */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-white/50 block mb-2.5">
                  Style
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {/* Upload style card */}
                  <button
                    type="button"
                    className="p-3 rounded-2xl border border-dashed border-white/20 bg-white/5 hover:bg-white/10 text-center flex flex-col items-center justify-center gap-1 cursor-pointer"
                  >
                    <CoolIcon name="folder-upload" size={18} duotone className="text-[#D8FF64]" />
                    <span className="text-[10.5px] font-medium text-white">Add style reference</span>
                  </button>

                  {["Retro", "Sporty", "Streetwear", "Luxury", "Casual"].slice(0, 2).map((s) => {
                    const active = stylePreset === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStylePreset(s)}
                        className={cn(
                          "p-2.5 rounded-2xl border transition-all cursor-pointer text-center flex flex-col items-center justify-center",
                          active
                            ? "bg-[#D8FF64]/10 border-[#D8FF64] text-[#D8FF64] font-medium"
                            : "bg-white/5 border-white/10 text-white/70"
                        )}
                      >
                        <CoolIcon name="star" size={16} duotone className={active ? "text-[#D8FF64]" : "text-white/40"} />
                        <span className="text-[11.5px] mt-1">{s}</span>
                      </button>
                    );
                  })}
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

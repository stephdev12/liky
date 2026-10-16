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
  const [headShape, setHeadShape] = useState("Standard");
  const [eyeShape, setEyeShape] = useState("Almond");
  const [eyeColor, setEyeColor] = useState("Brown");
  const [hairstyle, setHairstyle] = useState("Bob");
  const [hairColor, setHairColor] = useState("Jet black");
  const [features, setFeatures] = useState<string[]>(["Dimples"]);
  const [facialHair, setFacialHair] = useState("Clean");
  const [distinctive, setDistinctive] = useState<string[]>([]);
  const [accessories, setAccessories] = useState("None");
  const [ethnicity, setEthnicity] = useState("African");
  const [age, setAge] = useState("Adult");
  const [skinColor, setSkinColor] = useState("Olive");
  const [stylePreset, setStylePreset] = useState("Retro");
  const [customPromptEnabled, setCustomPromptEnabled] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");

  if (!isOpen) return null;

  const handleShuffle = () => {
    const types = ["Average", "Bold", "Extreme"];
    const genders = ["Female", "Male"];
    const builds = ["Slim", "Athletic", "Muscular", "Curvy"];
    const eyes = ["Black", "Brown", "Hazel", "Green"];
    const hairs = ["Bob", "Buzz cut", "Bald", "Bowl cut"];
    const hairColors = ["Jet black", "Dark brown", "Chestnut", "Ginger"];
    const ethnic = ["African", "Asian", "European", "Indian"];

    setCharacterType(types[Math.floor(Math.random() * types.length)]);
    setGender(genders[Math.floor(Math.random() * genders.length)]);
    setBuild(builds[Math.floor(Math.random() * builds.length)]);
    setEyeColor(eyes[Math.floor(Math.random() * eyes.length)]);
    setHairstyle(hairs[Math.floor(Math.random() * hairs.length)]);
    setHairColor(hairColors[Math.floor(Math.random() * hairColors.length)]);
    setEthnicity(ethnic[Math.floor(Math.random() * ethnic.length)]);
  };

  const handleCreate = async () => {
    setIsGenerating(true);

    const summary = `${gender} ${ethnicity}, ${age}, ${build} physique, ${hairstyle} (${hairColor}), ${eyeColor} eyes, ${stylePreset} style`;
    const promptCompiled = customPromptEnabled && customPrompt.trim()
      ? `${summary}. ${customPrompt}`
      : summary;

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "image",
          model: "ai_influencer",
          prompt: `High-end multi-view character sheet: ${promptCompiled}`,
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
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="fixed inset-x-0 bottom-0 sm:inset-y-0 sm:right-0 sm:left-auto w-full sm:w-[500px] max-h-[92vh] sm:max-h-screen bg-[#141413] text-[#F8F8F5] border-t sm:border-t-0 sm:border-l border-white/10 shadow-2xl z-50 flex flex-col justify-between overflow-hidden animate-in slide-in-from-bottom sm:slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-[#D8FF64]/10 text-[#D8FF64]">
              <CoolIcon name="star" size={16} duotone secondaryColor="#D8FF64" className="text-[#D8FF64]" />
            </span>
            <h3 className="font-heading text-[17px] font-medium text-white">
              Créer un Influenceur IA
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <CoolIcon name="close-md" size={16} duotone={false} />
          </button>
        </div>

        {/* Mode Toggle (Build from scratch vs Build from me) */}
        <div className="px-5 pt-3 pb-2 shrink-0">
          <div className="grid grid-cols-2 p-1 rounded-full bg-white/5 border border-white/10 text-[12px] font-medium">
            <button
              type="button"
              onClick={() => setMode("me")}
              className={cn(
                "py-1.5 rounded-full transition-all cursor-pointer",
                mode === "me"
                  ? "bg-white text-black font-semibold shadow-sm"
                  : "text-white/60 hover:text-white"
              )}
            >
              Partir de mon visage
            </button>
            <button
              type="button"
              onClick={() => setMode("scratch")}
              className={cn(
                "py-1.5 rounded-full transition-all cursor-pointer",
                mode === "scratch"
                  ? "bg-white text-black font-semibold shadow-sm"
                  : "text-white/60 hover:text-white"
              )}
            >
              Créer de zéro
            </button>
          </div>
        </div>

        {/* Corps scrollable des 19 attributs */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-5 text-[13px]">
          {/* Nom du personnage */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-white/40 block mb-1.5">
              Nom de l'avatar (pour mention @)
            </label>
            <input
              type="text"
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
              placeholder="ex: amina, thomas, sarah..."
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
                  Déposez votre photo de face
                </span>
                <p className="text-[11.5px] text-white/50 max-w-xs mx-auto mt-1">
                  Photo claire, bien éclairée, regard caméra pour extraire vos traits et créer votre jumeau numérique.
                </p>
              </div>
              <button
                type="button"
                className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-[12px] font-medium transition-colors cursor-pointer"
              >
                Sélectionner un selfie
              </button>
            </div>
          ) : (
            <>
              {/* Type de personnage */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-white/40 block mb-2">
                  Type de personnage
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {["Average", "Bold", "Extreme", "Créature"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setCharacterType(t)}
                      className={cn(
                        "py-2 rounded-xl text-center text-[12px] border transition-all cursor-pointer",
                        characterType === t
                          ? "bg-[#D8FF64]/10 border-[#D8FF64] text-[#D8FF64] font-medium"
                          : "bg-white/5 border-white/5 text-white/70 hover:bg-white/10"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Genre */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-white/40 block mb-2">
                  Genre
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {["Female", "Male", "Trans man", "Trans woman"].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={cn(
                        "py-2 rounded-xl text-center text-[12px] border transition-all cursor-pointer",
                        gender === g
                          ? "bg-[#D8FF64]/10 border-[#D8FF64] text-[#D8FF64] font-medium"
                          : "bg-white/5 border-white/5 text-white/70 hover:bg-white/10"
                      )}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Origine ethnique */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-white/40 block mb-2">
                  Origine ethnique
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {["African", "Asian", "European", "Indian"].map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setEthnicity(e)}
                      className={cn(
                        "py-2 rounded-xl text-center text-[12px] border transition-all cursor-pointer",
                        ethnicity === e
                          ? "bg-[#D8FF64]/10 border-[#D8FF64] text-[#D8FF64] font-medium"
                          : "bg-white/5 border-white/5 text-white/70 hover:bg-white/10"
                      )}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Âge & Teint de peau */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-white/40 block mb-1.5">
                    Âge
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
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-white/40 block mb-1.5">
                    Teint
                  </label>
                  <div className="flex gap-1.5">
                    {[
                      { id: "Porcelain", c: "#F7E6D7" },
                      { id: "Fair", c: "#EBC8B2" },
                      { id: "Olive", c: "#C69B7B" },
                      { id: "Deep", c: "#6B4423" },
                    ].map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSkinColor(s.id)}
                        className={cn(
                          "flex-1 h-7 rounded-lg border transition-all cursor-pointer relative",
                          skinColor === s.id ? "ring-2 ring-[#D8FF64]" : "border-white/10"
                        )}
                        style={{ backgroundColor: s.c }}
                        title={s.id}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Corpulence & Morphologie */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-white/40 block mb-2">
                  Corpulence
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {["Slim", "Athletic", "Muscular", "Curvy"].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBuild(b)}
                      className={cn(
                        "py-2 rounded-xl text-center text-[12px] border transition-all cursor-pointer",
                        build === b
                          ? "bg-[#D8FF64]/10 border-[#D8FF64] text-[#D8FF64] font-medium"
                          : "bg-white/5 border-white/5 text-white/70 hover:bg-white/10"
                      )}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cheveux */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-white/40 block mb-1.5">
                    Coupe
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {["Bob", "Buzz cut", "Bald", "Bowl cut"].map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setHairstyle(h)}
                        className={cn(
                          "py-1.5 rounded-lg text-center text-[11px] border transition-all cursor-pointer",
                          hairstyle === h
                            ? "bg-white text-black font-semibold"
                            : "bg-white/5 border-white/5 text-white/60"
                        )}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-white/40 block mb-1.5">
                    Couleur cheveux
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {["Jet black", "Dark brown", "Chestnut", "Ginger"].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setHairColor(c)}
                        className={cn(
                          "py-1.5 rounded-lg text-center text-[11px] border transition-all cursor-pointer",
                          hairColor === c
                            ? "bg-white text-black font-semibold"
                            : "bg-white/5 border-white/5 text-white/60"
                        )}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Style & Look vestimentaire */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-white/40 block mb-2">
                  Style vestimentaire
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["Retro", "Sporty", "Casual", "Corporate", "Streetwear", "Luxury"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStylePreset(s)}
                      className={cn(
                        "py-2 rounded-xl text-center text-[12px] border transition-all cursor-pointer",
                        stylePreset === s
                          ? "bg-[#D8FF64]/10 border-[#D8FF64] text-[#D8FF64] font-medium"
                          : "bg-white/5 border-white/5 text-white/70 hover:bg-white/10"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Switch Prompt libre */}
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-medium text-white">
                    Consigne textuelle personnalisée
                  </span>
                  <input
                    type="checkbox"
                    checked={customPromptEnabled}
                    onChange={(e) => setCustomPromptEnabled(e.target.checked)}
                    className="accent-[#D8FF64] size-4 cursor-pointer"
                  />
                </div>
                {customPromptEnabled && (
                  <textarea
                    rows={2}
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="ex: porte une veste bomber rouge, grand sourire, lumière de studio naturelle..."
                    className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-[12.5px] text-white resize-none outline-none focus:border-[#D8FF64]"
                  />
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer sticky avec Aléatoire et Création */}
        <div className="p-4 border-t border-white/10 bg-[#141413] flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleShuffle}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
            title="Tirage aléatoire (Shuffle)"
          >
            <CoolIcon name="shuffle" size={16} duotone />
          </button>

          <button
            type="button"
            onClick={handleCreate}
            disabled={isGenerating}
            className="flex-1 py-2.5 rounded-full bg-[#D8FF64] hover:bg-[#cbf54a] text-black font-semibold text-[13px] flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <CoolIcon name="loading" size={16} className="animate-spin text-black" duotone={false} />
                <span>Génération de la planche...</span>
              </>
            ) : (
              <>
                <CoolIcon name="star" size={16} duotone={false} className="text-black" />
                <span>Générer l'influenceur · 8 cr</span>
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}

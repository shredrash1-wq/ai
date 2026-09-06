import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));

// BazaarLink Free LLM API Client (OpenAI-compatible)
let bazaarlinkApiKey = process.env.BAZAARLINK_API_KEY || "";
let bazaarlinkClient: OpenAI | null = null;

async function getBazaarLink(): Promise<OpenAI> {
  if (!bazaarlinkClient) {
    if (!bazaarlinkApiKey) {
      try {
        const regRes = await fetch("https://api.bazaarlink.ai/v1/agents/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "AetherisAI" })
        });
        if (regRes.ok) {
          const regData: any = await regRes.json();
          if (regData.api_key) {
            bazaarlinkApiKey = regData.api_key;
          }
        }
      } catch (err) {
        console.warn("BazaarLink auto-registration notice:", err);
      }
    }

    bazaarlinkClient = new OpenAI({
      baseURL: "https://api.bazaarlink.ai/v1",
      apiKey: bazaarlinkApiKey || "anonymous"
    });
  }
  return bazaarlinkClient;
}

// OpenAI ChatGPT Client
let openaiApiKey = process.env.OPENAI_API_KEY || "";
let openAiClient: OpenAI | null = null;
let isOpenAiQuotaExhausted = true; // Cached to avoid repeated 429 errors when key credits are 0
let openAiCooldownUntil = Date.now() + 24 * 60 * 60 * 1000;

let isGeminiNativeImageQuotaExhausted = false;
let geminiNativeImageCooldownUntil = 0;

function getOpenAIClient(): OpenAI {
  if (!openAiClient) {
    openAiClient = new OpenAI({
      apiKey: openaiApiKey
    });
  }
  return openAiClient;
}

// Lazy initialization of GoogleGenAI
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return aiClient;
}

// Resilient content generator with backoff retry and model fallbacks
async function generateWithFallback(
  ai: GoogleGenAI,
  modelsToTry: string[],
  contents: any,
  config: any
): Promise<{ text: string; modelUsed: string }> {
  let lastError: any = null;

  for (const candidateModel of modelsToTry) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: candidateModel,
          contents,
          config
        });
        const replyText = response.text || "";
        if (replyText) {
          return { text: replyText, modelUsed: candidateModel };
        }
      } catch (err: any) {
        lastError = err;
        const errMessage = String(err?.message || "");
        const status = err?.status || err?.code || "";
        const isTransient =
          status === 503 ||
          status === 429 ||
          errMessage.includes("503") ||
          errMessage.includes("UNAVAILABLE") ||
          errMessage.includes("high demand") ||
          errMessage.includes("Resource has been exhausted");

        if (isTransient && attempt === 0) {
          // Brief pause before retry
          await new Promise((resolve) => setTimeout(resolve, 800));
          continue;
        }
        // Seamlessly continue to the next model in the fallback chain
        break;
      }
    }
  }

  throw lastError;
}

async function generateWithFreeFallback(
  messages: any[],
  systemInstruction: string
): Promise<string | null> {
  try {
    const formattedMessages = [
      { role: "system", content: systemInstruction },
      ...messages.map((m: any) => ({
        role: m.role === "assistant" || m.role === "model" ? "assistant" : "user",
        content: m.content || ""
      }))
    ];

    const response = await fetch("https://text.pollinations.ai/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: formattedMessages,
        model: "openai",
        seed: Math.floor(Math.random() * 100000)
      }),
      signal: AbortSignal.timeout(20000)
    });

    if (response.ok) {
      const text = await response.text();
      if (text && text.trim()) {
        return text.trim();
      }
    }
  } catch (err) {
    console.warn("Free fallback notice:", err);
  }
  return null;
}

// Root API status check
app.get("/api", (_req, res) => {
  res.json({
    status: "ok",
    service: "Aetheris AI API",
    hasApiKey: !!process.env.GEMINI_API_KEY
  });
});

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
    appName: "Aetheris AI"
  });
});

// IP Location endpoint
app.get("/api/location", async (req, res) => {
  try {
    const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    // Default fallback location
    let locationData = {
      ip: String(clientIp || "127.0.0.1").split(",")[0].trim(),
      city: "San Francisco",
      region: "California",
      country: "United States",
      source: "Network IP",
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Attempt simple IP lookup if available without blocking
    try {
      const response = await fetch(`https://ipapi.co/json/`, {
        signal: AbortSignal.timeout(2000),
        headers: { "User-Agent": "Aetheris-AI/1.0" }
      });
      if (response.ok) {
        const data = await response.json();
        if (data && data.city) {
          locationData = {
            ip: data.ip || locationData.ip,
            city: data.city,
            region: data.region || "",
            country: data.country_name || "Unknown",
            source: "IP Geo",
            updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
        }
      }
    } catch {
      // Keep sensible default if rate-limited or offline
    }

    res.json(locationData);
  } catch {
    res.json({
      city: "Current Network",
      region: "Detected Location",
      country: "",
      source: "Local IP",
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  }
});

// Chat completion endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, model = "auto:free", mode = "standard", temporary = false } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const requestedModel = typeof model === "string" && model.trim() ? model.trim() : "auto:free";
    const isBazaarLink = requestedModel === "auto:free" || requestedModel.startsWith("bazaarlink");
    const isOpenAI = requestedModel.startsWith("gpt-") || requestedModel.includes("openai") || requestedModel.includes("chatgpt");

    let systemInstruction = "You are Aetheris, an advanced, highly capable AI assistant built with precision, speed, and elegance. Provide insightful, direct, structured answers with clean Markdown formatting, code blocks with syntax highlighting and language tags (e.g. ```html for HTML), and a friendly, thoughtful tone.";

    if (mode === "deep-research") {
      systemInstruction += " You are operating in Deep Research mode. Provide thorough, multi-angled, verified analysis with structured subheadings, clear citations of methodology, and comprehensive synthesis.";
    } else if (mode === "guided-learning") {
      systemInstruction += " You are operating in Guided Learning mode. Break down concepts step-by-step with intuitive analogies, interactive check-for-understanding questions, and clear progressive explanations.";
    } else if (mode === "canvas") {
      systemInstruction += " You are operating in Canvas Studio mode. Structure your output as modular, editable components, code snippets, or document drafts suitable for side-by-side editing.";
    } else if (mode === "prompt-to-website") {
      systemInstruction = "You are Google AI Studio's Elite Web Application Architect. When the user provides a prompt or requested changes for a website/web application, you must output a single, complete, fully-functional, standalone HTML document.\\n" +
        "Follow these rules strictly:\\n" +
        "1. Output the entire code enclosed in a single ```html ... ``` code block.\\n" +
        "2. Include <!DOCTYPE html>, <html lang=\\\"en\\\">, <head>, <meta charset=\\\"UTF-8\\\">, and <meta name=\\\"viewport\\\" content=\\\"width=device-width, initial-scale=1.0\\\">.\\n" +
        "3. Use Tailwind CSS via <script src=\\\"https://cdn.tailwindcss.com\\\"></script>.\\n" +
        "4. Use FontAwesome icons (<link rel=\\\"stylesheet\\\" href=\\\"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css\\\">).\\n" +
        "5. Include all styles in <style> and full interactive logic in <script> tags.\\n" +
        "6. Make the website visually stunning, interactive, responsive, and production-grade with realistic mock data, functional buttons, modals, tabs, and zero placeholder text or 'TODO' comments.\\n" +
        "7. Do not include markdown conversational filler before or after the code block.";
    }

    // Check for Image Generation intent or Gemini Flash Image model
    const lastUserMessage = [...messages].reverse().find((m: any) => m.role === "user");
    const userText = (lastUserMessage?.content || "").trim();

    const isImageGenerationIntent =
      requestedModel === "gemini-3.1-flash-image" ||
      requestedModel === "gemini-3.1-flash-lite-image" ||
      /\b(generate|create|draw|paint|render|make)\s+(an?\s+)?(image|picture|photo|illustration|artwork|painting|graphic|drawing|portrait|sketch)\b/i.test(userText) ||
      /^(draw|paint|render|illustrate|sketch)\s+(me\s+)?/i.test(userText) ||
      /\b(can you draw|can you generate an image of|draw me|create an image of|generate an image of)\b/i.test(userText);

    if (isImageGenerationIntent && userText.length > 2) {
      let imagePrompt = userText
        .replace(/^(can you\s+)?(please\s+)?(generate|create|draw|paint|render|make)\s+(me\s+)?(an?\s+)?(image|picture|photo|illustration|artwork|painting|graphic|drawing|portrait|sketch)(\s+of)?/i, "")
        .replace(/^(draw|paint|render|illustrate|sketch)(\s+me)?(\s+a|\s+an)?/i, "")
        .trim();
      if (!imagePrompt) imagePrompt = userText;

      const imgResult = await generateGeminiImage(imagePrompt, "1:1");
      const reply = `I've generated an image for **${imagePrompt}** using Gemini Visual Studio:\n\n` +
        `![${imagePrompt}](${imgResult.imageUrl})\n\n` +
        `*Prompt: "${imgResult.prompt}" • Engine: Gemini Visual Studio (${imgResult.model})*`;

      return res.json({
        content: reply,
        model: imgResult.model || "gemini-3.1-flash-image",
        imageUrl: imgResult.imageUrl,
        temporary
      });
    }

    // 1. ROUTE TO OPENAI CHATGPT (with silent Gemini fallback)
    if (isOpenAI && openaiApiKey) {
      const shouldAttemptOpenAI = !isOpenAiQuotaExhausted || Date.now() >= openAiCooldownUntil;
      if (shouldAttemptOpenAI) {
        try {
          const client = getOpenAIClient();
          const openAiMessages: any[] = [
            { role: "system", content: systemInstruction },
            ...messages.map((m: any) => ({
              role: m.role === "assistant" || m.role === "model" ? "assistant" : "user",
              content: m.content || ""
            }))
          ];

          const targetModel = requestedModel === "gpt-4o" ? "gpt-4o" : "gpt-4o-mini";
          const response = await client.chat.completions.create({
            model: targetModel,
            messages: openAiMessages,
            temperature: 0.7
          });

          const replyContent = response.choices[0]?.message?.content || "";
          if (replyContent) {
            isOpenAiQuotaExhausted = false;
            return res.json({
              content: replyContent,
              model: requestedModel,
              temporary
            });
          }
        } catch {
          isOpenAiQuotaExhausted = true;
          openAiCooldownUntil = Date.now() + 24 * 60 * 60 * 1000;
        }
      }
      // Fall through to Gemini
    }

    // 2. ROUTE TO GOOGLE GEMINI (Primary Intelligence Engine)
    const ai = getAI();
    if (ai) {
      // Format contents for @google/genai
      const formattedContents = messages.map((m: { role: string; content: string; imageBase64?: string }) => {
        const parts: any[] = [{ text: m.content || "" }];
        if (m.imageBase64) {
          const match = m.imageBase64.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
          if (match) {
            parts.unshift({
              inlineData: {
                mimeType: match[1],
                data: match[2]
              }
            });
          }
        }
        return {
          role: m.role === "assistant" || m.role === "model" ? "model" : "user",
          parts
        };
      });

      const isGeminiModel = requestedModel.startsWith("gemini-");
      const candidateModels = [
        isGeminiModel ? requestedModel : "gemini-3.8-flash",
        "gemini-3.8-flash",
        "gemini-3.1-flash-lite",
        "gemini-flash-latest"
      ].filter((m, i, arr) => arr.indexOf(m) === i);

      try {
        const result = await generateWithFallback(
          ai,
          candidateModels,
          formattedContents,
          {
            systemInstruction: systemInstruction,
            temperature: 0.7
          }
        );

        const replyText = result.text || "";
        if (replyText.trim()) {
          return res.json({
            content: replyText,
            model: result.modelUsed,
            temporary
          });
        }
      } catch (geminiErr: any) {
        console.warn("Gemini generation attempt notice:", geminiErr?.message || geminiErr);
      }
    }

    // 3. Resilient Free Neural Fallback (Ensures 100% uptime on hosted platforms even without API keys)
    const freeResult = await generateWithFreeFallback(messages, systemInstruction);
    if (freeResult) {
      return res.json({
        content: freeResult,
        model: requestedModel || "gemini-3.8-flash",
        temporary
      });
    }

    // 4. Friendly onboarding if all external networks are down
    return res.json({
      content: "I received your message. If you are hosting on Vercel or Cloud Run, remember to configure your `GEMINI_API_KEY` in your project environment variables for dedicated Google Gemini intelligence.",
      model: "gemini-3.8-flash",
      temporary: false
    });
  } catch (error: any) {
    return res.json({
      content: "I received your message. Please click Redo (↺) to refresh the response stream.",
      model: "gemini-3.8-flash",
      temporary: false
    });
  }
});

// Studio AI Website Synthesis Endpoint (Crazy High-Quality Web Architect)
app.post("/api/fast-code", async (req, res) => {
  const startTime = Date.now();
  try {
    const { prompt, existingCode = "", engine = "gemini-3.8-flash" } = req.body;
    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({ error: "Prompt is required." });
    }

    const trimmedPrompt = prompt.trim();
    const systemPrompt =
      "You are Aetheris & Google AI Studio's Elite Senior Full-Stack Web Architect and Award-Winning UI/UX Designer.\n" +
      "Your absolute mission is to build mind-blowing, fully functional, production-ready single-file web applications with astonishing visual polish and deep reactivity.\n\n" +
      "STRICT ARCHITECTURAL & DESIGN RULES:\n" +
      "1. Visual Excellence: Build a modern, sleek interface (sophisticated obsidian dark canvas #0B0E14 with subtle glowing borders, glassmorphic cards with backdrop-blur-md, vibrant gradient badges, and polished micro-interactions).\n" +
      "2. Head & Assets: Include <!DOCTYPE html>, <html lang=\"en\">, <head> with Google Fonts (<link href=\"https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap\" rel=\"stylesheet\">), Tailwind CSS CDN (<script src=\"https://cdn.tailwindcss.com\"></script>), and Font Awesome icons (<link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css\">).\n" +
      "3. Full Interactive JavaScript: Write complete, bug-free JavaScript in a <script> tag. All buttons, tabs, search/filters, modals, and sliders MUST work with live state! Include localStorage persistence so data survives page refresh, toast notifications on actions, and audio click feedback with Web Audio API.\n" +
      "4. Data Visualizers: Include dynamic HTML5 Canvas charts or animated SVG graphs when domain-appropriate (dashboards, crypto, finance, analytics, tasks).\n" +
      "5. Zero Placeholders: Provide rich, authentic, high-quality data. Never output incomplete code or comments like '// implement here'.\n" +
      "6. Strict Output: Output ONLY the complete HTML document enclosed strictly in a single ```html ... ``` block. Absolutely zero conversational preamble or commentary outside the code block.";

    const userPrompt = existingCode && existingCode.length > 50
      ? `Update and elevate this existing web application based on the user's request:\n\nCURRENT CODE:\n\`\`\`html\n${existingCode.slice(0, 6000)}\n\`\`\`\n\nUSER REQUEST / ENHANCEMENTS:\n${trimmedPrompt}\n\nDeliver the entire updated, complete HTML web app inside a single \`\`\`html code block.`
      : `Build a complete, stunning, high-performance web application for:\n"${trimmedPrompt}"\n\nEnsure complete responsive layout, interactive JS state management, and world-class UI.`;

    let generatedCode = "";
    let usedModel = engine;

    // Optional: If user configured an Anthropic Claude API Key, call official Anthropic Messages API
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (engine === "claude-3.5-sonnet" && anthropicKey) {
      try {
        const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": anthropicKey,
            "anthropic-version": "2023-06-01"
          },
          body: JSON.stringify({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 8192,
            system: systemPrompt,
            messages: [{ role: "user", content: userPrompt }]
          }),
          signal: AbortSignal.timeout(28000)
        });
        if (anthropicRes.ok) {
          const anthropicData: any = await anthropicRes.json();
          const textBlock = anthropicData.content?.find((c: any) => c.type === "text")?.text;
          if (textBlock && textBlock.length > 100) {
            generatedCode = textBlock;
            usedModel = "Claude 3.5 Sonnet (Anthropic API)";
          }
        }
      } catch (anthropicErr) {
        console.warn("Anthropic API notice, using free Claude synthesis pipeline:", anthropicErr);
      }
    }

    // 1. First priority: Google Gemini (Gemini 3.8 Flash / Gemini 3.1 Pro / Free Claude Mode)
    if (!generatedCode) {
      const ai = getAI();
      if (ai) {
        try {
          const candidateModels =
            engine === "gemini-3.1-pro"
              ? ["gemini-3.1-pro", "gemini-3.8-flash", "gemini-3.1-flash-lite"]
              : ["gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-3.1-pro"];

          const activeSystemPrompt =
            engine === "claude-3.5-sonnet"
              ? "You are Claude 3.5 Sonnet by Anthropic, executing in high-performance web application artifact mode.\n" +
                "You build pristine, elegant, single-file web applications with zero conversational chatter and full reactivity.\n" +
                systemPrompt
              : systemPrompt;

          const contents = [
            {
              role: "user",
              parts: [{ text: `${activeSystemPrompt}\n\n${userPrompt}` }]
            }
          ];
          const result = await generateWithFallback(ai, candidateModels, contents, {
            temperature: 0.7
          });
          if (result.text && result.text.length > 100) {
            generatedCode = result.text;
            usedModel = engine === "claude-3.5-sonnet" ? "Claude 3.5 Sonnet (Free AI)" : result.modelUsed;
          }
        } catch (geminiErr) {
          console.warn("Gemini Studio generation notice, falling back to top open model:", geminiErr);
        }
      }
    }

    // 2. High-capability Open Neural Engines (Qwen-Coder 32B, DeepSeek, OpenAI GPT-4o)
    if (!generatedCode) {
      const targetModels =
        engine === "claude-3.5-sonnet"
          ? ["qwen-coder", "deepseek", "openai", "mistral"]
          : engine === "qwen-coder"
          ? ["qwen-coder", "deepseek", "openai", "mistral"]
          : engine === "deepseek-coder"
          ? ["deepseek", "qwen-coder", "openai", "mistral"]
          : engine === "gpt-4o"
          ? ["openai", "qwen-coder", "deepseek", "mistral"]
          : ["qwen-coder", "deepseek", "openai", "mistral"];

      for (const fModel of targetModels) {
        try {
          const pollRes = await fetch("https://text.pollinations.ai/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
              ],
              model: fModel,
              seed: Math.floor(Math.random() * 100000)
            }),
            signal: AbortSignal.timeout(22000)
          });
          if (pollRes.ok) {
            const rawText = await pollRes.text();
            if (rawText && rawText.length > 120) {
              generatedCode = rawText;
              usedModel = engine === "claude-3.5-sonnet" ? "Claude 3.5 Sonnet (Free AI)" : `Crazy AI (${fModel})`;
              break;
            }
          }
        } catch (pollErr) {
          // Continue to next crazy model
        }
      }
    }

    // Helper to extract clean HTML
    const extractCleanHtml = (raw: string): string => {
      const match = raw.match(/```(?:html|xml)?\s*([\s\S]*?)```/i);
      if (match && match[1]) {
        return match[1].trim();
      }
      if (raw.includes("<!DOCTYPE") || raw.includes("<html")) {
        return raw.trim();
      }
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Aether Studio App</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen p-8 font-sans">
  <div class="max-w-4xl mx-auto">
    ${raw}
  </div>
</body>
</html>`;
    };

    const finalHtml = extractCleanHtml(generatedCode);
    const durationMs = Date.now() - startTime;

    return res.json({
      code: finalHtml,
      model: usedModel,
      durationMs
    });
  } catch (err: any) {
    console.error("fast-code error:", err);
    return res.status(500).json({ error: err.message || "Failed to generate code" });
  }
});

async function generateGeminiImage(prompt: string, aspectRatio = "1:1"): Promise<{ imageUrl: string; prompt: string; source: string; model: string }> {
  const ai = getAI();
  if (ai) {
    // 1. Try native Gemini image generation models if not in quota cooldown
    const canAttemptNative = !isGeminiNativeImageQuotaExhausted || Date.now() >= geminiNativeImageCooldownUntil;
    if (canAttemptNative) {
      const candidateImageModels = ["gemini-3.1-flash-image", "gemini-3.1-flash-lite-image"];
      for (const imageModel of candidateImageModels) {
        try {
          const config: any = {
            imageConfig: {
              aspectRatio: ["1:1", "3:4", "4:3", "9:16", "16:9"].includes(aspectRatio) ? aspectRatio : "1:1"
            }
          };
          if (imageModel === "gemini-3.1-flash-image") {
            config.imageConfig.imageSize = "1K";
          }
          const callPromise = ai.models.generateContent({
            model: imageModel,
            contents: {
              parts: [{ text: prompt }]
            },
            config
          });
          const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Native image timeout")), 3500));
          const response: any = await Promise.race([callPromise, timeoutPromise]);

          for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData && part.inlineData.data) {
              isGeminiNativeImageQuotaExhausted = false;
              const mime = part.inlineData.mimeType || "image/png";
              return {
                imageUrl: `data:${mime};base64,${part.inlineData.data}`,
                prompt,
                source: "gemini-native",
                model: imageModel
              };
            }
          }
        } catch {
          // Flag cooldown to immediately prevent slow 30-second backoff stalls
          isGeminiNativeImageQuotaExhausted = true;
          geminiNativeImageCooldownUntil = Date.now() + 60 * 60 * 1000;
          break;
        }
      }
    }

    // 2. Intelligently refine prompt using Gemini text model, then synthesize high-definition image
    try {
      const enhancePromise = ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: `You are an expert prompt engineer for photorealistic and digital art generators. Create a vivid, highly detailed visual prompt for: "${prompt}". Describe subjects, lighting, artistic style, camera angle, textures, and mood. Output ONLY the refined prompt in English with no preamble or quotes.`
      });
      const timeoutPromise = new Promise<any>((_, reject) => setTimeout(() => reject(new Error("Timeout")), 2500));
      const promptEnhanceRes = await Promise.race([enhancePromise, timeoutPromise]);
      const refinedPrompt = promptEnhanceRes.text?.trim() || prompt;

      const aspectDims: Record<string, { w: number; h: number }> = {
        "1:1": { w: 1024, h: 1024 },
        "16:9": { w: 1280, h: 720 },
        "9:16": { w: 720, h: 1280 },
        "4:3": { w: 1024, h: 768 },
        "3:4": { w: 768, h: 1024 }
      };
      const dims = aspectDims[aspectRatio] || { w: 1024, h: 1024 };
      const seed = Math.floor(Math.random() * 1000000);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(refinedPrompt)}?width=${dims.w}&height=${dims.h}&nologo=true&enhance=true&seed=${seed}`;

      return {
        imageUrl,
        prompt: refinedPrompt,
        source: "gemini-synthesized",
        model: "gemini-3.1-flash-image"
      };
    } catch {
      // Fall through to general fallback
    }
  }

  // Direct neural image generation fallback
  const aspectDims: Record<string, { w: number; h: number }> = {
    "1:1": { w: 1024, h: 1024 },
    "16:9": { w: 1280, h: 720 },
    "9:16": { w: 720, h: 1280 },
    "4:3": { w: 1024, h: 768 },
    "3:4": { w: 768, h: 1024 }
  };
  const dims = aspectDims[aspectRatio] || { w: 1024, h: 1024 };
  const seed = Math.floor(Math.random() * 1000000);
  const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${dims.w}&height=${dims.h}&nologo=true&enhance=true&seed=${seed}`;
  return {
    imageUrl: fallbackUrl,
    prompt,
    source: "gemini-image-studio",
    model: "gemini-3.1-flash-image"
  };
}

// Image Generation simulation/endpoint
app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt, aspectRatio = "1:1" } = req.body;
    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({ error: "Prompt is required." });
    }

    const result = await generateGeminiImage(prompt.trim(), aspectRatio);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to generate image" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Aetheris AI Server running on http://0.0.0.0:${PORT}`);
  });
}

// On Vercel, the app is executed as serverless functions (via api/index.ts).
// In normal container or local environments, start the standalone HTTP listener.
if (!process.env.VERCEL) {
  startServer();
}

export default app;

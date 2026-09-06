import { GoogleGenAI } from "@google/genai";

export const config = {
  maxDuration: 60,
};

function extractCleanCode(raw: string): string {
  let text = raw.trim();
  const htmlMatch = text.match(/```(?:html|htm)?\s*([\s\S]*?)```/i);
  if (htmlMatch && htmlMatch[1] && htmlMatch[1].trim().length > 50) {
    return htmlMatch[1].trim();
  }
  const doctypeIdx = text.toLowerCase().indexOf("<!doctype html");
  if (doctypeIdx !== -1) {
    const endHtmlIdx = text.toLowerCase().lastIndexOf("</html>");
    if (endHtmlIdx !== -1) {
      return text.slice(doctypeIdx, endHtmlIdx + 7).trim();
    }
    return text.slice(doctypeIdx).trim();
  }
  return text;
}

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const startTime = Date.now();
  try {
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }

    const { prompt, existingCode = "", engine = "gemini-3.8-flash" } = body || {};
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

    const userPrompt =
      existingCode && existingCode.length > 50
        ? `Update and elevate this existing web application based on the user's request:\n\nCURRENT CODE:\n\`\`\`html\n${existingCode.slice(0, 6000)}\n\`\`\`\n\nUSER REQUEST / ENHANCEMENTS:\n${trimmedPrompt}\n\nDeliver the entire updated, complete HTML web app inside a single \`\`\`html code block.`
        : `Build a complete, stunning, high-performance web application for:\n"${trimmedPrompt}"\n\nEnsure complete responsive layout, interactive JS state management, and world-class UI.`;

    let generatedCode = "";
    let usedModel = engine;

    // Optional: Anthropic Claude API Key if present
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
        console.warn("Anthropic API notice:", anthropicErr);
      }
    }

    // 1. Google Gemini API (Gemini 3.8 Flash / Gemini 3.1 Pro / Free Claude Mode)
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!generatedCode && geminiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey: geminiKey });
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

        for (const candidate of candidateModels) {
          try {
            const resp = await ai.models.generateContent({
              model: candidate,
              contents: [{ role: "user", parts: [{ text: `${activeSystemPrompt}\n\n${userPrompt}` }] }],
              config: { temperature: 0.7 }
            });
            if (resp.text && resp.text.length > 100) {
              generatedCode = resp.text;
              usedModel = engine === "claude-3.5-sonnet" ? "Claude 3.5 Sonnet (Free AI)" : candidate;
              break;
            }
          } catch (mErr) {
            console.warn(`Model ${candidate} failed on Vercel:`, mErr);
          }
        }
      } catch (geminiErr) {
        console.warn("Gemini Studio generation notice:", geminiErr);
      }
    }

    // 2. High-capability Open Neural Engines Fallback (Qwen-Coder 32B, DeepSeek, OpenAI GPT-4o)
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
              seed: Math.floor(Math.random() * 1000000)
            }),
            signal: AbortSignal.timeout(24000)
          });
          if (pollRes.ok) {
            const rawText = await pollRes.text();
            if (rawText && rawText.length > 120) {
              generatedCode = rawText;
              usedModel = engine === "claude-3.5-sonnet" ? "Claude 3.5 Sonnet (Free AI)" : `Crazy AI (${fModel})`;
              break;
            }
          }
        } catch (fErr) {
          console.warn(`Fallback model ${fModel} notice:`, fErr);
        }
      }
    }

    const cleanCode = extractCleanCode(generatedCode);
    const durationMs = Date.now() - startTime;

    return res.status(200).json({
      code: cleanCode,
      raw: generatedCode,
      model: usedModel,
      durationMs,
      timestamp: Date.now()
    });
  } catch (error: any) {
    return res.status(500).json({
      error: "Website generation error",
      details: error?.message || "Unknown error"
    });
  }
}

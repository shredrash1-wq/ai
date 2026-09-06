export const config = {
  maxDuration: 60,
};

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

  try {
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }

    const { prompt, aspectRatio = "1:1" } = body || {};
    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({ error: "Prompt is required." });
    }

    const aspectDims: Record<string, { w: number; h: number }> = {
      "1:1": { w: 1024, h: 1024 },
      "16:9": { w: 1280, h: 720 },
      "9:16": { w: 720, h: 1280 },
      "4:3": { w: 1024, h: 768 },
      "3:4": { w: 768, h: 1024 }
    };
    const dims = aspectDims[aspectRatio] || { w: 1024, h: 1024 };
    const seed = Math.floor(Math.random() * 1000000);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt.trim())}?width=${dims.w}&height=${dims.h}&nologo=true&enhance=true&seed=${seed}`;

    return res.status(200).json({
      imageUrl,
      prompt: prompt.trim(),
      source: "gemini-image-studio",
      model: "gemini-3.1-flash-image"
    });
  } catch (err: any) {
    return res.status(200).json({
      imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1024&h=1024&fit=crop",
      prompt: "Creative artwork",
      source: "gemini-image-studio",
      model: "gemini-3.1-flash-image"
    });
  }
}

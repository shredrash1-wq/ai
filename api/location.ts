export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  try {
    const clientIp = req.headers["x-forwarded-for"] || "127.0.0.1";
    let locationData = {
      ip: String(clientIp).split(",")[0].trim(),
      city: "San Francisco",
      region: "California",
      country: "United States",
      source: "Network IP",
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    try {
      const response = await fetch("https://ipapi.co/json/", {
        signal: AbortSignal.timeout(2000),
        headers: { "User-Agent": "Aetheris-AI/1.0" }
      });
      if (response.ok) {
        const data: any = await response.json();
        if (data && data.city) {
          locationData = {
            ip: data.ip || locationData.ip,
            city: data.city,
            region: data.region || "",
            country: data.country_name || "United States",
            source: "IP Geo",
            updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
        }
      }
    } catch {
      // ignore
    }

    res.status(200).json(locationData);
  } catch {
    res.status(200).json({
      city: "Current Network",
      region: "Detected Location",
      country: "",
      source: "Local IP",
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  }
}

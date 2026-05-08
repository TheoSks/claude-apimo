export async function GET() {
  const PROVIDER = process.env.APIMO_PROVIDER || "4019";
  const TOKEN = process.env.APIMO_TOKEN || "5ccdef5377bd6f2f41681f17233c7818a3484333";
  const AGENCY = process.env.APIMO_AGENCY || "23650";

  const auth = Buffer.from(`${PROVIDER}:${TOKEN}`).toString("base64");

  try {
    const url = `https://api.apimo.pro/agencies/${AGENCY}/properties?limit=200`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      const text = await response.text();
      return Response.json({ error: text }, { status: response.status });
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

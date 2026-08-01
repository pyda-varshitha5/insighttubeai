const API_KEY = process.env.YOUTUBE_API_KEY;

const BASE_URL = "https://www.googleapis.com/youtube/v3/search";

export async function searchYoutube(query: string) {
  console.log("========== YOUTUBE DEBUG ==========");
  console.log("API KEY:", API_KEY);

  const params = new URLSearchParams({
    part: "snippet",
    q: query,
    type: "video",
    maxResults: "10",
    key: API_KEY || "",
  });

  const url = `${BASE_URL}?${params.toString()}`;

  console.log("REQUEST URL:", url);

  const response = await fetch(url);

  console.log("STATUS:", response.status);

  const data = await response.json();

  console.log("RESPONSE:", data);

  if (!response.ok) {
    throw new Error(JSON.stringify(data));
  }

  return data.items;
}
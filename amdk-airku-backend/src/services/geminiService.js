
const { GoogleGenAI, Type } = require("@google/genai");

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Fungsi fallback untuk mengklasifikasikan wilayah toko tanpa AI
function fallbackClassifyStoreRegion(storeLocation) {
  const pdamKulonProgoLongitude = 110.1486773;
  
  // Bounding box untuk Kulon Progo (perkiraan kasar)
  const minLat = -8.00;
  const maxLat = -7.67;
  const minLng = 110.00;
  const maxLng = 110.30;
  
  const { lat, lng } = storeLocation;
  
  // Cek apakah lokasi berada dalam wilayah Kulon Progo
  if (lat < minLat || lat > maxLat || lng < minLng || lng > maxLng) {
    return { region: "Bukan di Kulon Progo" };
  }
  
  // Klasifikasikan berdasarkan garis bujur kantor PDAM
  if (lng > pdamKulonProgoLongitude) {
    return { region: "Timur" };
  } else {
    return { region: "Barat" };
  }
}

async function classifyStoreRegion(storeLocation) {
  const pdamKulonProgoLongitude = 110.1486773;

  const prompt = `
    You are a geographical data analyst for KU AIRKU, a water distributor in Kulon Progo Regency, Yogyakarta, Indonesia.
    Your task is to classify a new store location into one of our two sales territories: 'Timur' (East) or 'Barat' (West), or determine if it's outside our service area.

    Here are the rules:
    1.  Our service area is strictly within Kulon Progo Regency. A very rough bounding box for Kulon Progo is between latitudes -7.67 to -8.00 and longitudes 110.00 to 110.30.
    2.  The dividing line for our territories is the longitude of our main office, PDAM Tirta Binangun, which is at longitude ${pdamKulonProgoLongitude}.
    3.  Any location east of this longitude is 'Timur'.
    4.  Any location west of this longitude is 'Barat'.
    5.  Any location outside the Kulon Progo bounding box is 'Bukan di Kulon Progo'.

    A new store has been added at this location:
    ${JSON.stringify(storeLocation)}

    Follow these steps:
    1.  Check if the new store's latitude is between -7.67 and -8.00 AND its longitude is between 110.00 and 110.30.
    2.  If it is NOT within this bounding box, classify it as 'Bukan di Kulon Progo'.
    3.  If it IS within the bounding box, compare its longitude to the dividing line (${pdamKulonProgoLongitude}).
    4.  If the store's longitude is greater than ${pdamKulonProgoLongitude}, classify it as 'Timur'.
    5.  If the store's longitude is less than or equal to ${pdamKulonProgoLongitude}, classify it as 'Barat'.

    Return a JSON object with a single key "region" and the classified territory name as its value (either 'Timur', 'Barat', or 'Bukan di Kulon Progo').
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            region: { type: Type.STRING },
          },
        },
      },
    });
    
    // The response.text is a string containing JSON, so we parse it.
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error classifying store region from Gemini Service:", error);
    
    // Gunakan fallback mechanism jika AI service tidak tersedia
    try {
      console.log("Using fallback mechanism to classify store region");
      return fallbackClassifyStoreRegion(storeLocation);
    } catch (fallbackError) {
      console.error("Error in fallback mechanism:", fallbackError);
      // Rethrow a more generic error to not expose implementation details to the client
      throw new Error("Failed to communicate with the AI service.");
    }
  }
}

async function analyzeSurveyFeedback(feedbackList) {
    const prompt = `
    You are a business analyst for KU AIRKU, a water distribution company.
    You have been given a list of raw feedback from various store owners.
    Your task is to analyze all the feedback and provide a structured summary in JSON format.

    Here is the list of feedback:
    ${JSON.stringify(feedbackList)}

    Please perform the following analysis:
    1.  **Overall Summary**: Write a concise summary (2-3 sentences) that captures the main points and general feeling from all the feedback provided.
    2.  **Overall Sentiment**: Determine the overall sentiment. Classify it as one of the following: 'Sangat Positif', 'Positif', 'Netral', 'Negatif', 'Sangat Negatif'.
    3.  **Key Themes**: Identify the main themes or topics discussed in the feedback. For each theme, provide a list of 2-3 direct, representative quotes from the feedback list. The themes should be in Indonesian (e.g., "Harga", "Kualitas Produk", "Layanan Pengiriman", "Stok", "Saran & Kritik Lain").

    Return the analysis as a single JSON object.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING, description: "Ringkasan umum dari semua feedback." },
                        sentiment: { type: Type.STRING, description: "Sentimen keseluruhan (e.g., 'Positif')." },
                        themes: {
                            type: Type.ARRAY,
                            description: "Daftar tema utama yang diidentifikasi dari feedback.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    theme: { type: Type.STRING, description: "Nama tema (e.g., 'Harga')." },
                                    quotes: {
                                        type: Type.ARRAY,
                                        description: "Kutipan langsung yang representatif untuk tema ini.",
                                        items: { type: Type.STRING },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error analyzing feedback from Gemini Service:", error);
        throw new Error("Gagal berkomunikasi dengan layanan AI untuk analisis.");
    }
}


module.exports = {
    classifyStoreRegion,
    analyzeSurveyFeedback,
};


const { GoogleGenAI, Type } = require("@google/genai");

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Fungsi fallback untuk mengklasifikasikan wilayah toko tanpa AI
function fallbackClassifyStoreRegion(storeLocation) {
  const { lat, lng } = storeLocation;
  
  // Bounding box untuk seluruh Provinsi DIY (Daerah Istimewa Yogyakarta)
  const DIY_MIN_LAT = -8.20;
  const DIY_MAX_LAT = -7.50;
  const DIY_MIN_LNG = 110.00;
  const DIY_MAX_LNG = 110.90;
  
  // Cek apakah lokasi berada dalam wilayah DIY
  if (lat < DIY_MIN_LAT || lat > DIY_MAX_LAT || lng < DIY_MIN_LNG || lng > DIY_MAX_LNG) {
    return { region: "Bukan di DIY" };
  }
  
  /**
   * URUTAN PENGECEKAN PENTING:
   * 1. Kota Yogyakarta (paling spesifik, di tengah)
   * 2. Sleman (utara)
   * 3. Bantul (selatan)
   * 4. Kulon Progo (barat)
   * 5. Gunung Kidul (timur)
   */
  
  // 1. KOTA YOGYAKARTA - Pusat kota, area terkecil (sekitar 32.5 km²)
  // Koordinat referensi: Malioboro (-7.7956, 110.3695), Alun-alun Utara (-7.7983, 110.3642)
  // BATAS UTARA: -7.775 (perbatasan dengan Sleman/Depok)
  // BATAS SELATAN: -7.825 (perbatasan dengan Bantul)
  // Area: Malioboro, Kraton, Pakualaman, Gondomanan, Gedongtengen
  if (lat >= -7.825 && lat <= -7.775 && lng >= 110.345 && lng <= 110.425) {
    return { region: "Kota Yogyakarta" };
  }
  
  // 2. SLEMAN - Bagian UTARA DIY (sekitar 574.82 km²)
  // Koordinat referensi: UGM (-7.7710, 110.3775), Depok (-7.7630, 110.3974), Kaliurang (-7.5953, 110.4345)
  // BATAS SELATAN: -7.775 (berbatasan dengan Kota Yogya)
  // BATAS UTARA: -7.50 (sampai lereng Merapi)
  // BATAS BARAT: lng >= 110.30 (tidak termasuk area Kulon Progo di barat)
  // Area: Depok, Caturtunggal, Condongcatur, Ngaglik, Mlati (timur), Seyegan
  if (lat >= -7.80 && lat <= -7.50 && lng >= 110.30 && lng <= 110.60) {
    return { region: "Sleman" };
  }
  
  // 3. BANTUL - Bagian SELATAN DIY (sekitar 506.85 km²)
  // Koordinat referensi: Parangtritis (-8.0228, 110.3290), Alun-alun Bantul (-7.8878, 110.3289)
  // Batas utara: berbatasan dengan Kota Yogya, batas selatan: Laut Selatan
  // PENTING: Bantul TIDAK termasuk area Kulon Progo (longitude < 110.30)
  if (lat >= -8.20 && lat <= -7.825 && lng >= 110.30 && lng <= 110.50) {
    return { region: "Bantul" };
  }
  
  // 4. KULON PROGO - Bagian BARAT DIY (sekitar 586.27 km²)
  // Koordinat referensi: Wates (-7.8564, 110.1599), Bandara YIA (-7.9000, 110.0561), Sentolo (-7.82, 110.21), Temon (-7.90, 110.04), Kalibawang (-7.62, 110.17)
  // PENTING: Kulon Progo mencakup area longitude 110.00 - 110.30
  // Batas utara diperluas ke -7.60 untuk mencakup seluruh area Kulon Progo termasuk kecamatan di perbatasan dengan Sleman (seperti Kalibawang)
  // Sub-klasifikasi: Timur dan Barat berdasarkan PDAM Tirta Binangun (110.1486773)
  if (lat >= -8.10 && lat <= -7.60 && lng >= 110.00 && lng <= 110.30) {
    const pdamKulonProgoLongitude = 110.1486773;
    if (lng > pdamKulonProgoLongitude) {
      return { region: "Kulon Progo - Timur" };
    } else {
      return { region: "Kulon Progo - Barat" };
    }
  }
  
  // 5. GUNUNG KIDUL - Bagian TIMUR DIY (sekitar 1,485.36 km², terluas)
  // Koordinat referensi: Wonosari (-7.9655, 110.6027), Pantai Baron (-8.1245, 110.5614)
  // Karakteristik: area karst dengan banyak gua
  if (lat >= -8.20 && lat <= -7.60 && lng >= 110.45 && lng <= 110.90) {
    return { region: "Gunung Kidul" };
  }
  
  // Jika masih dalam DIY tapi tidak masuk kategori spesifik (area perbatasan)
  return { region: "DIY (area tidak spesifik)" };
}

async function classifyStoreRegion(storeLocation) {
  const pdamKulonProgoLongitude = 110.1486773;

  const prompt = `
    You are a geographical data analyst for KU AIRKU, a water distributor in Yogyakarta Special Region (Daerah Istimewa Yogyakarta / DIY), Indonesia.
    Your task is to classify a new store location based on which regency/city (kabupaten/kota) it belongs to within DIY.

    DIY consists of 5 administrative divisions with PRECISE boundaries:
    
    1. **Kota Yogyakarta** (Central City - SMALLEST, ~32.5 km²)
       - The historic city center, includes Malioboro, Kraton, Pakualaman
       - Precise bounding box: lat -7.825 to -7.775, lng 110.345 to 110.425
       - Key landmarks: Malioboro (-7.7956, 110.3695), Alun-alun Utara (-7.7983, 110.3642)
       - IMPORTANT: North boundary at -7.775 (does NOT include Depok/UGM area)
       - CHECK THIS FIRST as it's surrounded by other regions
    
    2. **Kabupaten Sleman** (Northern DIY - ~574.82 km²)
       - North of Kota Yogyakarta (starts from lat -7.775), extends to Merapi volcano slopes
       - Bounding box: lat -7.80 to -7.50, lng 110.30 to 110.60
       - Key landmarks: UGM (-7.7710, 110.3775), Depok Sleman (-7.7630, 110.3974), Condongcatur (-7.7555, 110.3973), Kaliurang (-7.5953, 110.4345)
       - INCLUDES: Depok, Caturtunggal, UGM area (all are in Sleman, NOT Kota Yogyakarta)
       - IMPORTANT: Western boundary at lng 110.30 (areas with lng < 110.30 are Kulon Progo, not Sleman)
       - Southern border at -7.775 (border with Kota Yogyakarta)
       - Northern border: Merapi slopes at -7.50
    
    3. **Kabupaten Bantul** (Southern DIY - ~506.85 km²)
       - South of Kota Yogyakarta, extends to Indian Ocean coast
       - Bounding box: lat -8.20 to -7.825, lng 110.30 to 110.50
       - Key landmarks: Parangtritis Beach (-8.0228, 110.3290), Bantul Town (-7.8878, 110.3289)
       - Northern border: Kota Yogyakarta, Southern border: Indian Ocean
       - IMPORTANT: Bantul does NOT include areas with lng < 110.30 (those are Kulon Progo)
    
    4. **Kabupaten Kulon Progo** (Western DIY - ~586.27 km²)
       - Western part of DIY, includes new YIA airport, Sentolo, Temon, Kalibawang, and Wates areas
       - Bounding box: lat -8.10 to -7.60, lng 110.00 to 110.30
       - Key landmarks: Wates (-7.8564, 110.1599), YIA Airport (-7.9000, 110.0561), Sentolo (-7.82, 110.21), Temon (-7.90, 110.04), Kalibawang (-7.62, 110.17)
       - IMPORTANT: Kulon Progo covers longitude 110.00 - 110.30 (western part of DIY)
       - Latitude range extended to -7.60 to cover all northern districts like Kalibawang that border Sleman
       - Sub-classification: 'Kulon Progo - Timur' if lng > ${pdamKulonProgoLongitude}, else 'Kulon Progo - Barat'
    
    5. **Kabupaten Gunung Kidul** (Eastern DIY - LARGEST, ~1,485.36 km²)
       - Eastern part of DIY, karst region with many caves
       - Bounding box: lat -8.20 to -7.60, lng 110.45 to 110.90
       - Key landmarks: Wonosari (-7.9655, 110.6027), Baron Beach (-8.1245, 110.5614)

    CRITICAL CLASSIFICATION ORDER (to avoid overlapping regions):
    1. First check if in Kota Yogyakarta (most specific, smallest area)
    2. Then check Sleman (north)
    3. Then check Bantul (south)
    4. Then check Kulon Progo (west)
    5. Finally check Gunung Kidul (east)
    6. If none match but within DIY bounds, return 'DIY (area tidak spesifik)'
    7. If outside DIY bounds (lat -8.20 to -7.50, lng 110.00 to 110.90), return 'Bukan di DIY'

    A new store has been added at this location:
    ${JSON.stringify(storeLocation)}

    Analyze the coordinates CAREFULLY following the order above. Return a JSON object with a single key "region".
    Possible values: 'Kota Yogyakarta', 'Sleman', 'Bantul', 'Kulon Progo - Timur', 'Kulon Progo - Barat', 'Gunung Kidul', 'DIY (area tidak spesifik)', or 'Bukan di DIY'.
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

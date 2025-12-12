import { GoogleGenAI } from "@google/genai";
import { AttendanceRecord, Student } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Helpers ---

// Converts URL or DataURI to raw Base64 string for Gemini
const getImageData = async (source: string): Promise<string> => {
  if (!source) return "";
  
  // If it's already a data URI
  if (source.startsWith('data:image')) {
    return source.split(',')[1];
  } 
  
  // If it's a remote URL
  if (source.startsWith('http')) {
    try {
      const response = await fetch(source);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const res = reader.result as string;
          resolve(res.split(',')[1]);
        };
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.warn("Failed to fetch image for AI:", source);
      return "";
    }
  }
  return "";
};

// Split array into smaller chunks
const chunkArray = <T>(array: T[], size: number): T[][] => {
  const chunked: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunked.push(array.slice(i, i + size));
  }
  return chunked;
};

// --- AI Functions ---

export const identifyStudentsInGroup = async (
  sceneImageBase64: string, 
  candidates: Student[]
): Promise<string[]> => {
  try {
    // 1. Clean the scene image input
    const sceneClean = sceneImageBase64.replace(/^data:image\/\w+;base64,/, "");
    
    // 2. Batch Processing: 
    // CRITICAL FIX: Reduced batch size from 10 to 3. 
    // Sending HD images in large batches exceeds API payload limits, causing silent failures.
    const batches = chunkArray(candidates, 3);

    // 3. Process batches in PARALLEL using Promise.all
    const batchPromises = batches.map(async (batch) => {
      const parts: any[] = [
        { text: "Task: Match faces in the CLASSROOM_SCENE with REFERENCE_STUDENTS.\n\nInstructions:\n1. Be EXTREMELY LENIENT. If there is ANY resemblance, mark as Present.\n2. Ignore bad lighting, blur, different angles, or glasses.\n3. Match based on facial structure (jaw, nose, eyes).\n4. Return ONLY the IDs of matching students in the JSON format." },
        { text: "CLASSROOM_SCENE:" },
        { inlineData: { mimeType: 'image/jpeg', data: sceneClean } },
        { text: "REFERENCE_STUDENTS:" }
      ];

      // Add reference images to prompt
      let validRefsCount = 0;
      for (const student of batch) {
        const imgData = await getImageData(student.photoUrl);
        if (imgData) {
          parts.push({ text: `ID: "${student.id}"` });
          parts.push({ inlineData: { mimeType: 'image/jpeg', data: imgData } });
          validRefsCount++;
        }
      }

      if (validRefsCount === 0) return [];

      parts.push({ text: "Return JSON: { \"present_student_ids\": [\"id1\", \"id2\"] }." });

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: { parts },
          config: { 
            responseMimeType: "application/json",
            temperature: 0.4 
          }
        });

        const text = response.text || "{}";
        const result = JSON.parse(text);
        if (result.present_student_ids && Array.isArray(result.present_student_ids)) {
          return result.present_student_ids as string[];
        }
      } catch (err) {
        console.error("Batch processing error:", err);
      }
      return [] as string[];
    });

    const results = await Promise.all(batchPromises);
    
    // Flatten array of arrays
    return results.flat();

  } catch (error) {
    console.error("Gemini Identification Error:", error);
    return [];
  }
};

export const generateAttendanceReport = async (
  history: AttendanceRecord[],
  students: Student[]
): Promise<string> => {
  try {
    const summary = history.map(h => {
      const p = h.presentStudentIds.length;
      const t = h.totalStudentsCount;
      return `${h.date}: ${p}/${t} present`;
    }).join('\n');

    const prompt = `
      Analyze this school attendance data for Class 5A:
      ${summary}
      
      Write a professional, concise report (max 150 words) for the school principal.
      Highlight trends, lowest attendance days, and give one improvement tip.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Report generation failed.";
  } catch (error) {
    console.error("Gemini Report Error:", error);
    return "Error generating report.";
  }
};

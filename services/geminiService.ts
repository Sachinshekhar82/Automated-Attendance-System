import { GoogleGenAI } from "@google/genai";
import { AttendanceRecord, Student } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to convert URL/Base64 to raw Base64 string for Gemini
const getImageData = async (source: string): Promise<string> => {
  if (!source) return "";
  if (source.startsWith('data:image')) {
    return source.split(',')[1];
  } else if (source.startsWith('http')) {
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
      console.warn("Failed to fetch image:", source);
      return "";
    }
  }
  return "";
};

export const generateAttendanceReport = async (
  history: AttendanceRecord[],
  students: Student[]
): Promise<string> => {
  try {
    const summary = history.map(h => {
      const presentCount = h.presentStudentIds.length;
      const total = h.totalStudents;
      const percentage = ((presentCount / total) * 100).toFixed(1);
      return `Date: ${h.date}, Present: ${presentCount}/${total} (${percentage}%)`;
    }).join('\n');

    const prompt = `
      You are an AI assistant for a rural school administrator. 
      Analyze the following attendance data for Class 5A.
      
      Data:
      ${summary}
      
      Provide a report (max 200 words):
      1. Overall trend.
      2. Specific low attendance days.
      3. Actionable recommendation.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Could not generate report.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating report.";
  }
};

export const analyzeClassroomImage = async (base64Image: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: "Analyze this classroom image. Estimate the number of students visible and describe their activity briefly." }
        ]
      }
    });
    
    return response.text || "Could not analyze image.";
  } catch (error) {
     console.error("Gemini Vision Error:", error);
     return "Error analyzing image.";
  }
}

// Helper to chunk array
const chunkArray = <T>(array: T[], size: number): T[][] => {
  const chunked: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunked.push(array.slice(i, i + size));
  }
  return chunked;
};

export const identifyStudentsInGroup = async (
  sceneImageBase64: string, 
  candidates: Student[]
): Promise<string[]> => {
  try {
    const sceneClean = sceneImageBase64.replace(/^data:image\/\w+;base64,/, "");
    const allFoundIds: string[] = [];

    // Process students in batches of 20 to ensure context window isn't exceeded
    // and processing is fast.
    const batches = chunkArray(candidates, 20);

    for (const batch of batches) {
      const parts: any[] = [
        { text: "Task: Identify which of the REFERENCE_STUDENTS are present in the CLASSROOM_SCENE." },
        { text: "CLASSROOM_SCENE:" },
        { inlineData: { mimeType: 'image/jpeg', data: sceneClean } },
        { text: "REFERENCE_STUDENTS:" }
      ];

      let hasValidRef = false;
      for (const student of batch) {
        const imgData = await getImageData(student.photoUrl);
        if (imgData) {
          parts.push({ text: `ID: "${student.id}"` });
          parts.push({ inlineData: { mimeType: 'image/jpeg', data: imgData } });
          hasValidRef = true;
        }
      }

      if (!hasValidRef) continue;

      parts.push({ text: "Return a JSON object: { \"present_student_ids\": [\"id1\", \"id2\"] }. Only list IDs where the face matches clearly." });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts },
        config: { 
          responseMimeType: "application/json",
          temperature: 0.1 
        }
      });

      const text = response.text || "{}";
      try {
        const result = JSON.parse(text);
        if (result.present_student_ids && Array.isArray(result.present_student_ids)) {
          allFoundIds.push(...result.present_student_ids);
        }
      } catch (parseError) {
        console.error("JSON Parse Error for batch:", parseError);
      }
    }

    return allFoundIds;

  } catch (error) {
    console.error("Gemini Group ID Error:", error);
    return [];
  }
};
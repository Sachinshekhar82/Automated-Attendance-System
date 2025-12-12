import { GoogleGenAI } from "@google/genai";
import { AttendanceRecord, Student } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to convert URL/Base64 to raw Base64 string for Gemini
const getImageData = async (source: string): Promise<string> => {
  if (source.startsWith('data:image')) {
    return source.split(',')[1];
  } else if (source.startsWith('http')) {
    try {
      const response = await fetch(source);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
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

export const identifyStudentsInGroup = async (
  sceneImageBase64: string, 
  candidates: Student[]
): Promise<string[]> => {
  try {
    const sceneClean = sceneImageBase64.replace(/^data:image\/\w+;base64,/, "");
    
    // Prepare prompt parts
    const parts: any[] = [
      { text: "The first image is the 'SCENE'. The subsequent images are 'REFERENCE_PHOTOS' for specific students, labeled with their IDs. Your task is to look at the SCENE and identify which of the REFERENCE students are present in it. Return a JSON object: { \"present_student_ids\": [\"id1\", \"id2\"] }. Only return IDs for students you are confident are in the scene." },
      { inlineData: { mimeType: 'image/jpeg', data: sceneClean } }
    ];

    // Add reference images
    // Limit to 5 candidates per batch to ensure accuracy and prevent payload limits if needed, 
    // but Gemini Flash can handle many. We'll try up to 8 for this demo.
    const processingCandidates = candidates.slice(0, 10); 

    for (const student of processingCandidates) {
      const imgData = await getImageData(student.photoUrl);
      if (imgData) {
        parts.push({ text: `Reference for Student ID: ${student.id}` });
        parts.push({ inlineData: { mimeType: 'image/jpeg', data: imgData } });
      }
    }

    if (parts.length <= 2) return []; // No valid reference images

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
      config: { responseMimeType: "application/json" }
    });

    const text = response.text || "{}";
    const result = JSON.parse(text);
    return result.present_student_ids || [];

  } catch (error) {
    console.error("Gemini Group ID Error:", error);
    return [];
  }
};
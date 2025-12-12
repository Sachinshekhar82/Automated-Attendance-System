import { GoogleGenAI } from "@google/genai";
import { AttendanceRecord, Student } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateAttendanceReport = async (
  history: AttendanceRecord[],
  students: Student[]
): Promise<string> => {
  try {
    // Prepare a summary of the data for the prompt
    const summary = history.map(h => {
      const presentCount = h.presentStudentIds.length;
      const total = h.totalStudents;
      const percentage = ((presentCount / total) * 100).toFixed(1);
      return `Date: ${h.date}, Present: ${presentCount}/${total} (${percentage}%)`;
    }).join('\n');

    const prompt = `
      You are an AI assistant for a rural school administrator in India. 
      Analyze the following attendance data for Class 5A over the last week.
      
      Data:
      ${summary}
      
      Please provide a concise report (max 200 words) covering:
      1. Overall attendance trend (improving, declining, or stable).
      2. Any specific days with notably low attendance and potential general reasons (e.g., usually festivals or weather, just hypothesize based on common rural context).
      3. One actionable recommendation to improve attendance.
      
      Format the output with clear headings. Use simple, encouraging language suitable for school staff.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Could not generate report.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating report. Please check your internet connection and try again.";
  }
};

export const analyzeClassroomImage = async (base64Image: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Using a vision-capable model
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image
            }
          },
          {
            text: "Analyze this classroom image. 1. Estimate the number of students visible. 2. Describe the general engagement level (e.g., are they looking at the board, writing?). 3. Is the lighting adequate? Keep it brief."
          }
        ]
      }
    });
    
    return response.text || "Could not analyze image.";
  } catch (error) {
     console.error("Gemini Vision Error:", error);
     return "Error analyzing image.";
  }
}
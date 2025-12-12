// This service replaces the Gemini service with local Face-API.js logic
import { Student } from "../types";

declare const faceapi: any;

// Public URL where the models are hosted (using the library author's repo)
const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';

let isModelLoaded = false;

export const loadModels = async () => {
  if (isModelLoaded) return;
  console.log("Loading AI Models...");
  try {
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL), // Face detection
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL), // Features
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)  // Description/Matching
    ]);
    isModelLoaded = true;
    console.log("AI Models Loaded Successfully");
  } catch (error) {
    console.error("Failed to load models", error);
    throw new Error("Failed to load AI models. Check internet connection.");
  }
};

export const isReady = () => isModelLoaded;

// Helper to create an HTMLImageElement from a URL/Base64
const createImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
};

// Convert a single photo into a math vector (descriptor)
export const getFaceDescriptor = async (imageUrl: string): Promise<number[] | null> => {
  if (!isModelLoaded) await loadModels();
  
  const img = await createImage(imageUrl);
  
  // Detect single face with highest confidence
  const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
  
  if (!detection) return null;
  
  // Return the descriptor as a normal array of numbers (for storage)
  return Array.from(detection.descriptor);
};

// Match faces in a classroom scene
export const identifyStudentsLocal = async (
  sceneImageBase64: string, 
  candidates: Student[]
): Promise<string[]> => {
  if (!isModelLoaded) await loadModels();

  // 1. Setup the "Matcher" with student descriptors
  // Only use students who actually have a descriptor saved
  const labeledDescriptors = candidates
    .filter(s => s.descriptor && s.descriptor.length > 0)
    .map(s => {
      // Convert stored number array back to Float32Array
      const float32 = new Float32Array(s.descriptor!);
      return new faceapi.LabeledFaceDescriptors(s.id, [float32]);
    });

  if (labeledDescriptors.length === 0) return [];

  // 0.6 is a good threshold (lower = stricter, higher = looser)
  const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.55);

  // 2. Detect ALL faces in the scene
  const sceneImg = await createImage(sceneImageBase64);
  const detections = await faceapi.detectAllFaces(sceneImg)
    .withFaceLandmarks()
    .withFaceDescriptors();

  // 3. Match found faces to students
  const foundIds = new Set<string>();
  
  detections.forEach((fd: any) => {
    const bestMatch = faceMatcher.findBestMatch(fd.descriptor);
    // If it's not "unknown", we found a student
    if (bestMatch.label !== 'unknown') {
      foundIds.add(bestMatch.label);
    }
  });

  return Array.from(foundIds);
};
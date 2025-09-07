import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// Initialize the native Google GenAI client
const genAI = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
});

// No default prompt - user must provide one

export const POST = async (req: NextRequest) => {
  try {
    // Handle both JSON and FormData requests
    let imageData: string;
    let mimeType: string = "image/png";
    let customPrompt: string = "";
    
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      // Handle FormData (file upload)
      const formData = await req.formData();
      const imageFile = formData.get('image') as File | null;
      const promptFromForm = formData.get('customPrompt') as string | null;
      
      if (!imageFile) {
        return NextResponse.json(
          { error: "No image provided" },
          { status: 400 }
        );
      }

      // Convert file to base64
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      imageData = buffer.toString('base64');
      mimeType = imageFile.type || "image/png";
      
      if (promptFromForm) {
        customPrompt = promptFromForm;
      }
    } else {
      // Handle JSON request
      const body = await req.json();
      const fullImageData = body.image;
      customPrompt = body.customPrompt || body.prompt || "";
      mimeType = body.mimeType || "image/png";
      
      if (!fullImageData) {
        return NextResponse.json(
          { error: "Image is required" },
          { status: 400 }
        );
      }

      // Extract base64 data from data URL if present
      if (fullImageData.startsWith('data:')) {
        const [header, data] = fullImageData.split(',');
        imageData = data;
        // Extract mime type from header
        const mimeMatch = header.match(/data:([^;]+)/);
        if (mimeMatch) {
          mimeType = mimeMatch[1];
        }
      } else {
        imageData = fullImageData;
      }
    }

    // Validate that prompt is provided
    if (!customPrompt.trim()) {
      return NextResponse.json(
        { error: "Prompt es obligatorio" },
        { status: 400 }
      );
    }

    // Enhance the prompt to ensure image generation
    const enhancedPrompt = customPrompt.includes("generate") || customPrompt.includes("create") || customPrompt.includes("produce")
      ? customPrompt
      : `${customPrompt} Please generate and create a new image based on this request.`;

    // Create the prompt array with text and image
    const prompt = [
      { text: enhancedPrompt },
      {
        inlineData: {
          mimeType: mimeType,
          data: imageData,
        },
      },
    ];

    // Use native Google GenAI to generate content
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash-image-preview",
      contents: prompt,
    });

    const result = response.candidates?.[0];
    
    if (!result) {
      return NextResponse.json(
        { error: "No response from Gemini" },
        { status: 500 }
      );
    }

    // Process the response parts
    const textParts: string[] = [];
    const generatedImages: Array<{ data: string, mimeType: string }> = [];

    if (result.content?.parts) {
      for (const part of result.content.parts) {
        if (part.text) {
          textParts.push(part.text);
        } else if (part.inlineData) {
          generatedImages.push({
            data: part.inlineData.data || "",
            mimeType: part.inlineData.mimeType || "image/png",
          });
        }
      }
    }

    // Check if we got images, if not, provide helpful feedback
    const hasImages = generatedImages.length > 0;
    const responseData = {
      success: true,
      model: "gemini-2.5-flash-image-preview",
      prompt: enhancedPrompt,
      originalPrompt: customPrompt,
      textResponse: textParts.join('\n'),
      generatedImages,
      hasGeneratedImages: hasImages,
      metadata: {
        timestamp: new Date().toISOString(),
        inputMimeType: mimeType,
        responsePartsCount: result.content?.parts?.length || 0,
        imageGenerationAttempted: true,
        ...((!hasImages) && { 
          warning: "No images were generated. The model may have interpreted this as a text-only request. Try rephrasing your prompt to explicitly request image generation." 
        })
      },
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('nanoBanana native SDK error:', error);
    
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
};

// GET endpoint to retrieve configuration
export const GET = async () => {
  return NextResponse.json({
    model: "gemini-2.5-flash-image-preview",
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    maxFileSize: '20MB',
    endpoint: '/api/v2/ai/nano-banana',
    sdk: 'native-google-genai',
    capabilities: ['image-analysis', 'image-generation', 'text-generation'],
    promptRequired: true,
  });
};
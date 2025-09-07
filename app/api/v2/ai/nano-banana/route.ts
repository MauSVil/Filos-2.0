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
          { error: "No se proporcionó imagen" },
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
          { error: "La imagen es obligatoria" },
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

    // Mejorar el prompt para asegurar la generación de imágenes
    const enhancedPrompt = customPrompt.includes("generar") || customPrompt.includes("crear") || customPrompt.includes("producir") || customPrompt.includes("generate") || customPrompt.includes("create") || customPrompt.includes("produce")
      ? customPrompt
      : `${customPrompt} Por favor genera y crea una nueva imagen basada en esta solicitud.`;

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
        { error: "No hay respuesta de Gemini" },
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
          warning: "No se generaron imágenes. El modelo pudo haber interpretado esto como una solicitud solo de texto. Intenta reformular tu prompt para solicitar explícitamente la generación de imágenes." 
        })
      },
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('nanoBanana native SDK error:', error);
    
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido",
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
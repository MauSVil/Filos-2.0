"use client";

import { useState, useEffect } from "react";
import { Wand2, Upload, RefreshCw, Check, X, User, Heart, Shirt } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface ImageGeneratorSectionProps {
  onImageGenerated: (image: File) => void;
  onImageUploaded: (image: File) => void;
  currentImage?: File | string;
  disabled?: boolean;
}

type PromptType = "mujer" | "hombre" | "mascota";

interface GeneratedImageData {
  id: string;
  imageUrl: string;
  promptType: PromptType;
  customPrompt: string;
  timestamp: number;
}

const PROMPT_TEMPLATES = {
  mujer: "Haz que una mujer joven use el suéter que esté en la imagen, postura confiada, en un ambiente aleatorio y bien iluminado, foto profesional de producto",
  hombre: "Haz que un hombre joven atlético use el suéter que esté en la imagen, postura confiada, en un ambiente aleatorio y bien iluminado, foto profesional de producto",
  mascota: "Haz que una mascota adorable (perro o gato) use el suéter que esté en la imagen, pose tierna y natural, en un ambiente acogedor y bien iluminado, foto profesional de producto"
};

const PROMPT_LABELS = {
  mujer: { label: "Mujer", icon: User, color: "text-pink-400" },
  hombre: { label: "Hombre", icon: User, color: "text-blue-400" },
  mascota: { label: "Mascota", icon: Heart, color: "text-green-400" }
};

const ImageGeneratorSection = ({ 
  onImageGenerated, 
  onImageUploaded, 
  currentImage, 
  disabled = false 
}: ImageGeneratorSectionProps) => {
  const [mode, setMode] = useState<"upload" | "generate">("upload");
  const [selectedPrompt, setSelectedPrompt] = useState<PromptType>("mujer");
  const [sweaterImage, setSweaterImage] = useState<File | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [customPrompt, setCustomPrompt] = useState<string>(PROMPT_TEMPLATES["mujer"]);
  const [imageHistory, setImageHistory] = useState<GeneratedImageData[]>([]);
  const [selectedHistoryImage, setSelectedHistoryImage] = useState<GeneratedImageData | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Update custom prompt when selected prompt type changes
  useEffect(() => {
    setCustomPrompt(PROMPT_TEMPLATES[selectedPrompt]);
  }, [selectedPrompt]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSweaterImage(file);
    }
  };

  const handleDropzoneClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setSweaterImage(file);
      }
    };
    input.click();
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUploaded(file);
      setMode("upload");
    }
  };

  const generateImage = async () => {
    if (!sweaterImage) return;

    setIsGenerating(true);
    try {
      const formData = new FormData();
      formData.append('image', sweaterImage);
      formData.append('customPrompt', customPrompt);

      const response = await fetch('/api/v2/ai/nano-banana', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success && result.generatedImages.length > 0) {
        const imageData = result.generatedImages[0];
        const base64Image = `data:${imageData.mimeType};base64,${imageData.data}`;
        
        // Create new image data object
        const newImageData: GeneratedImageData = {
          id: `generated-${Date.now()}`,
          imageUrl: base64Image,
          promptType: selectedPrompt,
          customPrompt: customPrompt,
          timestamp: Date.now()
        };

        // Update history (keep only last 3 images)
        setImageHistory(prev => {
          const updated = [newImageData, ...prev];
          return updated.slice(0, 3);
        });

        // Set as current generated image and selected
        setGeneratedImage(base64Image);
        setSelectedHistoryImage(newImageData);
        setShowPreview(true);
      } else {
        console.error('Error generating image:', result.error || 'No images generated');
      }
    } catch (error) {
      console.error('Error calling nano-banana API:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const regenerateImage = () => {
    generateImage();
  };

  const acceptGeneratedImage = () => {
    const imageToAccept = selectedHistoryImage?.imageUrl || generatedImage;
    if (imageToAccept) {
      // Convert base64 to File
      fetch(imageToAccept)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], `generated-product-${Date.now()}.png`, { type: 'image/png' });
          onImageGenerated(file);
          setShowPreview(false);
          setSelectedHistoryImage(null);
        });
    }
  };

  const rejectGeneratedImage = () => {
    setGeneratedImage(null);
    setShowPreview(false);
    setSelectedHistoryImage(null);
  };

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 mb-3">
          <Wand2 className="h-5 w-5 text-gray-400" />
          Imagen del Producto
        </CardTitle>
        <div className="flex gap-2 w-full">
          <Button
            variant={mode === "upload" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("upload")}
            disabled={disabled}
            className="flex-1"
          >
            <Upload className="h-4 w-4 mr-2" />
            Subir
          </Button>
          <Button
            variant={mode === "generate" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("generate")}
            disabled={disabled}
            className="flex-1"
          >
            <Wand2 className="h-4 w-4 mr-2" />
            Generar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {mode === "upload" && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Seleccionar Imagen</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={disabled}
                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-muted file:text-foreground hover:file:bg-muted/80 file:cursor-pointer cursor-pointer"
              />
            </div>
          </>
        )}

        {mode === "generate" && !showPreview && (
          <>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-3">1. Subir imagen del suéter estirado</label>
                
                {!sweaterImage ? (
                  <div
                    onClick={handleDropzoneClick}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`
                      relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200 p-8
                      ${isDragOver 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50 hover:bg-muted/20'
                      }
                      ${disabled || isGenerating ? 'pointer-events-none opacity-50' : ''}
                    `}
                  >
                    <div className="flex flex-col items-center justify-center text-center space-y-3">
                      <div className="relative">
                        <Shirt className="h-12 w-12 text-muted-foreground" strokeWidth={1} />
                        <div className="absolute -bottom-1 -right-1 bg-primary/10 rounded-full p-1">
                          <Upload className="h-3 w-3 text-primary" />
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          {isDragOver ? 'Suelta la imagen aquí' : 'Arrastra tu imagen o haz clic'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Sube una imagen del suéter completamente estirado
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG hasta 10MB
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative rounded-xl overflow-hidden border-2 border-border">
                      <img
                        src={URL.createObjectURL(sweaterImage)}
                        alt="Suéter cargado"
                        className="w-full h-32 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-400" />
                            <span className="text-sm text-white font-medium truncate">
                              {sweaterImage.name}
                            </span>
                          </div>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSweaterImage(null);
                            }}
                            size="sm"
                            variant="secondary"
                            className="h-6 px-2 text-xs"
                            disabled={disabled || isGenerating}
                          >
                            Cambiar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">2. Seleccionar tipo de modelo</label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(PROMPT_TEMPLATES) as PromptType[]).map((type) => {
                    const config = PROMPT_LABELS[type];
                    const Icon = config.icon;
                    return (
                      <Button
                        key={type}
                        variant={selectedPrompt === type ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedPrompt(type)}
                        disabled={disabled || isGenerating}
                        className="h-auto p-3 flex flex-col items-center gap-1"
                      >
                        <Icon className={`h-5 w-5 ${config.color}`} />
                        <span className="text-xs">{config.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">3. Personalizar prompt (opcional)</label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  disabled={disabled || isGenerating}
                  className="w-full h-20 px-3 py-2 text-sm bg-input/30 border border-input rounded-lg resize-none transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Modifica el prompt según tus necesidades..."
                />
                <p className="text-xs text-gray-400 mt-1">
                  Puedes editar el prompt predefinido para obtener mejores resultados
                </p>
              </div>

              <Button
                onClick={generateImage}
                disabled={!sweaterImage || disabled || isGenerating}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generando imagen...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generar Imagen con IA
                  </>
                )}
              </Button>
            </div>
          </>
        )}

        {mode === "generate" && showPreview && generatedImage && (
          <>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  Vista previa generada
                  <Badge variant="secondary" className="text-xs">
                    {PROMPT_LABELS[selectedPrompt].label}
                  </Badge>
                </h4>
                <div className="aspect-square relative bg-muted/30 rounded-lg overflow-hidden border-2 border-dashed border-border">
                  <img
                    alt="Imagen generada con IA"
                    className="w-full h-full object-cover"
                    src={generatedImage}
                  />
                </div>
              </div>

              {/* Image History Selection */}
              {imageHistory.length > 1 && (
                <div>
                  <h5 className="text-sm font-medium mb-2 text-muted-foreground">
                    Últimas imágenes generadas ({imageHistory.length}/3)
                  </h5>
                  <div className="flex gap-2">
                    {imageHistory.map((historyImage, index) => (
                      <div
                        key={historyImage.id}
                        onClick={() => {
                          setSelectedHistoryImage(historyImage);
                          setGeneratedImage(historyImage.imageUrl);
                        }}
                        className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                          selectedHistoryImage?.id === historyImage.id
                            ? 'border-primary ring-2 ring-primary/20'
                            : 'border-border hover:border-primary/50'
                        }`}
                        style={{ width: '60px', height: '60px' }}
                      >
                        <img
                          src={historyImage.imageUrl}
                          alt={`Imagen generada ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
                        {selectedHistoryImage?.id === historyImage.id && (
                          <div className="absolute top-1 right-1">
                            <div className="w-3 h-3 bg-primary rounded-full flex items-center justify-center">
                              <Check className="w-2 h-2 text-primary-foreground" />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Haz clic en una imagen para seleccionarla
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={acceptGeneratedImage}
                  className="flex-1"
                  disabled={disabled}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Usar esta imagen
                </Button>
                <Button
                  onClick={regenerateImage}
                  variant="outline"
                  disabled={disabled || isGenerating}
                >
                  {isGenerating ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  onClick={rejectGeneratedImage}
                  variant="outline"
                  disabled={disabled}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Current Image Preview */}
        {(currentImage && mode === "upload") && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="aspect-square relative bg-muted/30 rounded-lg overflow-hidden border-2 border-dashed border-border">
                <img
                  alt="Vista previa del producto"
                  className="w-full h-full object-cover"
                  src={typeof currentImage === 'string' ? currentImage : URL.createObjectURL(currentImage)}
                />
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-400">Vista previa</p>
                <p className="text-xs text-gray-500">
                  {typeof currentImage === 'string' ? "Imagen actual" : currentImage.name}
                </p>
              </div>
            </div>
          </>
        )}

        {!currentImage && mode === "upload" && (
          <div className="aspect-square border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center text-muted-foreground">
            <Upload className="h-12 w-12 mb-2" />
            <p className="text-sm text-center">
              No hay imagen seleccionada
            </p>
            <p className="text-xs text-center mt-1">
              Selecciona una imagen para ver la vista previa
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImageGeneratorSection;
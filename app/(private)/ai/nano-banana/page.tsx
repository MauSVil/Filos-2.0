'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Loader2, 
  Upload, 
  ImageIcon, 
  Sparkles, 
  Wand2,
  Clock,
  Info,
  AlertTriangle,
  Download,
  RefreshCw
} from 'lucide-react';

interface NanoBananaResponse {
  success: boolean;
  model: string;
  prompt: string;
  originalPrompt?: string;
  textResponse: string;
  generatedImages: Array<{ data: string; mimeType: string }>;
  hasGeneratedImages: boolean;
  metadata: {
    timestamp: string;
    inputMimeType: string;
    responsePartsCount: number;
    imageGenerationAttempted?: boolean;
    warning?: string;
  };
}

export default function NanoBananaPage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<NanoBananaResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setError(null); // Clear any previous errors
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleReset = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setPrompt('');
    setResponse(null);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!selectedImage) {
      setError('Por favor selecciona una imagen primero');
      return;
    }

    if (!prompt.trim()) {
      setError('El prompt es obligatorio');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('customPrompt', prompt);

      const response = await fetch('/api/v2/ai/nano-banana', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al generar la imagen');
      }

      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadImage = (imageData: string, mimeType: string, index: number) => {
    const link = document.createElement('a');
    link.href = `data:${mimeType};base64,${imageData}`;
    link.download = `nano-banana-generated-${index + 1}.${mimeType.split('/')[1]}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 dark:bg-slate-700 rounded-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Nano-Banana IA</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Generador de imágenes con inteligencia artificial
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-mono text-xs">
              Gemini 2.5 Flash Image Preview
            </Badge>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reiniciar
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-1 lg:grid-cols-5 gap-0">
          
          {/* Input Panel */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                <h2 className="font-semibold text-slate-900 dark:text-white">Configuración</h2>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Image Upload */}
              <div className="space-y-3">
                <Label htmlFor="image-upload" className="text-sm font-medium">
                  Imagen Base <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  ref={fileInputRef}
                  className="hidden"
                />
                
                <div
                  onClick={handleUploadClick}
                  className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 ${
                    imagePreview ? 'border-slate-400 bg-slate-50 dark:bg-slate-700/30' : 'border-slate-300 dark:border-slate-600'
                  }`}
                >
                  {imagePreview ? (
                    <div className="space-y-2">
                      <Image
                        src={imagePreview}
                        alt="Imagen seleccionada"
                        width={120}
                        height={120}
                        className="mx-auto rounded-lg object-cover shadow-sm"
                      />
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {selectedImage?.name} • {Math.round((selectedImage?.size || 0) / 1024)}KB
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Clic para cambiar
                      </p>
                    </div>
                  ) : (
                    <div className="py-6">
                      <ImageIcon className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                        Sube tu imagen
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-500">
                        JPG, PNG, WebP, GIF • Máx 20MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Prompt */}
              <div className="space-y-3">
                <Label htmlFor="prompt" className="text-sm font-medium">
                  Instrucciones de Transformación <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="prompt"
                  placeholder="Ejemplo: Convierte esta imagen en un estilo anime, con colores vibrantes y efectos de luz mágica..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  className="resize-none text-sm"
                  required
                />
                <div className="flex items-start gap-2 p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                  <Info className="h-4 w-4 text-slate-600 dark:text-slate-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-slate-700 dark:text-slate-300">
                    Sé específico sobre el estilo, colores, elementos y transformaciones que deseas aplicar
                  </p>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-700 dark:text-red-300">Error</p>
                    <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
                  </div>
                </div>
              )}

              {/* Generate Button */}
              <Button
                onClick={handleSubmit}
                disabled={!selectedImage || !prompt.trim() || isLoading}
                className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white shadow-lg"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generar Imagen IA
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-3 bg-slate-50 dark:bg-slate-900 flex flex-col">
            <div className="p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  <h2 className="font-semibold text-slate-900 dark:text-white">Resultado</h2>
                </div>
                {response && (
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Clock className="h-3 w-3" />
                    {new Date(response.metadata.timestamp).toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-slate-200 dark:border-slate-700 rounded-full animate-pulse"></div>
                      <Sparkles className="h-8 w-8 text-slate-600 dark:text-slate-400 absolute inset-0 m-auto animate-bounce" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Generando tu imagen...</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Esto puede tomar unos segundos</p>
                    </div>
                  </div>
                </div>
              ) : response ? (
                <div className="space-y-4">
                  {/* Warning */}
                  {!response.hasGeneratedImages && response.metadata.warning && (
                    <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-yellow-800 dark:text-yellow-200">No se generó imagen</p>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">{response.metadata.warning}</p>
                      </div>
                    </div>
                  )}

                  {/* Generated Images */}
                  {response.hasGeneratedImages && response.generatedImages.length > 0 ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          Imágenes Generadas ({response.generatedImages.length})
                        </h3>
                      </div>
                      
                      <div className="grid gap-3">
                        {response.generatedImages.map((image, index) => (
                          <Card key={index} className="overflow-hidden">
                            <div className="relative group">
                              <Image
                                src={`data:${image.mimeType};base64,${image.data}`}
                                alt={`Imagen generada ${index + 1}`}
                                width={600}
                                height={400}
                                className="w-full h-auto object-contain bg-white dark:bg-slate-100"
                              />
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => downloadImage(image.data, image.mimeType, index)}
                                  className="shadow-lg"
                                >
                                  <Download className="h-3 w-3 mr-1" />
                                  Descargar
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ) : !response.hasGeneratedImages && (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                      <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No se generaron imágenes en esta respuesta</p>
                    </div>
                  )}

                  {/* AI Description */}
                  {response.textResponse && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Descripción de IA</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                          {response.textResponse}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Metadata - Collapsed by default */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Detalles Técnicos</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-slate-500">Modelo:</span>
                          <p className="font-medium">{response.model}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Tipo entrada:</span>
                          <p className="font-medium">{response.metadata.inputMimeType}</p>
                        </div>
                      </div>
                      
                      {response.originalPrompt && (
                        <div className="space-y-2">
                          <span className="text-xs text-slate-500">Prompt original:</span>
                          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded text-xs">
                            {response.originalPrompt}
                          </div>
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <span className="text-xs text-slate-500">Prompt mejorado:</span>
                        <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded text-xs">
                          {response.prompt}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-center">
                  <div className="space-y-3">
                    <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto">
                      <ImageIcon className="h-8 w-8 text-slate-400" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-600 dark:text-slate-400">
                        Sube una imagen y describe la transformación
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-500">
                        El resultado aparecerá aquí
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
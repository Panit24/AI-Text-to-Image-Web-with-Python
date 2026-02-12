import { useState } from 'react';
import axios from 'axios';
import { Loader2, Download, Sparkles, AlertCircle, Image as ImageIcon } from 'lucide-react';

const API_URL = 'http://localhost:8000';

interface GeneratedImage {
  image: string;
  prompt: string;
}

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('blurry, low quality, distorted');
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  const [error, setError] = useState('');
  const [steps, setSteps] = useState(25);
  const [guidanceScale, setGuidanceScale] = useState(7.5);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${API_URL}/generate`, {
        prompt,
        negative_prompt: negativePrompt,
        num_inference_steps: steps,
        guidance_scale: guidanceScale,
      });

      setGeneratedImage(response.data);
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to generate image';
      setError(errorMsg);
      console.error('Generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.href = generatedImage.image;
    link.download = `ai-generated-${Date.now()}.png`;
    link.click();
  };

  const examplePrompts = [
    'A serene lake surrounded by mountains at sunset, digital art, highly detailed',
    'A futuristic city with flying cars, neon lights, cyberpunk style, 4k',
    'A magical forest with glowing mushrooms and fireflies at night, fantasy art',
    'An astronaut riding a horse on mars, dramatic lighting, photorealistic',
    'A cozy coffee shop in autumn, warm lighting, interior design, detailed',
    'A dragon flying over a medieval castle, epic fantasy, dramatic clouds',
  ];

  return (
    <div className="">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Panel - Controls */}
        <div className="bg-white rounded-2xl shadow-2xl p-2">
          <div className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-4">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <h2 className='pl-4'>
             Create Your Image
            </h2>
          </div>

          <div className="space-y-5">
            {/* Prompt Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ✨ Your Prompt *
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the image you want to create..."
                className="rounded-lg w-full h-[120px] px-4 py-3 border-2 border-gray-300"
                rows={4}
                disabled={loading}
              />
            </div>

            {/* Negative Prompt */}
            <div>
              <br/>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🚫 Negative Prompt
              </label>
              <input
                type="text"
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                placeholder="What to avoid in the image..."
                className="rounded-lg w-full px-4 py-2 border-2 border-gray-300"
                disabled={loading}
              />
            </div>

            <br/>
            {/* Advanced Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Steps: {steps}
                </label>
                <input
                  type="range"
                  min="10"
                  max="50"
                  value={steps}
                  onChange={(e) => setSteps(Number(e.target.value))}
                  className="w-full"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">Higher = better quality, slower</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Guidance: {guidanceScale}
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="0.5"
                  value={guidanceScale}
                  onChange={(e) => setGuidanceScale(Number(e.target.value))}
                  className="w-full"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">Higher = follows prompt more</p>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Image
                </>
              )}
            </button>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Example Prompts */}
          <div className="mt-8">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Example Prompts
            </h3>
            <div className="space-y-6 max-h-64 overflow-y-auto flex flex-col gap-2">
              {examplePrompts.map((example, idx) => (
                <div>
                    <button
                      key={idx}
                      onClick={() => setPrompt(example)}
                      disabled={loading}
                      className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 rounded-lg transition-colors border border-transparent hover:border-purple-200 disabled:opacity-50"
                    >
                      {example}
                    </button>
                    <br/>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Generated Image */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Generated Image
          </h2>

          {!generatedImage && !loading && (
            <div className="flex items-center justify-center h-96 border-2 border-dashed border-gray-300 rounded-lg">
              <div className="text-center">
                <br/>
                <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Your generated image will appear here</p>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center h-96 border-2 border-dashed border-purple-300 rounded-lg bg-purple-50">
              <div className="text-center py-2">
                <br/>
                <Loader2 className="w-16 h-16 py-2 text-purple-600 mx-auto mb-4 animate-spin" />
                <p className="text-purple-700 font-medium">Creating your masterpiece...</p>
                <p className="text-sm text-purple-600 mt-2">This usually takes a few minutes</p>
              </div>
            </div>
          )}

          {generatedImage && !loading && (
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden shadow-xl border-2 border-gray-200">
                <img
                  src={generatedImage.image}
                  alt={generatedImage.prompt}
                  className="w-full h-auto"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 italic mb-3">
                  "{generatedImage.prompt}"
                </p>
                <button
                  onClick={handleDownload}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium shadow-md"
                >
                  <Download className="w-5 h-5" />
                  Download Image
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
        <h3 className="font-semibold text-gray-800 mb-3">💡 Tips for Better Results</h3>
        <ul className="space-y-6 text-sm text-gray-600">
          <li>Be specific and detailed in your prompts</li>
          <li>Include art style keywords: "digital art", "photorealistic", "oil painting", etc.</li>
          <li>Use quality enhancers: "highly detailed", "4k", "professional", "masterpiece"</li>
          <li>Negative prompts help avoid unwanted elements</li>
          <li>Higher steps = better quality but slower generation</li>
          <li>Guidance scale 7-10 usually works best</li>
        </ul>
      </div>
    </div>
  );
}
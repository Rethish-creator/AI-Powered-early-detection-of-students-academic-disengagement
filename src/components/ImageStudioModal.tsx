import React, { useState } from 'react';
import {
  Sparkles,
  Wand2,
  Image as ImageIcon,
  Download,
  Check,
  X,
  Upload,
  RefreshCw,
  Sliders,
  Layers,
  BookOpen,
  CheckCircle2,
  Maximize2
} from 'lucide-react';
import { api } from '../services/api.ts';

interface ImageStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyImage?: (imageUrl: string) => void;
  currentImageUrl?: string;
}

export const ImageStudioModal: React.FC<ImageStudioModalProps> = ({
  isOpen,
  onClose,
  onApplyImage,
  currentImageUrl
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'edit'>('create');
  const [prompt, setPrompt] = useState(
    'Clean modern university library with natural sunlight, minimalist study tables, bookshelves in the background, and architectural symmetry'
  );
  const [editPrompt, setEditPrompt] = useState(
    'Add subtle glowing digital data network lines and ambient cyan neural connections over the academic environment'
  );
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '4:3' | '1:1'>('16:9');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(currentImageUrl || null);
  const [sourceImageBase64, setSourceImageBase64] = useState<string | null>(null);
  const [appliedToast, setAppliedToast] = useState(false);

  if (!isOpen) return null;

  const quickPrompts = [
    {
      title: 'Clean Academic Library',
      text: 'A clean, modern academic university library with natural sunlight streaming through high glass windows, wooden reading tables, and quiet study alcoves'
    },
    {
      title: 'Digital Data Network',
      text: 'Abstract academic digital data network, glowing nodes connecting educational concepts, deep navy blue and teal gradients, cyber learning interface'
    },
    {
      title: 'Collegiate Campus Quad',
      text: 'A prestigious university campus quad at golden hour, stone and glass lecture halls, manicured lawns and autumn trees, inspiring higher education'
    },
    {
      title: 'Student Innovation Hub',
      text: 'High-tech collaborative university learning hub, students engaged in problem-solving around interactive digital displays and modern study pods'
    }
  ];

  const handleCreate = async () => {
    if (!prompt.trim()) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.createImage(prompt, aspectRatio);
      setResultImage(res.imageUrl);
    } catch (err: any) {
      setError(err.message || 'Failed to create image with Gemini');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editPrompt.trim()) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.editImage(editPrompt, sourceImageBase64 || resultImage || undefined);
      setResultImage(res.imageUrl);
    } catch (err: any) {
      setError(err.message || 'Failed to edit image with Gemini');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (resultImage && onApplyImage) {
      onApplyImage(resultImage);
      setAppliedToast(true);
      setTimeout(() => setAppliedToast(false), 2500);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setSourceImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shadow-md">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Academic Image Studio
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-semibold border border-indigo-400/30">
                  gemini-3.1-flash-image-preview
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Use text prompts to generate or edit high-quality academic backgrounds for your dashboard headers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Studio Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column */}
          <div className="lg:col-span-6 space-y-5">
            {/* Tabs */}
            <div className="flex p-1 bg-slate-800/80 rounded-xl border border-slate-700 text-xs">
              <button
                onClick={() => setActiveTab('create')}
                className={`flex-1 py-2 font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'create'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Create Image</span>
              </button>
              <button
                onClick={() => setActiveTab('edit')}
                className={`flex-1 py-2 font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'edit'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Edit Image</span>
              </button>
            </div>

            {activeTab === 'create' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Describe your academic background prompt
                  </label>
                  <textarea
                    rows={3}
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder="e.g. Modern university library with natural sunlight and minimalist study desks..."
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                  />
                </div>

                {/* Aspect Ratio */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Aspect Ratio
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: '16:9', label: '16:9 (Header / Banner)' },
                      { id: '4:3', label: '4:3 (Card)' },
                      { id: '1:1', label: '1:1 (Square)' }
                    ].map(ar => (
                      <button
                        key={ar.id}
                        type="button"
                        onClick={() => setAspectRatio(ar.id as any)}
                        className={`py-2 px-2.5 rounded-lg border text-xs font-semibold text-center transition-all ${
                          aspectRatio === ar.id
                            ? 'bg-indigo-600/30 border-indigo-400 text-indigo-200'
                            : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {ar.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Prompts */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5">
                    Educational Presets
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {quickPrompts.map((qp, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPrompt(qp.text)}
                        className="p-2.5 text-left bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-all group"
                      >
                        <div className="text-[11px] font-bold text-indigo-300 group-hover:text-indigo-200">
                          {qp.title}
                        </div>
                        <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                          {qp.text}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={loading || !prompt.trim()}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Generating with Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      <span>Generate Academic Image</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Reference Image to Edit
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex-1 border-2 border-dashed border-slate-700 hover:border-indigo-400/60 rounded-xl p-3 text-center cursor-pointer bg-slate-800/40 transition-colors">
                      <Upload className="w-4 h-4 mx-auto text-indigo-400 mb-1" />
                      <span className="text-[11px] text-slate-300 block font-semibold">
                        {sourceImageBase64 ? 'Change image file' : 'Upload custom image'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>
                    {resultImage && (
                      <button
                        type="button"
                        onClick={() => setSourceImageBase64(resultImage)}
                        className="px-3 py-3 border border-slate-700 rounded-xl text-[11px] text-slate-300 hover:bg-slate-800 transition-colors font-medium text-center"
                      >
                        Use Current Result
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Edit Instructions (Prompt)
                  </label>
                  <textarea
                    rows={3}
                    value={editPrompt}
                    onChange={e => setEditPrompt(e.target.value)}
                    placeholder="e.g. Add subtle glowing blue neural connections to the background..."
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleEdit}
                  disabled={loading || !editPrompt.trim()}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Editing with Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Layers className="w-4 h-4" />
                      <span>Apply Edit with Gemini</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {error && (
              <div className="p-3 bg-rose-950/50 border border-rose-800 rounded-xl text-xs text-rose-300">
                {error}
              </div>
            )}
          </div>

          {/* Preview Column */}
          <div className="lg:col-span-6 flex flex-col">
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Live Preview with CSS Overlay (bg-slate-900/70)
            </label>
            <div className="relative flex-1 min-h-[260px] rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 flex flex-col justify-end p-5 shadow-inner">
              {resultImage ? (
                <>
                  <img
                    src={resultImage}
                    alt="Generated Academic Background"
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover object-center"
                  />
                  {/* Effective CSS overlay as requested */}
                  <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-[1.5px]" />
                  
                  {/* Simulated Header Text to test readability */}
                  <div className="relative z-10 space-y-1.5">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 text-[10px] font-bold uppercase backdrop-blur-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                      <span>Simulated Header Banner Preview</span>
                    </div>
                    <h4 className="text-xl font-black text-white drop-shadow-md">
                      Faculty Engagement Telemetry
                    </h4>
                    <p className="text-xs text-slate-200 max-w-sm drop-shadow-xs">
                      Text remains crisp, readable, and contrast-compliant against the academic backdrop.
                    </p>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 text-xs">
                  <ImageIcon className="w-10 h-10 mb-2 text-slate-600" />
                  <span>No image generated yet. Enter a prompt to start.</span>
                </div>
              )}
            </div>

            {/* Actions Bar */}
            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleApply}
                disabled={!resultImage}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all hover:scale-105 active:scale-95"
              >
                {appliedToast ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    <span>Applied to Dashboard!</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Apply as Dashboard Header</span>
                  </>
                )}
              </button>

              {resultImage && (
                <a
                  href={resultImage}
                  download="academic-background.png"
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

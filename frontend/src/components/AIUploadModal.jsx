import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Sparkles, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useClasses } from '../context/ClassContext';
import { DAY_NAMES } from '../utils/timeUtils';
import api from '../utils/api';

const STEPS = { UPLOAD: 'upload', PROCESSING: 'processing', REVIEW: 'review', DONE: 'done' };

export default function AIUploadModal({ isOpen, onClose }) {
  const { bulkAdd } = useClasses();
  const [step, setStep] = useState(STEPS.UPLOAD);
  const [preview, setPreview] = useState(null);
  const [extracted, setExtracted] = useState([]);
  const [rawCount, setRawCount] = useState(0);
  const [error, setError] = useState('');
  const [clearExisting, setClearExisting] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  const handleFile = async (file) => {
    if (!file) return;
    setError('');
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target.result;
      setPreview(dataUrl);
      setStep(STEPS.PROCESSING);
      try {
        const base64 = dataUrl.split(',')[1];
        const mimeType = file.type || 'image/jpeg';
        const { data } = await api.post('/ai/extract-timetable', { imageBase64: base64, mimeType });
        setExtracted(data.classes);
        setRawCount(data.rawCount || data.classes.length);
        setStep(STEPS.REVIEW);
      } catch (err) {
        setError(err.response?.data?.message || 'AI extraction failed. Check your API key.');
        setStep(STEPS.UPLOAD);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await bulkAdd(extracted, clearExisting);
      setStep(STEPS.DONE);
      setTimeout(() => { handleClose(); }, 1500);
    } catch { 
      setError('Failed to save classes'); 
    } finally { 
      setSaving(false); 
    }
  };

  const handleClose = () => {
    setStep(STEPS.UPLOAD); 
    setPreview(null); 
    setExtracted([]); 
    setRawCount(0); 
    setError(''); 
    setClearExisting(false);
    onClose();
  };

  const removeClass = (i) => setExtracted(prev => prev.filter((_, idx) => idx !== i));

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md" 
          onClick={e => e.target === e.currentTarget && handleClose()}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="bg-white/95 dark:bg-[#0d1222]/95 backdrop-blur-2xl rounded-3xl border border-gray-200/80 dark:border-gray-800/80 w-full max-w-xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400">
                  <Sparkles size={18} />
                </div>
                <h2 className="font-display font-bold text-lg text-gray-900 dark:text-white">
                  AI Timetable Import
                </h2>
              </div>
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={handleClose} 
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <X size={18} />
              </motion.button>
            </div>

            <div className="p-5">
              {error && (
                <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl px-4 py-3 mb-4 text-xs sm:text-sm font-medium">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              {step === STEPS.UPLOAD && (
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                    Upload a photo or screenshot of your timetable. Claude AI will read it and extract all your subjects, times, and halls automatically.
                  </p>
                  <motion.div 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => fileRef.current.click()} 
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
                    className="border-2 border-dashed border-gray-200 dark:border-gray-700/80 rounded-2xl p-10 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-colors"
                  >
                    <Upload size={34} className="mx-auto mb-3 text-primary-500" />
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Click or drag & drop your timetable file</p>
                    <p className="text-xs text-gray-400 mt-1">Supports JPG, PNG, WEBP, or PDF</p>
                    <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={e => handleFile(e.target.files[0])} />
                  </motion.div>
                </div>
              )}

              {step === STEPS.PROCESSING && (
                <div className="text-center py-10">
                  {preview && (
                    <img src={preview} alt="Uploaded timetable" className="w-32 h-20 object-cover rounded-xl mx-auto mb-5 border border-gray-200 dark:border-gray-700 shadow-sm" />
                  )}
                  <Loader2 size={32} className="mx-auto mb-3 text-primary-500 animate-spin" />
                  <p className="font-bold text-gray-900 dark:text-white text-base">Claude AI is parsing your timetable...</p>
                  <p className="text-xs text-gray-400 mt-1">Extracting subjects, schedules, and halls (5–10s)</p>
                </div>
              )}

              {step === STEPS.REVIEW && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                        <CheckCircle size={16} className="text-emerald-500" />
                        <span>{extracted.length} classes ready to import</span>
                      </p>
                      {rawCount > extracted.length && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          Filtered {rawCount - extracted.length} duplicates from {rawCount} raw detections
                        </p>
                      )}
                    </div>
                    <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={clearExisting} 
                        onChange={e => setClearExisting(e.target.checked)} 
                        className="rounded text-primary-600 focus:ring-primary-500" 
                      />
                      <span>Replace existing</span>
                    </label>
                  </div>
                  <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                    {extracted.map((cls, i) => (
                      <div key={i} className="flex items-start gap-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl px-3.5 py-2.5 border border-gray-100 dark:border-gray-800">
                        <div className="w-2.5 h-2.5 rounded-full mt-2 shrink-0" style={{ backgroundColor: cls.color || '#3B82F6' }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{cls.subject}</p>
                          <p className="text-xs text-gray-400">{DAY_NAMES[cls.day] || cls.day} · {cls.startTime}–{cls.endTime}{cls.room ? ` · ${cls.room}` : ''}</p>
                        </div>
                        <button onClick={() => removeClass(i)} className="text-gray-400 hover:text-red-500 transition-colors mt-0.5 p-1">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-3">Review extracted schedule items. You can remove any erroneous rows before importing.</p>
                </div>
              )}

              {step === STEPS.DONE && (
                <div className="text-center py-8">
                  <CheckCircle size={40} className="mx-auto mb-3 text-emerald-500 animate-bounce" />
                  <p className="font-bold text-lg text-gray-900 dark:text-white">Classes imported successfully!</p>
                  <p className="text-xs text-gray-400 mt-1">Your weekly schedule is ready</p>
                </div>
              )}
            </div>

            {step === STEPS.REVIEW && (
              <div className="flex gap-3 p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                <motion.button 
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setStep(STEPS.UPLOAD)} 
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  Try again
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleSave} 
                  disabled={saving || extracted.length === 0} 
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 disabled:opacity-60 text-white text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <Sparkles size={15} />
                  <span>{saving ? 'Importing...' : `Import ${extracted.length} classes`}</span>
                </motion.button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

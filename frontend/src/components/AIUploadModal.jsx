import { useState, useRef } from 'react';
import { X, Upload, Sparkles, CheckCircle, AlertCircle, Loader } from 'lucide-react';
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

  if (!isOpen) return null;

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
    } catch { setError('Failed to save classes'); }
    finally { setSaving(false); }
  };

  const handleClose = () => {
    setStep(STEPS.UPLOAD); setPreview(null); setExtracted([]); setRawCount(0); setError(''); setClearExisting(false);
    onClose();
  };

  const removeClass = (i) => setExtracted(prev => prev.filter((_, idx) => idx !== i));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && handleClose()}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 w-full max-w-xl shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-primary-500" />
            <h2 className="font-display font-600 text-gray-900 dark:text-white">AI Timetable Import</h2>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"><X size={18} /></button>
        </div>

        <div className="p-5">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl px-4 py-3 mb-4 text-sm">
              <AlertCircle size={15} />{error}
            </div>
          )}

          {step === STEPS.UPLOAD && (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Upload a photo or screenshot of your timetable. Claude AI will read it and extract all classes automatically.</p>
              <div onClick={() => fileRef.current.click()} onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
                className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-10 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors">
                <Upload size={32} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Click or drag & drop your timetable</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG, or PDF</p>
                <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={e => handleFile(e.target.files[0])} />
              </div>
            </div>
          )}

          {step === STEPS.PROCESSING && (
            <div className="text-center py-10">
              {preview && <img src={preview} alt="Uploaded timetable" className="w-32 h-20 object-cover rounded-xl mx-auto mb-5 border border-gray-200 dark:border-gray-700" />}
              <Loader size={28} className="mx-auto mb-3 text-primary-500 animate-spin" />
              <p className="font-medium text-gray-900 dark:text-white text-sm">Claude is reading your timetable...</p>
              <p className="text-xs text-gray-400 mt-1">This usually takes 5–10 seconds</p>
            </div>
          )}

          {step === STEPS.REVIEW && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    <CheckCircle size={15} className="inline text-green-500 mr-1" />{extracted.length} classes ready to import
                  </p>
                  {rawCount > extracted.length && (
                    <p className="text-xs text-gray-400 mt-1">
                      Cleaned up {rawCount - extracted.length} duplicate or split entries from {rawCount} AI detections
                    </p>
                  )}
                </div>
                <label className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 cursor-pointer">
                  <input type="checkbox" checked={clearExisting} onChange={e => setClearExisting(e.target.checked)} className="rounded" />
                  Replace existing classes
                </label>
              </div>
              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {extracted.map((cls, i) => (
                  <div key={i} className="flex items-start gap-3 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2.5">
                    <div className="w-2 h-2 rounded-full mt-2 shrink-0" style={{ backgroundColor: cls.color || '#3B82F6' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{cls.subject}</p>
                      <p className="text-xs text-gray-400">{DAY_NAMES[cls.day] || cls.day} · {cls.startTime}–{cls.endTime}{cls.room ? ` · ${cls.room}` : ''}</p>
                    </div>
                    <button onClick={() => removeClass(i)} className="text-gray-300 hover:text-red-400 transition mt-0.5"><X size={14} /></button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3">Review the extracted classes. Remove any incorrect entries before importing.</p>
            </div>
          )}

          {step === STEPS.DONE && (
            <div className="text-center py-8">
              <CheckCircle size={36} className="mx-auto mb-3 text-green-500" />
              <p className="font-medium text-gray-900 dark:text-white">Classes imported successfully!</p>
            </div>
          )}
        </div>

        {step === STEPS.REVIEW && (
          <div className="flex gap-3 p-5 border-t border-gray-100 dark:border-gray-800">
            <button onClick={() => setStep(STEPS.UPLOAD)} className="flex-1 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition">Try again</button>
            <button onClick={handleSave} disabled={saving || extracted.length === 0} className="flex-1 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white text-sm font-medium transition flex items-center justify-center gap-2">
              <Sparkles size={15} />{saving ? 'Importing...' : `Import ${extracted.length} classes`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

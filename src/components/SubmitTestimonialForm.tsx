import React, { useState, useRef } from 'react';
import { Camera, Image, Check, Loader2, UploadCloud, Trash2, X, Sparkles } from 'lucide-react';
import { Camera as CapCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db, storage, handleFirestoreError, OperationType } from '../lib/firebase';
import { Testimonial } from '../types';
import { useApp } from '../context/AppContext';

interface SubmitTestimonialFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const SubmitTestimonialForm: React.FC<SubmitTestimonialFormProps> = ({
  onSuccess,
  onCancel
}) => {
  const { lang } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [nameEn, setNameEn] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [roleEn, setRoleEn] = useState('');
  const [roleBn, setRoleBn] = useState('');
  const [locationEn, setLocationEn] = useState('');
  const [locationBn, setLocationBn] = useState('');
  const [quoteEn, setQuoteEn] = useState('');
  const [quoteBn, setQuoteBn] = useState('');

  // Image upload states
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg('');
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      
      // Validation: Size cap at 5MB
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg(lang === 'bn' ? 'ফাইলের আকার ৫ মেগাবাইটের কম হতে হবে।' : 'File size must be under 5MB.');
        return;
      }
      // Validation: MIME types
      if (!/^image\/(jpeg|png|webp|jpg)$/i.test(file.type)) {
        setErrorMsg(lang === 'bn' ? 'শুধুমাত্র JPG, PNG বা WEBP ফরম্যাট সমর্থিত।' : 'Only JPG, PNG or WEBP images are supported.');
        return;
      }

      setImageBlob(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const capturePhotoNative = async () => {
    setErrorMsg('');
    try {
      const image = await CapCamera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera
      });

      if (image.webPath) {
        setImagePreview(image.webPath);
        const response = await fetch(image.webPath);
        const blob = await response.blob();
        
        if (blob.size > 5 * 1024 * 1024) {
          setErrorMsg(lang === 'bn' ? 'ফাইলের আকার ৫ মেগাবাইটের কম হতে হবে।' : 'File size must be under 5MB.');
          return;
        }

        setImageBlob(blob);
      }
    } catch (err: any) {
      console.warn("Capacitor Native Camera unnavailable or rejected. Falling back to input file click.", err);
      // Fallback
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }
  };

  const pickGalleryNative = async () => {
    setErrorMsg('');
    try {
      const image = await CapCamera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos
      });

      if (image.webPath) {
        setImagePreview(image.webPath);
        const response = await fetch(image.webPath);
        const blob = await response.blob();
        
        if (blob.size > 5 * 1024 * 1024) {
          setErrorMsg(lang === 'bn' ? 'ফাইলের আকার ৫ মেগাবাইটের কম হতে হবে।' : 'File size must be under 5MB.');
          return;
        }

        setImageBlob(blob);
      }
    } catch (err: any) {
      console.warn("Capacitor Photo Library unnavailable or rejected. Falling back to input file click.", err);
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }
  };

  const removeSelectedImage = () => {
    setImageBlob(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Field check (at least one language pair should be fully populated)
    const effectiveNameEn = nameEn.trim() || nameBn.trim();
    const effectiveNameBn = nameBn.trim() || nameEn.trim();
    const effectiveRoleEn = roleEn.trim() || roleBn.trim();
    const effectiveRoleBn = roleBn.trim() || roleEn.trim();
    const effectiveLocationEn = locationEn.trim() || locationBn.trim();
    const effectiveLocationBn = locationBn.trim() || locationEn.trim();
    const effectiveQuoteEn = quoteEn.trim() || quoteBn.trim();
    const effectiveQuoteBn = quoteBn.trim() || quoteEn.trim();

    if (!effectiveNameEn || !effectiveQuoteEn) {
      setErrorMsg(lang === 'bn' ? 'দয়া করে আপনার নাম এবং বক্তব্য বা অনুভূতি লিখুন।' : 'Please enter your name and testimonial quote.');
      return;
    }

    if (!imageBlob) {
      setErrorMsg(lang === 'bn' ? 'অনুগ্রহ করে নিজের একটি ছবি যুক্ত করুন।' : 'Please upload your profile photo.');
      return;
    }

    setUploadProgress(true);

    try {
      const testimonialId = `testi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // 1. Upload photo to Firebase Storage
      const fileRef = ref(storage, `testimonials/${testimonialId}.jpg`);
      await uploadBytes(fileRef, imageBlob);
      const downloadUrl = await getDownloadURL(fileRef);

      // 2. Build Testimonial Document
      const testimonialDoc: Testimonial = {
        id: testimonialId,
        nameEn: effectiveNameEn,
        nameBn: effectiveNameBn,
        roleEn: effectiveRoleEn || 'Beneficiary',
        roleBn: effectiveRoleBn || 'সুবিধাভোগী',
        locationEn: effectiveLocationEn || 'Bangladesh',
        locationBn: effectiveLocationBn || 'বাংলাদেশ',
        quoteEn: effectiveQuoteEn,
        quoteBn: effectiveQuoteBn,
        image: downloadUrl,
        createdAt: new Date().toISOString(),
        status: 'PENDING' // Newly submitted is pending review/approval
      };

      // 3. Store to Firestore
      const docRef = doc(collection(db, 'testimonials'), testimonialId);
      await setDoc(docRef, testimonialDoc);

      setSuccessMsg(
        lang === 'bn' 
          ? 'ধন্যবাদ! আপনার গল্পটি সফলভাবে জমা হয়েছে এবং এটি অনুমোদনের অপেক্ষায় রয়েছে।' 
          : 'Thank you! Your story has been submitted successfully and is awaiting review.'
      );

      // Clear form
      setNameEn('');
      setNameBn('');
      setRoleEn('');
      setRoleBn('');
      setLocationEn('');
      setLocationBn('');
      setQuoteEn('');
      setQuoteBn('');
      removeSelectedImage();

      if (onSuccess) {
        setTimeout(onSuccess, 3000);
      }
    } catch (err: any) {
      console.error("Testimonial submission failed:", err);
      setErrorMsg(
        lang === 'bn' 
          ? 'দুঃখিত, তথ্য জমা দেওয়া সম্ভব হয়নি। আবার চেষ্টা করুন।' 
          : 'Failed to submit testimonial. Please try again.'
      );
    } finally {
      setUploadProgress(false);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 sm:p-10 rounded-4xl w-full max-w-3xl mx-auto space-y-8"
    >
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100/60 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-full text-[9px] font-black uppercase tracking-wider">
            <Sparkles size={11} className="animate-pulse" />
            {lang === 'bn' ? 'মতামত বা অনুভূতি জমা দিন' : 'Share Your Story'}
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-slate-100 tracking-tight">
            {lang === 'bn' ? 'আজাদীর সাথে আপনার সার্থকতা বলুন' : 'Submit Testimonial'}
          </h3>
          <p className="text-[12px] text-slate-500 dark:text-slate-400">
            {lang === 'bn' 
              ? 'আপনার ছবি যুক্ত করুন এবং আমাদের সাথে আপনার জীবন বদলানোর গল্প শেয়ার করুন।' 
              : 'Tell your story and encourage others in the community by uploading your photo and quote.'}
          </p>
        </div>
        {onCancel && (
          <button 
            type="button" 
            onClick={onCancel}
            className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 rounded-full transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 text-rose-600 dark:text-rose-450 rounded-2xl text-[13px] font-semibold">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl text-[13px] font-bold">
          {successMsg}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Photo Selection Pillar */}
        <div className="space-y-4 flex flex-col items-center">
          <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 self-start">
            {lang === 'bn' ? 'প্রোফাইল ছবি' : 'Profile Photo'}
          </span>
          
          <div className="relative w-40 h-40 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-full aspect-square flex items-center justify-center overflow-hidden p-0.5 shadow-inner group">
            {imagePreview ? (
              <>
                <img 
                  src={imagePreview} 
                  alt="Testimonial contributor" 
                  className="w-full h-full object-cover rounded-full" 
                />
                <button
                  type="button"
                  onClick={removeSelectedImage}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity rounded-full gap-1.5 font-bold text-xs"
                >
                  <Trash2 size={16} />
                  <span>{lang === 'bn' ? 'মুছে ফেলুন' : 'Remove'}</span>
                </button>
              </>
            ) : (
              <div className="text-center flex flex-col items-center gap-2 p-4 text-slate-400 dark:text-slate-600">
                <UploadCloud size={32} className="animate-bounce text-slate-300 dark:text-slate-700" />
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">No Image</span>
              </div>
            )}
          </div>

          <div className="flex gap-2 w-full justify-center">
            {/* Native Camera Trigger */}
            <button
              type="button"
              onClick={capturePhotoNative}
              className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 text-emerald-600 dark:text-emerald-450 font-bold text-xs rounded-2xl flex items-center gap-1.5 transition-all w-1/2 justify-center shadow-soft active:scale-95"
            >
              <Camera size={14} />
              <span>{lang === 'bn' ? 'ক্যামেরা' : 'Camera'}</span>
            </button>

            {/* Native Gallery Trigger */}
            <button
              type="button"
              onClick={pickGalleryNative}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-350 font-bold text-xs rounded-2xl flex items-center gap-1.5 transition-all w-1/2 justify-center shadow-soft active:scale-95"
            >
              <Image size={14} />
              <span>{lang === 'bn' ? 'গ্যালারি' : 'Gallery'}</span>
            </button>
          </div>

          <span className="text-[10px] text-slate-400 text-center leading-normal max-w-[180px]">
            {lang === 'bn' ? 'ক্যামেরা বা গ্যালারি থেকে ৫ মেগাবাইটের নীচে স্কয়ার ছবি নির্বাচন করুন।' : 'Capture via Camera or pick from Gallery (PNG/JPG under 5MB).'}
          </span>

          {/* Hidden File Input Fallback for HTML standard trigger */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
        </div>

        {/* Inputs Fields - Bi-Lingual columns */}
        <div className="md:col-span-2 space-y-6">
          {/* Dual columns for translation accuracy */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name English */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Name (English)</label>
              <input 
                type="text" 
                value={nameEn}
                onChange={e => setNameEn(e.target.value)}
                placeholder="e.g. Fatema Begum"
                className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-slate-50 transition-all placeholder:text-slate-350 focus:border-emerald-500"
              />
            </div>

            {/* Name Bengali */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">নাম (বাংলা)</label>
              <input 
                type="text" 
                value={nameBn}
                onChange={e => setNameBn(e.target.value)}
                placeholder="উদা: ফাতেমা বেগম"
                className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-slate-50 transition-all placeholder:text-slate-350 focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Role English */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Role / Status (English)</label>
              <input 
                type="text" 
                value={roleEn}
                onChange={e => setRoleEn(e.target.value)}
                placeholder="e.g. Microgrant Beneficiary"
                className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-slate-50 transition-all placeholder:text-slate-350 focus:border-emerald-500"
              />
            </div>

            {/* Role Bengali */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">পদবী বা শ্রেনী (বাংলা)</label>
              <input 
                type="text" 
                value={roleBn}
                onChange={e => setRoleBn(e.target.value)}
                placeholder="উদা: অনুদান সুবিধাভোগী"
                className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-slate-50 transition-all placeholder:text-slate-350 focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Location English */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Location (English)</label>
              <input 
                type="text" 
                value={locationEn}
                onChange={e => setLocationEn(e.target.value)}
                placeholder="e.g. Feni, Bangladesh"
                className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-slate-50 transition-all placeholder:text-slate-350 focus:border-emerald-500"
              />
            </div>

            {/* Location Bengali */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">ঠিকানা বা স্থান (বাংলা)</label>
              <input 
                type="text" 
                value={locationBn}
                onChange={e => setLocationBn(e.target.value)}
                placeholder="উদা: ফেনী, বাংলাদেশ"
                className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-slate-50 transition-all placeholder:text-slate-350 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Quote/Story Text English */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Your Experience / Testimonial Quote (English)</label>
            <textarea 
              value={quoteEn}
              onChange={e => setQuoteEn(e.target.value)}
              placeholder="Tell your story. How has Azadi influenced or supported your life?"
              rows={3}
              maxLength={2000}
              className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-slate-50 transition-all placeholder:text-slate-350 focus:border-emerald-500 resize-none"
            />
          </div>

          {/* Quote/Story Text Bengali */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">আপনার অনুভূতি বা গল্প (বাংলা)</label>
            <textarea 
              value={quoteBn}
              onChange={e => setQuoteBn(e.target.value)}
              placeholder="মন খুলে আপনার গল্প শেয়ার করুন। আজাদী কীভাবে আপনাকে সাহায্য করেছে?"
              rows={3}
              maxLength={2000}
              className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-slate-50 transition-all placeholder:text-slate-350 focus:border-emerald-500 resize-none"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-4 border-t border-slate-150 dark:border-slate-850/60 justify-end items-center">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={uploadProgress}
            className="px-6 py-3 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-450 font-black text-xs uppercase tracking-wider rounded-2xl transition-colors disabled:opacity-50"
          >
            {lang === 'bn' ? 'বাতিল' : 'Cancel'}
          </button>
        )}

        <button
          type="submit"
          disabled={uploadProgress}
          className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-emerald-600/10 hover:shadow-emerald-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
        >
          {uploadProgress ? (
            <>
              <Loader2 className="animate-spin" size={14} />
              <span>{lang === 'bn' ? 'আপলোড হচ্ছে...' : 'Uploading...'}</span>
            </>
          ) : (
            <>
              <Check size={14} />
              <span>{lang === 'bn' ? 'রিভিউয়ের জন্য পাঠান' : 'Submit for Review'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

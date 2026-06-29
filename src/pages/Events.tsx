import React, { useState, useMemo, useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { TRANSLATIONS } from "../utils/constants";
import {
  Calendar,
  MapPin,
  ArrowRight,
  X,
  Clock,
  Info,
  Image as ImageIcon,
  Share2,
  MessageCircle,
  Copy,
  CheckCircle,
  Smartphone,
  Video,
} from "lucide-react";
import { Event } from "../types";
import { SkeletonLoader } from "../components/SkeletonLoader";

export const Events: React.FC = () => {
  const { lang, events, settings, loadingEvents } = useApp();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const t = TRANSLATIONS[lang];
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  // Handle direct links to events
  useEffect(() => {
    const eventId = searchParams.get("id");
    if (eventId && events.length > 0) {
      const event = events.find((e) => e.id === eventId);
      if (event) {
        setSelectedEvent(event);
        setTimeout(() => {
          document
            .getElementById("event-details-section")
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 500);
      }
    }
  }, [searchParams, events]);

  // Sorting with fallback to prevent crashes if date is missing or invalid
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });
  }, [events]);

  const formatDate = (dateStr: string) => {
    if (!dateStr)
      return lang === "bn" ? "তারিখ পাওয়া যায়নি" : "Date not available";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch (e) {
      return dateStr;
    }
  };

  const handleShare = async (event: Event) => {
    const shareTitle = lang === "bn" ? event.titleBn : event.titleEn;
    const shareText = `${shareTitle}\n📅 ${formatDate(event.date)}\n📍 ${lang === "bn" ? event.locationBn : event.locationEn}`;
    const shareUrl = `${window.location.origin}/#/events?id=${event.id}`;
    const fullMessage = `${shareText}\n\n${lang === "bn" ? event.descriptionBn?.slice(0, 100) : event.descriptionEn?.slice(0, 100)}...\n\nRead more: ${shareUrl}\n— ${lang === "bn" ? settings.nameBn : settings.nameEn}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: fullMessage,
          url: shareUrl,
        });
        return;
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Share failed:", err);
        } else {
          return; // User cancelled
        }
      }
    }

    // Fallback: Copy to clipboard and offer social links
    try {
      await navigator.clipboard.writeText(fullMessage);
      setCopyStatus(event.id);
      setTimeout(() => setCopyStatus(null), 3000);

      // Also open a quick choice menu or just default to WhatsApp if mobile
      if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        const waUrl = `https://wa.me/?text=${encodeURIComponent(fullMessage)}`;
        window.open(waUrl, "_blank");
      } else {
        // For desktop fallback, we could show a toast or just rely on the clipboard copy
        // which we already did above with setCopyStatus
      }
    } catch (err) {
      const waUrl = `https://wa.me/?text=${encodeURIComponent(fullMessage)}`;
      window.open(waUrl, "_blank");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-20 sm:space-y-32 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-28 md:pb-24 bengali">
      {/* Page Header */}
      <div className="text-center space-y-8 max-w-4xl mx-auto px-4">
        <div className="inline-flex items-center gap-3 text-emerald-700 dark:text-emerald-300 font-black uppercase tracking-[0.2em] text-[10px] px-8 py-3 bg-white dark:bg-slate-900 rounded-full border border-emerald-100 dark:border-emerald-800 shadow-soft">
          <Calendar size={16} className="text-emerald-500" />
          {lang === "bn" ? "কার্যক্রম" : "Archive of Impact"}
        </div>
        <h1 className="text-4xl sm:text-7xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight drop-shadow-sm">
          {t.events}
        </h1>
        <p className="text-lg sm:text-2xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed opacity-80">
          {lang === "bn"
            ? "আজাদী সমাজ কল্যাণ সংঘের আর্তমানবতার সেবা ও উন্নয়নমূলক কর্মকাণ্ডের চিত্রশালা।"
            : "A living gallery showcasing our relentless commitment to humanitarian aid and community development since 1988."}
        </p>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 px-4">
        {loadingEvents ? (
          <div className="col-span-full">
            <SkeletonLoader variant="card" count={4} />
          </div>
        ) : sortedEvents.length > 0 ? (
          sortedEvents.map((event) => (
            <div
              key={event.id}
              className="group bg-white dark:bg-slate-900 rounded-4xl border border-emerald-50 dark:border-slate-800 overflow-hidden shadow-soft hover:shadow-heavy transition-all duration-700 flex flex-col hover:-translate-y-3"
            >
              <div className="relative h-64 sm:h-80 overflow-hidden bg-emerald-50 dark:bg-slate-950">
                {event.image ? (
                  <img
                    src={event.image}
                    alt={lang === "bn" ? event.titleBn : event.titleEn}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-emerald-100 dark:text-slate-800 gap-4 bg-emerald-50/50 dark:bg-slate-900">
                    <ImageIcon size={64} className="opacity-50" />
                    <span className="text-[12px] font-black uppercase tracking-widest opacity-50">
                      Visual Archive
                    </span>
                  </div>
                )}

                <div className="absolute top-6 right-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl px-5 py-2.5 rounded-2xl shadow-heavy border border-emerald-50 dark:border-slate-800 group-hover:translate-x-2 transition-transform">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-black text-xs">
                    <Clock size={16} />
                    {formatDate(event.date)}
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShare(event);
                  }}
                  className="absolute top-6 left-6 p-4 bg-emerald-600 dark:bg-emerald-500 text-white rounded-2xl shadow-heavy hover:scale-110 active:scale-95 transition-all border border-emerald-400/30 z-10 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0"
                >
                  {copyStatus === event.id ? (
                    <CheckCircle size={22} />
                  ) : (
                    <Share2 size={22} />
                  )}
                </button>
              </div>

              <div className="p-10 md:p-14 space-y-6 md:space-y-8 flex-1 flex flex-col">
                <div className="space-y-4">
                  <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors leading-[1.2] line-clamp-2 bengali tracking-tighter">
                    {lang === "bn" ? event.titleBn : event.titleEn}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-emerald-500" />
                      {lang === "bn" ? event.locationBn : event.locationEn}
                    </div>
                    {event.meetUrl && (
                      <div className="flex items-center gap-1.5 bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-[10px]">
                        <Video
                          size={12}
                          className="shrink-0 animate-pulse text-blue-500"
                        />
                        {lang === "bn"
                          ? "গুগল মিট উপলব্ধ"
                          : "Google Meet Included"}
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-4 text-base md:text-lg flex-1 bengali opacity-80 group-hover:opacity-100 transition-opacity">
                  {lang === "bn" ? event.descriptionBn : event.descriptionEn}
                </p>

                <div className="flex items-center justify-between pt-8 md:pt-10 border-t border-slate-50 dark:border-slate-800/50">
                  <button
                    onClick={() => {
                      setSelectedEvent(event);
                      window.history.replaceState(
                        null,
                        "",
                        `/#/events?id=${event.id}`,
                      );
                      setTimeout(() => {
                        document
                          .getElementById("event-details-section")
                          ?.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                          });
                      }, 100);
                    }}
                    className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 font-black text-sm md:text-base hover:gap-6 transition-all uppercase tracking-[0.1em] group/btn bengali"
                  >
                    {lang === "bn" ? " বিস্তারিত দেখি" : "Explore Details"}
                    <ArrowRight
                      size={20}
                      className="group-hover/btn:translate-x-1 transition-transform"
                    />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare(event);
                    }}
                    className="flex items-center gap-2 text-slate-400 dark:text-slate-500 hover:text-emerald-600 transition-colors font-black text-[12px] uppercase tracking-widest bengali group/share"
                  >
                    {copyStatus === event.id ? (
                      <CheckCircle size={16} className="text-emerald-500" />
                    ) : (
                      <Share2
                        size={16}
                        className="group-hover/share:scale-125 transition-transform"
                      />
                    )}
                    {copyStatus === event.id
                      ? lang === "bn"
                        ? "কপি হয়েছে"
                        : "Copied"
                      : lang === "bn"
                        ? "শেয়ার"
                        : "Share"}
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 md:py-32 text-center space-y-6 bg-emerald-50/30 dark:bg-slate-900/50 rounded-[3rem] border-4 border-dashed border-emerald-100 dark:border-slate-800">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-white dark:bg-slate-800 rounded-[2.2rem] md:rounded-[2.5rem] flex items-center justify-center mx-auto shadow-sm border border-emerald-100">
              <Calendar
                size={40}
                className="text-emerald-200 dark:text-slate-700 md:w-12 md:h-12"
              />
            </div>
            <div className="space-y-2 px-6">
              <h3 className="text-base md:text-xl font-black text-slate-400 uppercase tracking-[0.2em]">
                {lang === "bn" ? "কোন ইভেন্ট পাওয়া যায়নি" : "No Events Found"}
              </h3>
              <p className="text-slate-400/60 font-bold text-xs md:text-sm">
                {lang === "bn"
                  ? "খুব শীঘ্রই নতুন ইভেন্ট যুক্ত করা হবে।"
                  : "New events will be added soon."}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Selected Event Detail Section - In-Page Content */}
      {selectedEvent && (
        <div
          id="event-details-section"
          className="scroll-mt-32 max-w-6xl mx-auto px-4 py-20 md:py-32 space-y-12 md:space-y-16 animate-in fade-in slide-in-from-bottom-12 duration-1000 border-t border-slate-100 dark:border-slate-800"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b-2 border-emerald-500/20 pb-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-[0.2em] text-[10px]">
                <ArrowRight size={14} />{" "}
                {lang === "bn" ? "বিস্তারিত তথ্য গ্যালারি" : "Impact Deep Dive"}
              </div>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white bengali leading-tight tracking-tight">
                {lang === "bn" ? selectedEvent.titleBn : selectedEvent.titleEn}
              </h2>
            </div>
            <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
              <div className="flex items-center gap-3 text-slate-500 font-black text-xs md:text-sm uppercase tracking-widest">
                <Calendar size={18} className="text-emerald-500" />
                {formatDate(selectedEvent.date)}
              </div>
              <div className="flex items-center gap-3 text-slate-500 font-black text-xs md:text-sm uppercase tracking-widest">
                <MapPin size={18} className="text-emerald-500" />
                {lang === "bn"
                  ? selectedEvent.locationBn
                  : selectedEvent.locationEn}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-5 gap-12 lg:gap-24">
            <div className="lg:col-span-3 space-y-10 md:space-y-12">
              <div className="space-y-6">
                <h4 className="text-emerald-700 dark:text-emerald-400 font-black uppercase text-[11px] tracking-[0.2em] flex items-center gap-2">
                  <Info size={16} />{" "}
                  {lang === "bn"
                    ? "ইভেন্টের পটভূমি ও বিবরণ"
                    : "Mission Context & Execution"}
                </h4>
                <p className="text-lg md:text-2xl text-slate-600 dark:text-slate-300 font-medium leading-[1.6] md:leading-[1.7] bengali whitespace-pre-line opacity-90 first-letter:text-4xl first-letter:font-black first-letter:text-emerald-600 first-letter:mr-1">
                  {lang === "bn"
                    ? selectedEvent.descriptionBn
                    : selectedEvent.descriptionEn}
                </p>
              </div>

              <div className="flex flex-wrap gap-4 md:gap-6 pt-6">
                <button
                  onClick={() => handleShare(selectedEvent)}
                  className={`${copyStatus === selectedEvent.id ? "bg-emerald-500" : "bg-emerald-600 hover:bg-emerald-700"} text-white px-8 md:px-12 py-4 md:py-5 rounded-[2rem] font-black text-xs md:text-sm uppercase tracking-widest transition-all flex items-center gap-3 shadow-xl active:scale-95 shadow-emerald-500/10`}
                >
                  {copyStatus === selectedEvent.id ? (
                    <CheckCircle size={20} />
                  ) : (
                    <Share2 size={20} />
                  )}
                  {copyStatus === selectedEvent.id
                    ? lang === "bn"
                      ? "লিঙ্ক কপি করা হয়েছে"
                      : "Link Copied"
                    : lang === "bn"
                      ? "শেয়ার স্টোরি"
                      : "Spread the Mission"}
                </button>
                <button
                  onClick={() => {
                    setSelectedEvent(null);
                    window.history.replaceState(null, "", `/#/events`);
                  }}
                  className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-8 py-4 rounded-[2rem] font-black text-xs md:text-sm uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center gap-2 active:scale-95"
                >
                  <X size={20} /> {lang === "bn" ? "বন্ধ করুন" : "Clear View"}
                </button>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-10">
              {selectedEvent.image && (
                <div className="group relative rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden shadow-heavy border-4 border-white dark:border-slate-800 aspect-square sm:aspect-video lg:aspect-square">
                  <img
                    src={selectedEvent.image}
                    alt="Event highlight"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                    <p className="text-white font-bold text-sm bengali">
                      {lang === "bn"
                        ? "মানবতার সেবায় একটি অনন্য মুহূর্ত"
                        : "A signature moment in humanitarian service"}
                    </p>
                  </div>
                </div>
              )}

              <div className="p-8 md:p-10 bg-emerald-50/50 dark:bg-slate-950/50 rounded-[2.5rem] border border-emerald-100 dark:border-slate-800 space-y-6 md:space-y-8">
                <h4 className="text-emerald-700 dark:text-emerald-400 font-black uppercase text-[10px] tracking-widest flex items-center gap-2 border-b border-emerald-100 dark:border-slate-800 pb-4">
                  <MessageCircle size={14} />{" "}
                  {lang === "bn" ? "দ্রুত তথ্য" : "Archive Metadata"}
                </h4>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-50 flex items-center justify-center shrink-0">
                      <Calendar size={18} className="text-emerald-500" />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-black text-slate-400 tracking-widest">
                        {lang === "bn" ? "তারিখ" : "Date Record"}
                      </div>
                      <div className="text-sm font-bold text-slate-700 dark:text-slate-300 bengali">
                        {formatDate(selectedEvent.date)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-50 flex items-center justify-center shrink-0">
                      <MapPin size={18} className="text-emerald-500" />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-black text-slate-400 tracking-widest">
                        {lang === "bn" ? "অবস্থান" : "Location Data"}
                      </div>
                      <div className="text-sm font-bold text-slate-700 dark:text-slate-300 bengali">
                        {lang === "bn"
                          ? selectedEvent.locationBn
                          : selectedEvent.locationEn}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-50 flex items-center justify-center shrink-0">
                      <Clock size={18} className="text-emerald-500" />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-black text-slate-400 tracking-widest">
                        {lang === "bn" ? "আর্কিভ আইডি" : "Reference Code"}
                      </div>
                      <div className="text-sm font-mono font-bold text-slate-700 dark:text-slate-300">
                        #{selectedEvent.id.slice(-8).toUpperCase()}
                      </div>
                    </div>
                  </div>

                  {selectedEvent.meetUrl && (
                    <div className="flex items-start gap-4 mt-2 pt-4 border-t border-emerald-100 dark:border-slate-800">
                      <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 animate-pulse animate-duration-1000">
                        <Video size={18} className="text-blue-500 animate-pulse" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] uppercase font-black text-blue-600 dark:text-blue-400 tracking-widest">
                          {lang === "bn" ? "গুগল মিট তথ্য" : "Google Meet Bridge"}
                        </div>
                        <a
                          href={selectedEvent.meetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs px-5 py-3 rounded-2xl shadow-lg active:scale-95 transition-all w-full justify-center"
                        >
                          <Video size={14} className="shrink-0" />
                          {lang === "bn" ? "মিটিংয়ে যোগ দিন" : "Join Google Meet"}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

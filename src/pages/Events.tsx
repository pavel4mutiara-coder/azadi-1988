import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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
  CheckCircle,
  Video,
  Filter,
  Check
} from "lucide-react";
import { Event } from "../types";
import { SkeletonLoader } from "../components/SkeletonLoader";
import { parseLocalDate } from "../utils/parseLocalDate";
import { getOptimizedImageUrl } from "../utils/imageOptimizer";
import { logImageLoadFailure } from "../utils/imageMonitor";
import { PageHero } from "../components/PageHero";
import { PageCTA } from "../components/PageCTA";

export const Events: React.FC = () => {
  const { lang, events, settings, loadingEvents } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const t = TRANSLATIONS[lang];

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "upcoming" | "ongoing" | "past">("all");

  // Handle direct links to events via URL ?id=...
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
        }, 300);
      }
    }
  }, [searchParams, events]);

  // Categorize events based on date / status
  const now = useMemo(() => new Date(), []);

  const categorizedEvents = useMemo(() => {
    const sorted = [...events].sort((a, b) => {
      const dateA = a.date ? parseLocalDate(a.date).getTime() : 0;
      const dateB = b.date ? parseLocalDate(b.date).getTime() : 0;
      return dateB - dateA;
    });

    const upcoming: Event[] = [];
    const ongoing: Event[] = [];
    const past: Event[] = [];

    sorted.forEach((e) => {
      const eventDate = e.date ? parseLocalDate(e.date) : null;
      const explicitStatus = (e.status || "").toLowerCase();

      if (explicitStatus === "ongoing") {
        ongoing.push(e);
      } else if (eventDate) {
        const isSameDay =
          eventDate.getFullYear() === now.getFullYear() &&
          eventDate.getMonth() === now.getMonth() &&
          eventDate.getDate() === now.getDate();

        if (isSameDay) {
          ongoing.push(e);
        } else if (eventDate > now) {
          upcoming.push(e);
        } else {
          past.push(e);
        }
      } else {
        past.push(e);
      }
    });

    return { all: sorted, upcoming, ongoing, past };
  }, [events, now]);

  const displayedEvents = categorizedEvents[activeTab];

  const formatDate = (dateStr: string) => {
    if (!dateStr) return lang === "bn" ? "তারিখ নির্ধারিত নয়" : "Date TBD";
    try {
      const d = parseLocalDate(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const getEventStatusBadge = (e: Event) => {
    const eventDate = e.date ? parseLocalDate(e.date) : null;
    const isOngoing =
      (e.status || "").toLowerCase() === "ongoing" ||
      (eventDate &&
        eventDate.getFullYear() === now.getFullYear() &&
        eventDate.getMonth() === now.getMonth() &&
        eventDate.getDate() === now.getDate());

    if (isOngoing) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500 text-white shadow-md shadow-emerald-500/20 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-white"></span>
          {lang === "bn" ? "চলমান" : "Ongoing"}
        </span>
      );
    }

    if (eventDate && eventDate > now) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-blue-600 text-white shadow-md shadow-blue-600/20">
          <Clock size={12} />
          {lang === "bn" ? "আগামী ইভেন্ট" : "Upcoming"}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
        {lang === "bn" ? "সম্পন্ন ইভেন্ট" : "Past Event"}
      </span>
    );
  };

  const handleShare = async (event: Event) => {
    const shareTitle = lang === "bn" ? event.titleBn : event.titleEn;
    const shareText = `${shareTitle}\n📅 ${formatDate(event.date)}\n📍 ${lang === "bn" ? event.locationBn : event.locationEn}`;
    const shareUrl = `${window.location.origin}/#/events?id=${event.id}`;
    const fullMessage = `${shareText}\n\n${lang === "bn" ? event.descriptionBn?.slice(0, 100) : event.descriptionEn?.slice(0, 100)}...\n\nRead more: ${shareUrl}\n— ${lang === "bn" ? settings?.nameBn : settings?.nameEn}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: fullMessage,
          url: shareUrl,
        });
        return;
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(fullMessage);
      setCopyStatus(event.id);
      setTimeout(() => setCopyStatus(null), 3000);

      if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        window.open(`https://wa.me/?text=${encodeURIComponent(fullMessage)}`, "_blank");
      }
    } catch {
      window.open(`https://wa.me/?text=${encodeURIComponent(fullMessage)}`, "_blank");
    }
  };

  const openFacebookShare = (event: Event) => {
    const shareUrl = encodeURIComponent(`${window.location.origin}/#/events?id=${event.id}`);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, "_blank");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 bengali animate-in fade-in duration-500">
      {/* Page Hero Header */}
      <PageHero
        icon={<Calendar size={20} />}
        badgeBn="সংস্থার কার্যক্রম"
        badgeEn="Official Event Records"
        titleBn="ইভেন্টস ও সামাজিক কার্যক্রম"
        titleEn="Events & Social Initiatives"
        subtitleBn="আজাদী সমাজ কল্যাণ সংঘের আর্তমানবতার সেবা, শিক্ষা, স্বাস্থ্য ও ক্রীড়া বিষয়ক কর্মকাণ্ডের বিবরণী।"
        subtitleEn="Comprehensive directory of our community relief drives, sports tournaments, and social development programs."
        breadcrumbs={[
          { labelBn: "ইভেন্টস", labelEn: "Events" }
        ]}
      />

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mb-12">
        {[
          { key: "all", labelBn: `সব ইভেন্ট (${categorizedEvents.all.length})`, labelEn: `All (${categorizedEvents.all.length})` },
          { key: "upcoming", labelBn: `আগামী (${categorizedEvents.upcoming.length})`, labelEn: `Upcoming (${categorizedEvents.upcoming.length})` },
          { key: "ongoing", labelBn: `চলমান (${categorizedEvents.ongoing.length})`, labelEn: `Ongoing (${categorizedEvents.ongoing.length})` },
          { key: "past", labelBn: `সম্পন্ন (${categorizedEvents.past.length})`, labelEn: `Past (${categorizedEvents.past.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-5 py-2.5 sm:px-6 sm:py-3 rounded-2xl text-xs sm:text-sm font-black transition-all duration-300 flex items-center gap-2 uppercase tracking-wider cursor-pointer ${
              activeTab === tab.key
                ? "bg-blue-700 dark:bg-blue-600 text-white shadow-lg shadow-blue-600/25 scale-105"
                : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            {activeTab === tab.key && <Check size={14} className="text-amber-400" />}
            <span>{lang === "bn" ? tab.labelBn : tab.labelEn}</span>
          </button>
        ))}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loadingEvents ? (
          <div className="col-span-full">
            <SkeletonLoader variant="card" count={3} />
          </div>
        ) : displayedEvents.length > 0 ? (
          displayedEvents.map((event) => (
            <div
              key={event.id}
              className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-soft hover:shadow-heavy transition-all duration-300 flex flex-col hover:-translate-y-2"
            >
              {/* Cover Image */}
              <div className="relative h-56 sm:h-64 overflow-hidden bg-slate-100 dark:bg-slate-950">
                {event.image ? (
                  <img
                    src={getOptimizedImageUrl(event.image, 600)}
                    alt={lang === "bn" ? event.titleBn : event.titleEn}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    onError={() => {
                      logImageLoadFailure(getOptimizedImageUrl(event.image, 600), `Event Image (${event.titleEn})`);
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 gap-3 bg-slate-100 dark:bg-slate-900">
                    <ImageIcon size={48} className="opacity-40" />
                    <span className="text-xs font-bold uppercase tracking-widest opacity-60">
                      {lang === "bn" ? "ছবি নেই" : "No Photo Available"}
                    </span>
                  </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-4 left-4 z-10">
                  {getEventStatusBadge(event)}
                </div>

                {/* Date Tag */}
                <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur-md text-white px-3.5 py-1.5 rounded-xl text-xs font-black shadow-lg border border-white/10 flex items-center gap-1.5">
                  <Calendar size={14} className="text-amber-400" />
                  <span>{formatDate(event.date)}</span>
                </div>
              </div>

              {/* Event Content */}
              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-amber-400 transition-colors leading-snug line-clamp-2">
                    {lang === "bn" ? event.titleBn : event.titleEn}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-blue-600 dark:text-amber-400 shrink-0" />
                      <span className="truncate max-w-[180px]">
                        {lang === "bn" ? event.locationBn : event.locationEn}
                      </span>
                    </div>

                    {event.meetUrl && (
                      <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/40 px-2.5 py-0.5 rounded-full text-[10px] font-black">
                        <Video size={12} className="animate-pulse" />
                        <span>Google Meet</span>
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed line-clamp-3 opacity-90">
                    {lang === "bn" ? event.descriptionBn : event.descriptionEn}
                  </p>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setSelectedEvent(event);
                      setSearchParams({ id: event.id });
                      setTimeout(() => {
                        document
                          .getElementById("event-details-section")
                          ?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }, 100);
                    }}
                    className="inline-flex items-center gap-2 text-blue-700 dark:text-amber-400 font-black text-xs uppercase tracking-wider hover:gap-3 transition-all cursor-pointer group/btn"
                  >
                    <span>{lang === "bn" ? "বিস্তারিত দেখুন" : "View Details"}</span>
                    <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openFacebookShare(event)}
                      title="Share on Facebook"
                      className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <Share2 size={16} />
                    </button>
                    <button
                      onClick={() => handleShare(event)}
                      title="Copy Share Link"
                      className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"
                    >
                      {copyStatus === event.id ? (
                        <CheckCircle size={16} className="text-emerald-500" />
                      ) : (
                        <Share2 size={16} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-4">
            <Calendar size={48} className="mx-auto text-slate-400 opacity-50" />
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">
              {lang === "bn" ? "এই ক্যাটাগরিতে কোনো ইভেন্ট নেই" : "No Events Found in this Category"}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {lang === "bn" ? "নতুন ইভেন্ট দ্রুত যুক্ত করা হবে।" : "Please check back soon for upcoming schedule updates."}
            </p>
          </div>
        )}
      </div>

      {/* Selected Event Detail Modal / Section */}
      {selectedEvent && (
        <div
          id="event-details-section"
          className="scroll-mt-24 mt-20 p-8 sm:p-12 bg-white dark:bg-slate-900 rounded-4xl border-2 border-blue-600/30 dark:border-amber-400/30 shadow-heavy space-y-8 animate-in fade-in duration-500"
        >
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
            <div className="space-y-1">
              <span className="text-xs font-black uppercase text-blue-600 dark:text-amber-400 tracking-widest">
                {lang === "bn" ? "ইভেন্টের বিস্তারিত তথ্য" : "Event Detail Record"}
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white leading-tight">
                {lang === "bn" ? selectedEvent.titleBn : selectedEvent.titleEn}
              </h2>
            </div>
            <button
              onClick={() => {
                setSelectedEvent(null);
                setSearchParams({});
              }}
              className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {selectedEvent.image && (
                <div className="rounded-3xl overflow-hidden max-h-96 border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950">
                  <img
                    src={getOptimizedImageUrl(selectedEvent.image, 1000)}
                    alt={selectedEvent.titleEn}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={() => logImageLoadFailure(selectedEvent.image, "Event Detail")}
                  />
                </div>
              )}

              <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed font-medium text-base sm:text-lg whitespace-pre-line">
                {lang === "bn" ? selectedEvent.descriptionBn : selectedEvent.descriptionEn}
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                <h4 className="text-xs font-black uppercase text-slate-500 tracking-widest border-b border-slate-200 dark:border-slate-800 pb-3">
                  {lang === "bn" ? "মূল তথ্য" : "Event Metadata"}
                </h4>

                <div className="space-y-3 text-sm font-bold">
                  <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                    <Calendar size={18} className="text-blue-600 dark:text-amber-400" />
                    <span>{formatDate(selectedEvent.date)}</span>
                  </div>

                  <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                    <MapPin size={18} className="text-blue-600 dark:text-amber-400" />
                    <span>{lang === "bn" ? selectedEvent.locationBn : selectedEvent.locationEn}</span>
                  </div>

                  {selectedEvent.meetUrl && (
                    <a
                      href={selectedEvent.meetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md"
                    >
                      <Video size={16} />
                      <span>{lang === "bn" ? "গুগল মিটে যোগ দিন" : "Join Google Meet"}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Share Controls */}
              <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-black uppercase text-slate-500 tracking-widest">
                  {lang === "bn" ? "শেয়ার করুন" : "Share Event"}
                </h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleShare(selectedEvent)}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Share2 size={16} />
                    <span>{copyStatus === selectedEvent.id ? (lang === "bn" ? "কপি হয়েছে" : "Copied") : (lang === "bn" ? "শেয়ার" : "Share")}</span>
                  </button>
                  <button
                    onClick={() => openFacebookShare(selectedEvent)}
                    className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-black uppercase cursor-pointer transition-all"
                  >
                    Facebook
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Institutional CTA */}
      <PageCTA />
    </div>
  );
};

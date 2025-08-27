"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import UserNavbar from "../../../../components/UserNavbar";
import withAuth from "../../../../hoc/withAuth";
import VideoModal from "../../../../components/viewModal";
import { jwtDecode } from "jwt-decode";

/* ---------- Built-in fallback thumbnail (no network request) ---------- */
const FALLBACK_THUMB =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 360' role='img' aria-label='Preview unavailable'>
  <defs>
    <linearGradient id='g' x1='0' x2='1' y1='0' y2='1'>
      <stop offset='0%' stop-color='#0f1b2d'/>
      <stop offset='100%' stop-color='#13233a'/>
    </linearGradient>
  </defs>
  <rect width='640' height='360' fill='url(#g)'/>
  <circle cx='320' cy='180' r='42' fill='#ff7a1a' opacity='.9'/>
  <polygon points='308,160 352,180 308,200' fill='#0a0a0a'/>
  <text x='320' y='315' text-anchor='middle' font-size='16' fill='#9fb0c8' font-family='system-ui, -apple-system, Segoe UI, Roboto'>Preview unavailable</text>
</svg>
`);

/* ---------- Extract Google Drive file id from URL or JWT ---------- */
function getDriveId(maybeUrlOrJwt) {
  if (!maybeUrlOrJwt) return null;

  // If it's a JWT with { gdriveUrl | url | gdrive | id }
  try {
    const p = jwtDecode(maybeUrlOrJwt);
    const fromPayload = p?.gdriveUrl || p?.url || p?.gdrive || p?.id || "";
    if (fromPayload) {
      const id = getDriveId(fromPayload);
      if (id) return id;
    }
  } catch {
    /* not a JWT */
  }

  const s = String(maybeUrlOrJwt);

  // /file/d/FILEID
  let m = s.match(/\/file\/d\/([a-zA-Z0-9_-]{10,})/);
  if (m?.[1]) return m[1];

  // ?id=FILEID
  m = s.match(/[?&]id=([a-zA-Z0-9_-]{10,})/);
  if (m?.[1]) return m[1];

  // /d/FILEID
  m = s.match(/\/d\/([a-zA-Z0-9_-]{10,})/);
  if (m?.[1]) return m[1];

  // raw id?
  if (/^[a-zA-Z0-9_-]{20,}$/.test(s)) return s;

  return null;
}

function SubCoursesPage() {
  const router = useRouter();
  const { id } = router.query;

  const [course, setCourse] = useState(null);
  const [subcourses, setSubcourses] = useState([]);
  const [selectedGDriveId, setSelectedGDriveId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setIsError(false);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/api/subcourse/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourse(res.data.course);
      setSubcourses(res.data.subcourses || []);
    } catch (e) {
      console.error("Failed to load subcourses:", e);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const chapterCount = useMemo(() => subcourses.length, [subcourses]);

  return (
    <>
      {/* --- Page-only style to make navbar SOLID (no gray when not scrolled) --- */}
      <style jsx global>{`
        .nav-surface {
          background: var(--surface) !important;
          backdrop-filter: none !important;
        }
      `}</style>

      <UserNavbar />

      <main className="w-full mx-auto px-4 md:px-6 lg:px-8 py-6 bg-background text-foreground min-h-screen">
        {/* Course header */}
        <section className="card p-6 md:p-7 mb-8 border-token">
          {!course ? (
            <div className="animate-pulse">
              <div className="h-7 w-2/3 mb-3 rounded bg-[var(--elev-2)]" />
              <div className="h-4 w-full mb-2 rounded bg-[var(--elev-2)]" />
              <div className="h-4 w-5/6 rounded bg-[var(--elev-2)]" />
            </div>
          ) : (
            <>
              <h1 className="text-2xl md:text-3xl font-extrabold mb-2">
                {course.title}
              </h1>
              <p className="text-muted mb-4">{course.description}</p>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span
                  className="inline-flex items-center px-3 py-1 rounded-full border border-token"
                  style={{
                    background:
                      "color-mix(in oklab, var(--brand), transparent 85%)",
                  }}
                >
                  Total Chapters:{" "}
                  <strong className="ml-1">{chapterCount}</strong>
                </span>
              </div>
            </>
          )}
        </section>

        {/* Error */}
        {isError && (
          <div className="card p-6 border-token mb-8">
            <p className="text-red-400 font-semibold">
              Couldn’t load chapters.
            </p>
            <p className="text-muted mt-1">Please try again.</p>
            <button onClick={fetchData} className="btn btn-brand mt-4">
              Retry
            </button>
          </div>
        )}

        {/* Loading */}
        {isLoading && !isError && (
          <div
            className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            aria-busy="true"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card p-4 animate-pulse border-token">
                <div className="rounded bg-[var(--elev-2)] aspect-[16/9] mb-4" />
                <div className="h-5 w-3/4 rounded bg-[var(--elev-2)]" />
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!isLoading && !isError && subcourses.length === 0 && (
          <div className="card p-8 text-center border-token">
            <h3 className="text-xl font-bold">No chapters yet</h3>
            <p className="text-muted mt-1">Check back later.</p>
          </div>
        )}

        {/* Chapters */}
        {!isLoading && !isError && subcourses.length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-4">Chapters</h2>
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {subcourses.map((sc) => {
                const fileId = getDriveId(sc.gdriveUrl);
                const thumb = fileId
                  ? `https://lh3.googleusercontent.com/d/${fileId}=s640`
                  : FALLBACK_THUMB;

                return (
                  <article
                    key={sc._id}
                    role="button"
                    tabIndex={0}
                    onClick={() => fileId && setSelectedGDriveId(fileId)}
                    onKeyDown={(e) => {
                      if ((e.key === "Enter" || e.key === " ") && fileId) {
                        e.preventDefault();
                        setSelectedGDriveId(fileId);
                      }
                    }}
                    className="card border-token overflow-hidden transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-4"
                    style={{ boxShadow: "var(--shadow-lg)" }}
                    aria-label={`Open ${sc.title}`}
                  >
                    <div className="relative">
                      <div className="bg-[var(--elev-2)] aspect-[16/9]">
                        <img
                          src={thumb}
                          alt={sc.title || "Chapter thumbnail"}
                          className="h-full w-full object-cover"
                          loading="lazy"
                          decoding="async"
                          fetchpriority="low"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            // stop retry loop and swap once to fallback
                            if (e.currentTarget.src !== FALLBACK_THUMB) {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = FALLBACK_THUMB;
                            }
                          }}
                        />
                      </div>
                      <div className="absolute bottom-0 inset-x-0 p-2 text-sm font-semibold bg-black/60 text-white">
                        {sc.title}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* Video modal */}
      {selectedGDriveId && (
        <VideoModal
          gdriveId={selectedGDriveId}
          onClose={() => setSelectedGDriveId(null)}
        />
      )}
    </>
  );
}

export default withAuth(SubCoursesPage, "user");

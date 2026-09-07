import { useEffect, useMemo, useRef, useState } from "react";

// const FILTERS = [
//   {
//     id: "parang",
//     name: "Parang",
//     tone: "Batik Klasik",
//     hue: "from-batik-gold to-batik-brown",
//     image: "/assets/batik-ciptoning-1024x1024.webp",
//     history: "Motif klasik yang melambangkan kekuatan, kesinambungan, dan kehormatan.",
//   },
//   {
//     id: "megamendung",
//     name: "Megamendung",
//     tone: "Pesisir",
//     hue: "from-sky-400 to-indigo-500",
//     image: "/assets/elegant-floral-botanical-print-fabric-stationery_1325579-3321.avif",
//     history: "Terinspirasi dari awan mendung, melambangkan keteduhan dan kesabaran.",
//   },
//   {
//     id: "dringo",
//     name: "Dringo",
//     tone: "Jogja",
//     hue: "from-rose-400 to-batik-red",
//     image: "/assets/Motif-Batik-Jogja.webp",
//     history: "Motif Yogyakarta yang sering dipakai untuk acara adat dan resmi.",
//   },
//   {
//     id: "kawung",
//     name: "Kawung",
//     tone: "Keraton",
//     hue: "from-amber-300 to-batik-gold",
//     history: "Motif kerajaan yang melambangkan kesucian dan pengendalian diri.",
//   },
//   {
//     id: "lasem",
//     name: "Lasem",
//     tone: "Peranakan",
//     hue: "from-orange-300 to-red-500",
//     history: "Perpaduan budaya Tionghoa dan Jawa, kuat pada warna merah khas.",
//   },
//   {
//     id: "buketan",
//     name: "Buketan",
//     tone: "Floral",
//     hue: "from-emerald-300 to-teal-500",
//     history: "Motif bunga-bungaan yang populer di pesisir dengan nuansa ceria.",
//   },
// ];

//ambil dari backend
const FALLBACK_FILTER = {
  id: "",
  name: "Memuat...",
  tone: "",
  hue: "from-neutral-700 to-neutral-900",
  image: null,
  history: "",
};

const GESTURE_COOLDOWN_MS = 900;

const getFingerState = (landmarks, handedness) => {
  const index = landmarks[8].y < landmarks[6].y;
  const middle = landmarks[12].y < landmarks[10].y;
  const ring = landmarks[16].y < landmarks[14].y;
  const pinky = landmarks[20].y < landmarks[18].y;
  const thumb =
    handedness === "Right"
      ? landmarks[4].x < landmarks[3].x
      : landmarks[4].x > landmarks[3].x;

  return { thumb, index, middle, ring, pinky };
};

const classifyGesture = (landmarks, handedness) => {
  const fingers = getFingerState(landmarks, handedness);
  const isL = fingers.thumb && fingers.index && !fingers.middle && !fingers.ring && !fingers.pinky;
  const isPalm =
    fingers.thumb && fingers.index && fingers.middle && fingers.ring && fingers.pinky;
  const isPeace = fingers.index && fingers.middle && !fingers.ring && !fingers.pinky;
  const isFist =
    !fingers.thumb && !fingers.index && !fingers.middle && !fingers.ring && !fingers.pinky;

  if (isFist) return "fist";
  if (isPeace) return "peace";
  if (isPalm) return "palm";
  if (isL) return "l";
  return null;
};

export default function App() {
  const videoRef = useRef(null);
  const reelRef = useRef(null);
  const streamRef = useRef(null);
  const handsRef = useRef(null);
  const rafRef = useRef(null);
  const lastGestureRef = useRef({ type: null, time: 0 });
  const skeletonRef = useRef(null);
  const showSkeletonRef = useRef(false);
  const programmaticScrollRef = useRef(0);
  const analysisAbortRef = useRef(null);
  const gestureActionsRef = useRef({
    next: () => {},
    prev: () => {},
    analysis: () => {},
    detail: () => {},
    close: () => {},
  });
  const [activeId, setActiveId] = useState("parang");
  const [centerId, setCenterId] = useState("parang");
  const [cameraStatus, setCameraStatus] = useState("idle");
  const [cameraError, setCameraError] = useState("");
  const [analysisStage, setAnalysisStage] = useState("idle");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisError, setAnalysisError] = useState("");
  const [recommendedBatiks, setRecommendedBatiks] = useState([]);
  const [showDetail, setShowDetail] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [FILTERS, setFilters] = useState([]);
  const [filtersError, setFiltersError] = useState("");
  const centerIdRef = useRef("parang");
  const analysisTimeoutRef = useRef(null);
  const apiBase = import.meta.env.VITE_COLOR_API_URL || "http://localhost:8000";
  const backendApiBase = import.meta.env.VITE_API_URL || "http://localhost:4000";
  // const [showSkeleton, setShowSkeleton] = useState(false);
  // const centerIdRef = useRef("parang");
  // const analysisTimeoutRef = useRef(null);
  // const apiBase = import.meta.env.VITE_COLOR_API_URL || "http://localhost:8000";

  //fetch batik catalog from backend
    useEffect(() => {
    const fetchBatikCatalog = async () => {
      try {
        const response = await fetch(`${backendApiBase}/api/batik`);
        if (!response.ok) throw new Error("Gagal memuat katalog batik dari backend.");
        const data = await response.json();
        const mapped = data.map((item) => ({
          ...item,
          image: item.imageUrl ? `${backendApiBase}${item.imageUrl}` : null,
        }));
        setFilters(mapped);
        // const data = await response.json();
        // const mapped = data.map((item) => ({ ...item, image: item.imageUrl }));
        // setFilters(mapped);
      } catch (error) {
        setFiltersError(error.message || "Gagal memuat katalog batik dari backend.");
      }
    };

    fetchBatikCatalog();
  }, []);

  useEffect(() => {
    const startCamera = async () => {
      if (streamRef.current) return;
      setCameraStatus("loading");
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = streamRef.current;
        }
        setCameraStatus("ready");
      } catch (error) {
        setCameraError("Izin kamera ditolak. Aktifkan akses kamera untuk pengalaman penuh.");
        setCameraStatus("error");
      }
    };

    const stopCamera = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setCameraStatus("idle");
    };

    if (!isIdle) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isIdle]);

  //add FILTERS to useMemo to avoid unnecessary recalculations
  const activeIndex = useMemo(
    () => FILTERS.findIndex((item) => item.id === activeId),
    [activeId, FILTERS]
  );

  const activeFilter = useMemo(
    () => FILTERS.find((item) => item.id === activeId) || FILTERS[0] || FALLBACK_FILTER,
    [activeId, FILTERS]
  );

  const centerFilter = useMemo(
    () => FILTERS.find((item) => item.id === centerId) || FILTERS[0] || FALLBACK_FILTER,
    [centerId, FILTERS]
  );

  const scrollToFilter = (id, behavior = "smooth") => {
    const reel = reelRef.current;
    if (!reel) return;
    const target = reel.querySelector(`[data-filter-id="${id}"]`);
    if (!target) return;
    const reelRect = reel.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const offset = targetRect.left - reelRect.left - (reelRect.width / 2 - targetRect.width / 2);
    reel.scrollTo({ left: reel.scrollLeft + offset, behavior });
  };

  const getClosestFilterId = (reel) => {
    const reelRect = reel.getBoundingClientRect();
    const centerX = reelRect.left + reelRect.width / 2;
    const items = Array.from(reel.querySelectorAll("[data-filter-id]"));
    if (items.length === 0) return null;

    let closest = items[0];
    let closestDistance = Infinity;

    items.forEach((item) => {
      const rect = item.getBoundingClientRect();
      const itemCenter = rect.left + rect.width / 2;
      const distance = Math.abs(centerX - itemCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closest = item;
      }
    });

    return closest.getAttribute("data-filter-id");
  };

  const moveBy = (delta) => {
    const count = FILTERS.length;
    if (!count) return;
    const nextIndex = Math.min(Math.max(activeIndex + delta, 0), count - 1);
    const nextId = FILTERS[nextIndex].id;
    programmaticScrollRef.current = Date.now() + 400;
    setActiveId(nextId);
    setCenterId(nextId);
    centerIdRef.current = nextId;
    scrollToFilter(nextId, "smooth");
  };

  const captureFrameBlob = async () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) {
      throw new Error("Kamera belum siap.");
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Gagal membuat canvas.");
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (result) => (result ? resolve(result) : reject(new Error("Gagal mengambil frame."))),
        "image/jpeg",
        0.9
      );
    });

    return blob;
  };

  // panggil endpoint rekomendasi batik berdasarkan hasil analisis Personal Color
  const fetchRecommendations = async (season) => {
    if (!season) return;
    try {
      const response = await fetch(
        `${backendApiBase}/api/batik/recommend?season=${encodeURIComponent(season)}`
      );
      if (!response.ok) return;
      const data = await response.json();
      setRecommendedBatiks(data.recommendations || []);
    } catch (error) {
      // Rekomendasi bersifat pelengkap — kalau gagal, jangan ganggu hasil analisis utama
    }
  };

  const startColorAnalysis = async () => {
    if (analysisStage === "analyzing") return;
    setAnalysisStage("analyzing");
    setAnalysisResult(null);
    setAnalysisError("");

    if (analysisTimeoutRef.current) {
      clearTimeout(analysisTimeoutRef.current);
    }
    if (analysisAbortRef.current) {
      analysisAbortRef.current.abort();
    }

    const controller = new AbortController();
    analysisAbortRef.current = controller;
    analysisTimeoutRef.current = setTimeout(() => controller.abort(), 8000);

    try {
      const frameBlob = await captureFrameBlob();
      const formData = new FormData();
      formData.append("image", frameBlob, "frame.jpg");

      const response = await fetch(`${apiBase}/analyze`, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Analisis gagal.");
      }

      const data = await response.json();
      setAnalysisResult(data);
      setAnalysisStage("result");
      // panggil fungsi rekomendasi setelah analisis berhasil
      fetchRecommendations(data.season);
    } catch (error) {
      setAnalysisError(error?.message || "Analisis gagal.");
      setAnalysisStage("error");
    } finally {
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current);
        analysisTimeoutRef.current = null;
      }
      analysisAbortRef.current = null;
    }
  };

  const closeAnalysis = () => {
    setAnalysisStage("idle");
    setAnalysisError("");
    setAnalysisResult(null);
  };

  const openDetail = () => {
    setShowDetail(true);
  };

  const closeDetail = () => {
    setShowDetail(false);
  };

  useEffect(() => {
    gestureActionsRef.current = {
      next: () => moveBy(1),
      prev: () => moveBy(-1),
      analysis: () => startColorAnalysis(),
      detail: () => openDetail(),
      close: () => {
        closeDetail();
        closeAnalysis();
      },
    };
  }, [activeIndex, centerId, isIdle]);

  useEffect(() => {
    centerIdRef.current = centerId;
  }, [centerId]);

  useEffect(() => {
    showSkeletonRef.current = showSkeleton;
  }, [showSkeleton]);

  useEffect(() => {
    const handleGesture = (event) => {
      const type = event?.detail?.type;
      if (!type) return;
      if (type === "next") moveBy(1);
      if (type === "prev") moveBy(-1);
      if (type === "select") {
        setActiveId(centerId);
      }
    };

    window.addEventListener("gesture", handleGesture);

    return () => {
      window.removeEventListener("gesture", handleGesture);
    };
  }, [activeIndex, centerId]);

  useEffect(() => {
    const handleKey = (event) => {
      if (event.repeat) return;
      const key = event.key.toLowerCase();
      if (key === "i") {
        setIsIdle(true);
        setShowDetail(false);
        setAnalysisStage("idle");
        return;
      }
      if (key === "o") {
        setIsIdle(false);
        return;
      }
      if (event.key === "ArrowRight") moveBy(1);
      if (event.key === "ArrowLeft") moveBy(-1);
      if (key === "a") startColorAnalysis();
      if (key === "d") openDetail();
      if (key === "t") setShowSkeleton((prev) => !prev);
    };

    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  }, [centerId, activeIndex]);

  useEffect(() => {
    if (isIdle) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (handsRef.current) {
        handsRef.current.close();
        handsRef.current = null;
      }
      return;
    }

    let cancelled = false;
    const videoElement = videoRef.current;
    if (!videoElement) return;
    const canvasElement = skeletonRef.current;

    const HandsCtor = window.Hands;
    const connections = window.HAND_CONNECTIONS;

    if (!HandsCtor || !connections) return;

    const hands = new HandsCtor({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.6,
    });

    hands.onResults((results) => {
      if (cancelled) return;

      if (canvasElement && showSkeletonRef.current) {
        const width = videoElement.videoWidth || 0;
        const height = videoElement.videoHeight || 0;
        if (width && height) {
          if (canvasElement.width !== width) canvasElement.width = width;
          if (canvasElement.height !== height) canvasElement.height = height;
          const ctx = canvasElement.getContext("2d");
          if (ctx) {
            ctx.clearRect(0, 0, width, height);
            if (results.multiHandLandmarks && results.multiHandedness) {
              results.multiHandLandmarks.forEach((landmarks, index) => {
                const label = results.multiHandedness[index]?.label || "Right";
                const stroke = label === "Right" ? "#f97316" : "#38bdf8";
                const fill =
                  label === "Right" ? "rgba(249,115,22,0.8)" : "rgba(56,189,248,0.8)";

                ctx.lineWidth = 2;
                ctx.strokeStyle = stroke;
                ctx.fillStyle = fill;

                connections.forEach(([start, end]) => {
                  const a = landmarks[start];
                  const b = landmarks[end];
                  ctx.beginPath();
                  ctx.moveTo(a.x * width, a.y * height);
                  ctx.lineTo(b.x * width, b.y * height);
                  ctx.stroke();
                });

                landmarks.forEach((point) => {
                  ctx.beginPath();
                  ctx.arc(point.x * width, point.y * height, 4, 0, Math.PI * 2);
                  ctx.fill();
                });
              });
            }
          }
        }
      }

      if (!results.multiHandLandmarks || !results.multiHandedness) return;

      const handsData = results.multiHandLandmarks.map((landmarks, index) => {
        const label = results.multiHandedness[index]?.label || "Right";
        return { landmarks, label };
      });

      const rightHand = handsData.find((hand) => hand.label === "Right");
      const leftHand = handsData.find((hand) => hand.label === "Left");
      const now = Date.now();

      if (now - lastGestureRef.current.time < GESTURE_COOLDOWN_MS) return;

      let action = null;
      if (rightHand) {
        const gesture = classifyGesture(rightHand.landmarks, "Right");
        if (gesture === "fist") action = "close";
        if (gesture === "peace") action = "analysis";
        if (gesture === "palm") action = "detail";
        if (gesture === "l") action = "prev";
      }

      if (!action && leftHand) {
        const gesture = classifyGesture(leftHand.landmarks, "Left");
        if (gesture === "fist") action = "close";
        if (gesture === "peace") action = "analysis";
        if (gesture === "palm") action = "detail";
        if (gesture === "l") action = "next";
      }

      if (action) {
        lastGestureRef.current = { type: action, time: now };
        const actions = gestureActionsRef.current;
        if (action === "next") actions.next();
        if (action === "prev") actions.prev();
        if (action === "analysis") actions.analysis();
        if (action === "detail") actions.detail();
        if (action === "close") actions.close();
      }
    });

    handsRef.current = hands;

    const processFrame = async () => {
      if (cancelled) return;
      if (videoElement.readyState >= 2 && handsRef.current) {
        try {
          await handsRef.current.send({ image: videoElement });
        } catch (error) {
          // Ignore intermittent frame errors.
        }
      }
      rafRef.current = requestAnimationFrame(processFrame);
    };

    rafRef.current = requestAnimationFrame(processFrame);

    return () => {
      cancelled = true;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (handsRef.current) {
        handsRef.current.close();
        handsRef.current = null;
      }
      if (canvasElement) {
        const ctx = canvasElement.getContext("2d");
        if (ctx) ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      }
    };
  }, [isIdle]);

  useEffect(() => {
    if (!showSkeleton && skeletonRef.current) {
      const ctx = skeletonRef.current.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, skeletonRef.current.width, skeletonRef.current.height);
    }
  }, [showSkeleton]);

  useEffect(() => {
    return () => {
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current);
      }
      if (analysisAbortRef.current) {
        analysisAbortRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    const reel = reelRef.current;
    if (!reel) return;
    let scrollTimeout;
    let rafId;

    const updateCenter = () => {
      if (Date.now() < programmaticScrollRef.current) return;
      const nextId = getClosestFilterId(reel);
      if (!nextId) return;
      centerIdRef.current = nextId;
      setCenterId(nextId);
    };

    const handleScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateCenter);
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const targetId = centerIdRef.current;
        if (!targetId) return;
        setActiveId(targetId);
      }, 120);
    };

    const handleResize = () => {
      updateCenter();
      if (centerIdRef.current) scrollToFilter(centerIdRef.current, "auto");
    };

    updateCenter();
    reel.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(scrollTimeout);
      if (rafId) cancelAnimationFrame(rafId);
      reel.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [centerId]);

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="relative h-screen w-screen overflow-hidden">
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover -scale-x-100"
          autoPlay
          playsInline
          muted
        />
        <canvas
          ref={skeletonRef}
          className={`absolute inset-0 h-full w-full -scale-x-100 ${
            showSkeleton && !isIdle ? "opacity-100" : "opacity-0"
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/80" />

        <header className="absolute left-0 right-0 top-0 z-10 px-5 pt-6">
          {!isIdle && (
            <div className="flex items-center gap-3">
              <img
                src="/assets/logo-museum.png"
                alt="Logo Museum"
                className="h-10 w-10 rounded-full border border-white/30 bg-white/10 p-1 backdrop-blur"
              />
              <div className="text-xs uppercase tracking-[0.4em] text-white/70">Museum Batik</div>
            </div>
          )}
        </header>

        <div className="absolute left-1/2 top-3 z-40 w-[92vw] -translate-x-1/2 rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-white/80 backdrop-blur">
          <p className="text-[0.6rem] uppercase tracking-[0.35em] text-white/60">
            Tombol khusus simulasi
          </p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsIdle(true)}
                className={`rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.25em] transition ${
                  isIdle ? "bg-white text-neutral-900" : "border border-white/30 text-white/80"
                }`}
              >
                Idle
              </button>
              <button
                onClick={() => setIsIdle(false)}
                className={`rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.25em] transition ${
                  !isIdle ? "bg-white text-neutral-900" : "border border-white/30 text-white/80"
                }`}
              >
                On
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSkeleton(false)}
                className={`rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.25em] transition ${
                  !showSkeleton ? "bg-white text-neutral-900" : "border border-white/30 text-white/80"
                }`}
              >
                Bone Off
              </button>
              <button
                onClick={() => setShowSkeleton(true)}
                className={`rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.25em] transition ${
                  showSkeleton ? "bg-white text-neutral-900" : "border border-white/30 text-white/80"
                }`}
              >
                Bone On
              </button>
            </div>
          </div>
        </div>

        <div className="absolute right-5 top-1/2 z-10 hidden -translate-y-1/2 flex-col gap-3 md:flex">
          <button className="grid h-12 w-12 place-items-center rounded-full border border-white/25 bg-white/10 text-[0.55rem] uppercase tracking-[0.25em] backdrop-blur transition hover:scale-105">
            FX
          </button>
          <button className="grid h-12 w-12 place-items-center rounded-full border border-white/25 bg-white/10 text-[0.55rem] uppercase tracking-[0.25em] backdrop-blur transition hover:scale-105">
            Flip
          </button>
          <button className="grid h-12 w-12 place-items-center rounded-full border border-white/25 bg-white/10 text-[0.55rem] uppercase tracking-[0.25em] backdrop-blur transition hover:scale-105">
            Tone
          </button>
          <button className="grid h-12 w-12 place-items-center rounded-full border border-white/25 bg-white/10 text-[0.55rem] uppercase tracking-[0.25em] backdrop-blur transition hover:scale-105">
            Grid
          </button>
        </div>

        <div className="absolute left-1/2 top-20 z-10 -translate-x-1/2 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[0.6rem] uppercase tracking-[0.45em] text-white/80 backdrop-blur">
            Batik AR
          </div>
          <p className="mt-3 text-2xl font-semibold">Museum Batik Yogyakarta</p>
          <p className="mt-1 text-sm text-white/70">Geser katalog bulat untuk memilih motif.</p>
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          {cameraStatus === "loading" && (
            <div className="rounded-full bg-white/10 px-5 py-2 text-xs uppercase tracking-[0.3em] backdrop-blur">
              Mengaktifkan kamera...
            </div>
          )}
          {cameraStatus === "error" && (
            <div className="max-w-sm rounded-2xl border border-white/10 bg-black/60 px-5 py-4 text-center text-sm backdrop-blur">
              {cameraError}
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-10 pb-6">
          <div className="safe-bottom mx-auto w-[94vw] max-w-xl">
            <div className="reel-mask">
              <div
                ref={reelRef}
                className={`filter-scroll flex items-center justify-center gap-5 overflow-x-auto px-6 pb-4 pt-2 ${
                  isIdle ? "pointer-events-none opacity-0" : "opacity-100"
                }`}
              >
                {/* kalau backend mati atau CORS bermasalah, yang dilihat adalah pesan error di layar, bukan carousel kosong yang membingungkan */}
                {/* {filtersError && (
                  <p className="w-full text-center text-xs text-red-300">{filtersError}</p>
                )}
                {!filtersError && FILTERS.length === 0 && (
                  <p className="w-full text-center text-xs text-white/60">
                    Memuat katalog batik...
                  </p>
                )} */}
                {FILTERS.map((item) => {
                  const isActive = item.id === activeId;
                  return (
                    <button
                      key={item.id}
                      data-filter-id={item.id}
                        onClick={() => {
                          setActiveId(item.id);
                          setCenterId(item.id);
                          centerIdRef.current = item.id;
                          scrollToFilter(item.id, "smooth");
                        }}
                      className="snap-center flex flex-col items-center gap-2"
                    >
                      <span
                        className={`relative grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br ${item.hue} text-sm font-semibold text-white shadow-lg transition ${
                          isActive
                            ? "scale-110 ring-4 ring-white/80 shadow-[0_0_25px_rgba(255,255,255,0.35)]"
                            : "scale-100 opacity-80"
                        }`}
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="absolute inset-0 h-full w-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-base font-semibold">{item.name[0]}</span>
                        )}
                        <span className="absolute inset-0 rounded-full bg-gradient-to-t from-black/35 via-transparent to-white/10" />
                        {/* menampilkan badge ✓ di carousel untuk motif yang direkomendasikan */}
                        {recommendedBatiks.some((rec) => rec.id === item.id) && (
                          <span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-emerald-400 text-[0.6rem] font-bold text-neutral-900 shadow ring-2 ring-neutral-950">
                            ✓
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {analysisStage === "analyzing" && (
          <div className="absolute inset-0 z-20 flex items-center justify-center">
            <div className="rounded-2xl bg-white/10 px-6 py-4 text-xs uppercase tracking-[0.3em] text-white/90 backdrop-blur">
              AI Color Analysis...
            </div>
          </div>
        )}

        {analysisStage === "result" && (
          <div className="absolute inset-0 z-20 flex items-center justify-center">
            <div className="max-w-xs rounded-3xl bg-white px-6 py-5 text-center text-neutral-900 shadow-2xl">
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.4em] text-neutral-500">
                Hasil Analisis
              </p>
              <h3 className="mt-2 text-xl font-semibold">
                {analysisResult?.season || "Tidak diketahui"}
              </h3>
              <p className="mt-2 text-sm text-neutral-500">
                {analysisResult?.description || "Hasil analisis warna personal."}
              </p>
              {analysisResult?.palette?.length ? (
                <div className="mt-4 flex items-center justify-center gap-2">
                  {analysisResult.palette.map((hex) => (
                    <span
                      key={hex}
                      className="h-7 w-7 rounded-full border border-neutral-200"
                      style={{ backgroundColor: hex }}
                      title={hex}
                    />
                  ))}
                </div>
              ) : null}
              <div className="mt-3 text-xs text-neutral-500">
                Confidence: {Math.round((analysisResult?.confidence || 0) * 100)}%
              </div>
              <div className="mt-1 text-[0.65rem] text-neutral-400">
                Skin {analysisResult?.hex?.skin || "-"} • Lip {analysisResult?.hex?.lip || "-"}
              </div>
              {/* Menampilkan daftar nama motif rekomendasi di modal hasil analisis */}
              {recommendedBatiks.length > 0 && (
                <div className="mt-4 border-t border-neutral-200 pt-4 text-left">
                  <p className="text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-neutral-500">
                    Motif Rekomendasi
                  </p>
                  <p className="mt-1 text-sm text-neutral-700">
                    {recommendedBatiks.map((item) => item.name).join(", ")}
                  </p>
                </div>
              )}
              <button
                onClick={closeAnalysis}
                className="mt-4 rounded-full border border-neutral-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-neutral-600"
              >
                Tutup
              </button>
            </div>
          </div>
        )}

        {analysisStage === "error" && (
          <div className="absolute inset-0 z-20 flex items-center justify-center">
            <div className="max-w-xs rounded-3xl bg-white px-6 py-5 text-center text-neutral-900 shadow-2xl">
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.4em] text-neutral-500">
                Analisis Gagal
              </p>
              <p className="mt-2 text-sm text-neutral-500">
                {analysisError || "Terjadi kesalahan saat memproses gambar."}
              </p>
              <button
                onClick={closeAnalysis}
                className="mt-4 rounded-full border border-neutral-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-neutral-600"
              >
                Tutup
              </button>
            </div>
          </div>
        )}

        {showDetail && (
          <div className="absolute inset-0 z-30 flex items-end justify-center bg-black/40 px-5 pb-6">
            <div className="w-full max-w-md rounded-3xl bg-white px-6 py-5 text-neutral-900 shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Detail Batik</p>
                  <h3 className="mt-1 text-xl font-semibold">{activeFilter.name}</h3>
                  <p className="text-sm text-neutral-500">{activeFilter.tone}</p>
                </div>
                <button
                  onClick={closeDetail}
                  className="rounded-full border border-neutral-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-neutral-600"
                >
                  Tutup
                </button>
              </div>
              {activeFilter.image && (
                <img
                  src={activeFilter.image}
                  alt={activeFilter.name}
                  className="mt-4 h-40 w-full rounded-2xl object-cover"
                />
              )}
              <p className="mt-4 text-sm text-neutral-600">{activeFilter.history}</p>
            </div>
          </div>
        )}

        {isIdle && (
          <div className="absolute inset-0 z-20 flex items-center justify-center overflow-hidden bg-[#0b0b0b]">
            <div className="absolute inset-0 opacity-40 [background:radial-gradient(circle_at_top,#4b2f1a,transparent_55%),radial-gradient(circle_at_bottom,#1d1a14,transparent_60%)]" />
            <div className="absolute inset-0 opacity-60 [background-image:radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:26px_26px]" />
            <div className="absolute inset-0 batik-pattern opacity-45" aria-hidden="true" />
            <div className="relative z-10 text-center text-white">
              <div className="idle-orb" aria-hidden="true" />
              <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border border-white/20 bg-white/5 p-2 backdrop-blur">
                <img
                  src="/assets/logo-museum.png"
                  alt="Logo Museum"
                  className="h-20 w-20 animate-float rounded-full"
                />
              </div>
              <p className="mt-6 text-xs uppercase tracking-[0.6em] text-white/60">Museum Batik</p>
              <h2 className="mt-3 text-3xl font-semibold">Standby Mode</h2>
              <p className="mt-2 text-sm text-white/70">Menunggu pengunjung terdeteksi PIR</p>
              <div className="mt-6 flex items-center justify-center gap-3 text-[0.6rem] uppercase tracking-[0.35em] text-white/50">
                <span className="rounded-full border border-white/10 px-3 py-1">Idle</span>
                <span className="h-1 w-1 rounded-full bg-white/30" />
                <span>Sensor aktif</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

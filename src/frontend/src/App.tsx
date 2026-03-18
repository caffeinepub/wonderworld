import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

// ─── Types & Constants ──────────────────────────────────────────────────────

type GameColor = "red" | "blue" | "yellow" | "green";
type GameState = "idle" | "playing" | "result" | "gameover";

interface ColorConfig {
  label: string;
  hex: string;
  hint: string;
  emoji: string;
}

const COLOR_CONFIG: Record<GameColor, ColorConfig> = {
  red: {
    label: "RED",
    hex: "#EF4444",
    hint: "an apple or a fire truck",
    emoji: "🍎",
  },
  blue: {
    label: "BLUE",
    hex: "#3B82F6",
    hint: "the sky or blueberries",
    emoji: "🫐",
  },
  yellow: {
    label: "YELLOW",
    hex: "#EAB308",
    hint: "a banana or the sun",
    emoji: "🍌",
  },
  green: {
    label: "GREEN",
    hex: "#22C55E",
    hint: "a leaf or a frog",
    emoji: "🐸",
  },
};

const COLORS: GameColor[] = ["red", "blue", "yellow", "green"];
const TOTAL_ROUNDS = 5;

function pickRandom(exclude?: GameColor): GameColor {
  const pool = exclude ? COLORS.filter((c) => c !== exclude) : COLORS;
  return pool[Math.floor(Math.random() * pool.length)];
}

// ─── Speech Helper ──────────────────────────────────────────────────────────

function speak(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const msg = new SpeechSynthesisUtterance(text);
  msg.rate = 0.9;
  msg.pitch = 1.2;
  window.speechSynthesis.speak(msg);
}

// ─── Nav ────────────────────────────────────────────────────────────────────

function Nav({ onPlayNow }: { onPlayNow: () => void }) {
  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🐧</span>
          <span className="font-black text-xl text-navy tracking-tight">
            WonderWorld
          </span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-navy font-semibold text-sm">
          <a
            href="#home"
            className="hover:text-teal transition-colors"
            data-ocid="nav.link"
          >
            Home
          </a>
          <button
            type="button"
            onClick={onPlayNow}
            className="hover:text-teal transition-colors"
            data-ocid="nav.link"
          >
            Play Now!
          </button>
          <a
            href="#how"
            className="hover:text-teal transition-colors"
            data-ocid="nav.link"
          >
            How to Play
          </a>
        </div>
        <Button
          onClick={onPlayNow}
          className="btn-wonder bg-gradient-to-r from-[oklch(0.72_0.14_192)] to-[oklch(0.73_0.18_145)] text-white font-bold rounded-full px-5 py-2 text-sm shadow-wonder hover:opacity-90"
          data-ocid="nav.primary_button"
        >
          Start Adventure 🚀
        </Button>
      </div>
    </nav>
  );
}

// ─── Game Logic Hook ─────────────────────────────────────────────────────────

function useGame() {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [currentColor, setCurrentColor] = useState<GameColor>("red");
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [lastResult, setLastResult] = useState<"win" | "fail" | null>(null);
  const [pipWiggle, setPipWiggle] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraError(null);
    } catch {
      setCameraError("Camera access denied. Please allow camera permissions.");
    }
  }, []);

  const startGame = useCallback(async () => {
    const color = pickRandom();
    setCurrentColor(color);
    setRound(1);
    setScore(0);
    setLastResult(null);
    setGameState("playing");
    await startCamera();
    speak(`Hey explorer! Can you find something ${color}?`);
  }, [startCamera]);

  const checkColor = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    let r = 0;
    let g = 0;
    let b = 0;
    const pixels = data.length / 4;
    for (let i = 0; i < data.length; i += 4) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
    }
    r /= pixels;
    g /= pixels;
    b /= pixels;

    let detected: GameColor | "unknown" = "unknown";
    if (r > 180 && g < 120 && b < 120) detected = "red";
    else if (g > 180 && r < 120 && b < 120) detected = "green";
    else if (b > 180 && r < 120 && g < 120) detected = "blue";
    else if (r > 180 && g > 180 && b < 120) detected = "yellow";

    if (detected === currentColor) {
      setScore((s) => s + 1);
      setLastResult("win");
      setPipWiggle(true);
      setTimeout(() => setPipWiggle(false), 700);
      speak("Yay! You found it!");
      setGameState("result");
    } else {
      speak("Hmm, try again!");
      setLastResult("fail");
    }
  }, [currentColor]);

  const nextRound = useCallback(() => {
    if (round >= TOTAL_ROUNDS) {
      stopCamera();
      setGameState("gameover");
      return;
    }
    const next = pickRandom(currentColor);
    setCurrentColor(next);
    setRound((prev) => prev + 1);
    setLastResult(null);
    setGameState("playing");
    speak(`Hey explorer! Can you find something ${next}?`);
  }, [round, currentColor, stopCamera]);

  const skipRound = useCallback(() => {
    nextRound();
  }, [nextRound]);

  const hint = useCallback(() => {
    const cfg = COLOR_CONFIG[currentColor];
    speak(`Look around for something ${currentColor}, like ${cfg.hint}!`);
  }, [currentColor]);

  const resetGame = useCallback(() => {
    stopCamera();
    setGameState("idle");
    setRound(1);
    setScore(0);
    setLastResult(null);
  }, [stopCamera]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  return {
    gameState,
    currentColor,
    round,
    score,
    lastResult,
    pipWiggle,
    cameraError,
    videoRef,
    startGame,
    checkColor,
    nextRound,
    skipRound,
    hint,
    resetGame,
  };
}

// ─── Game Card ───────────────────────────────────────────────────────────────

function GameCard() {
  const game = useGame();
  const cfg = COLOR_CONFIG[game.currentColor];

  return (
    <div
      className="game-card w-full max-w-md mx-auto relative"
      data-ocid="game.card"
    >
      {/* Pip mascot overlapping top-right */}
      <motion.div
        className="absolute -top-10 -right-4 z-20 text-7xl select-none"
        animate={
          game.pipWiggle
            ? {
                rotate: [0, -15, 15, -10, 10, 0],
                scale: [1, 1.3, 1.3, 1.1, 1.1, 1],
              }
            : { rotate: 0, scale: 1 }
        }
        transition={{ duration: 0.6 }}
      >
        🐧
      </motion.div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          {/* IDLE */}
          {game.gameState === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center gap-5 py-6"
            >
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  duration: 2.8,
                  ease: "easeInOut",
                }}
                className="text-9xl"
              >
                🐧
              </motion.div>
              <h2 className="text-2xl font-black text-navy text-center leading-tight">
                Hi! I'm Pip! 👋
              </h2>
              <p className="text-navy/70 text-center text-lg font-semibold">
                Tap Start to help Pip find colors around you!
              </p>
              <Button
                onClick={game.startGame}
                className="btn-wonder bg-gradient-to-r from-teal to-wondergreen text-white w-full text-xl py-6 font-black rounded-3xl shadow-wonder hover:opacity-90 transition-opacity"
                data-ocid="game.primary_button"
              >
                ▶️ Start Quest!
              </Button>
            </motion.div>
          )}

          {/* PLAYING */}
          {game.gameState === "playing" && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-4"
            >
              <div className="flex items-center justify-between">
                <Badge
                  className="text-sm font-bold px-3 py-1 rounded-full"
                  style={{ background: cfg.hex, color: "#fff" }}
                  data-ocid="game.badge"
                >
                  Target:&nbsp;<span className="uppercase">{cfg.label}</span>
                </Badge>
                <span className="text-navy/60 font-bold text-sm">
                  Round {game.round}/{TOTAL_ROUNDS}
                </span>
              </div>

              <h2 className="text-3xl font-black text-navy text-center">
                Find: <span style={{ color: cfg.hex }}>{cfg.label}</span>{" "}
                {cfg.emoji}
              </h2>

              <Progress
                value={(game.round / TOTAL_ROUNDS) * 100}
                className="h-3 rounded-full"
                data-ocid="game.panel"
              />

              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video">
                {game.cameraError ? (
                  <div className="flex items-center justify-center h-full text-white text-sm px-4 text-center font-semibold">
                    {game.cameraError}
                  </div>
                ) : (
                  <>
                    <video
                      ref={game.videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    <div className="reticle" />
                  </>
                )}
              </div>

              <AnimatePresence>
                {game.lastResult === "fail" && (
                  <motion.div
                    key="fail"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center text-red-500 font-black text-lg"
                    data-ocid="game.error_state"
                  >
                    ❌ Hmm… try again!
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex flex-col gap-2 mt-1">
                <Button
                  onClick={game.checkColor}
                  className="btn-wonder bg-gradient-to-r from-teal to-wondergreen text-white w-full text-lg py-5 font-black rounded-3xl shadow-wonder hover:opacity-90"
                  data-ocid="game.primary_button"
                >
                  📸 Found It!
                </Button>
                <div className="flex gap-3">
                  <Button
                    onClick={game.hint}
                    variant="outline"
                    className="flex-1 rounded-3xl border-2 border-teal text-teal font-bold py-4 text-base hover:bg-teal/10"
                    data-ocid="game.secondary_button"
                  >
                    💡 Hint, Pip!
                  </Button>
                  <Button
                    onClick={game.skipRound}
                    className="flex-1 rounded-3xl bg-gradient-to-r from-wonderblue to-[oklch(0.63_0.17_255)] text-white font-bold py-4 text-base hover:opacity-90"
                    data-ocid="game.button"
                  >
                    ⏭️ Skip
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* RESULT */}
          {game.gameState === "result" && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-5 py-8"
              data-ocid="game.success_state"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="text-8xl"
              >
                🎉
              </motion.div>
              <h2 className="text-3xl font-black text-navy text-center">
                Amazing job!
              </h2>
              <p className="text-navy/70 font-semibold text-lg text-center">
                You found something{" "}
                <span style={{ color: cfg.hex }} className="font-black">
                  {cfg.label}
                </span>
                !
              </p>
              <Badge className="text-base px-4 py-2 rounded-full bg-wondergreen/20 text-wondergreen font-black">
                Score: {game.score} / {game.round}
              </Badge>
              <Button
                onClick={game.nextRound}
                className="btn-wonder bg-gradient-to-r from-teal to-wondergreen text-white w-full text-xl py-6 font-black rounded-3xl shadow-wonder hover:opacity-90"
                data-ocid="game.primary_button"
              >
                {game.round < TOTAL_ROUNDS
                  ? "Next Color! ➡️"
                  : "See Results! 🏆"}
              </Button>
            </motion.div>
          )}

          {/* GAME OVER */}
          {game.gameState === "gameover" && (
            <motion.div
              key="gameover"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-5 py-8"
              data-ocid="game.panel"
            >
              <div className="text-8xl">🏆</div>
              <h2 className="text-3xl font-black text-navy text-center">
                Quest Complete!
              </h2>
              <p className="text-navy/70 font-semibold text-xl">You scored</p>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 280,
                  damping: 14,
                  delay: 0.2,
                }}
                className="text-6xl font-black"
                style={{
                  color:
                    game.score >= 4
                      ? "#22C55E"
                      : game.score >= 2
                        ? "#EAB308"
                        : "#EF4444",
                }}
              >
                {game.score} / {TOTAL_ROUNDS}
              </motion.div>
              <p className="text-navy/60 text-center text-base font-semibold">
                {game.score === TOTAL_ROUNDS
                  ? "Perfect! You're a color explorer champion! 🌟"
                  : game.score >= 3
                    ? "Great job! Pip is so proud of you! 🐧"
                    : "Nice try! Want to play again and beat your score?"}
              </p>
              <Button
                onClick={game.resetGame}
                className="btn-wonder bg-gradient-to-r from-teal to-wondergreen text-white w-full text-xl py-6 font-black rounded-3xl shadow-wonder hover:opacity-90"
                data-ocid="game.primary_button"
              >
                🔄 Play Again!
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────

const HOW_STEPS = [
  {
    icon: "🎯",
    title: "Get a Color Quest",
    desc: "Pip gives you a mystery color to find. Your adventure begins!",
  },
  {
    icon: "📸",
    title: "Search & Scan",
    desc: "Use your camera to point at objects around you. Find the color!",
  },
  {
    icon: "🌟",
    title: "Win Stars!",
    desc: "Score points for each color you find. Beat all 5 rounds to win!",
  },
];

function HowItWorks() {
  return (
    <section id="how" className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-4xl font-black text-navy text-center mb-4">
          How It Works
        </h2>
        <p className="text-navy/60 text-center text-lg mb-12 font-semibold">
          Three easy steps to color adventure!
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {HOW_STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="bg-gradient-to-b from-teal/5 to-white rounded-3xl p-8 text-center shadow-card border border-teal/10 hover:shadow-wonder transition-shadow"
            >
              <div className="text-6xl mb-4">{step.icon}</div>
              <div className="w-8 h-8 rounded-full bg-teal text-white font-black text-sm flex items-center justify-center mx-auto mb-3">
                {i + 1}
              </div>
              <h3 className="text-xl font-black text-navy mb-2">
                {step.title}
              </h3>
              <p className="text-navy/60 font-semibold">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────

const FEATURES = [
  { icon: "🗣️", label: "Voice Guided" },
  { icon: "📷", label: "Live Camera" },
  { icon: "🌈", label: "4 Fun Colors" },
  { icon: "🏆", label: "Score Tracking" },
];

function Features() {
  return (
    <section className="py-16 bg-gradient-to-r from-teal/10 via-wonderyellow/10 to-wonderpurple/10">
      <div className="max-w-4xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {FEATURES.map((f) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-5 text-center shadow-card"
            >
              <div className="text-4xl mb-2">{f.icon}</div>
              <p className="font-black text-navy text-sm">{f.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────

function AppFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-wonderpurple text-white py-10">
      <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🐧</span>
          <span className="font-black text-xl">WonderWorld</span>
        </div>
        <p className="text-white/70 text-sm font-semibold text-center">
          © {year}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white transition-colors"
          >
            caffeine.ai
          </a>
        </p>
        <div className="flex gap-5 text-white/70 text-sm font-semibold">
          <a href="#home" className="hover:text-white transition-colors">
            Home
          </a>
          <a href="#how" className="hover:text-white transition-colors">
            How to Play
          </a>
        </div>
      </div>
    </footer>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────

export default function App() {
  const heroRef = useRef<HTMLDivElement>(null);

  const scrollToGame = () => {
    heroRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen font-nunito bg-white">
      <Nav onPlayNow={scrollToGame} />

      <section
        id="home"
        ref={heroRef}
        className="py-16 px-4 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.72 0.14 192) 0%, oklch(0.73 0.18 145) 50%, oklch(0.88 0.17 96) 100%)",
        }}
      >
        <div
          className="absolute top-0 left-0 w-64 h-64 rounded-full opacity-20 blur-3xl"
          style={{ background: "oklch(0.96 0.08 96)" }}
        />
        <div
          className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-20 blur-3xl"
          style={{ background: "oklch(0.62 0.12 270)" }}
        />

        <div className="max-w-2xl mx-auto relative">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-5xl md:text-6xl font-black text-white mb-3 drop-shadow-lg"
          >
            🌈 WonderWorld
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center text-white/90 text-xl font-bold mb-10"
          >
            The color-finding adventure for curious explorers!
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 150 }}
            className="pt-12"
          >
            <GameCard />
          </motion.div>
        </div>
      </section>

      <HowItWorks />
      <Features />
      <AppFooter />
    </div>
  );
}

import { useState, useEffect } from "react";
import { Clock, Pause, Play } from "lucide-react";

export default function ExperimentTimer({ experimentStarted }) {
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let interval;

    if (experimentStarted) {
      setRunning(true);
    }

    if (running) {
      interval = setInterval(() => {
        setTime((prev) => prev + 1);

        // Haptic feedback every 5 minutes
        if (time > 0 && time % 300 === 0 && "vibrate" in navigator) {
          navigator.vibrate(1200);
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [running, experimentStarted, time]);

  return (
    <div className={`fixed top-4 right-4 bg-[var(--darker)] text-white shadow-md transition-all duration-300 ${
      expanded ? "rounded-full p-1.5 flex items-center" : "rounded-full p-1.5 w-9 h-9 flex items-center justify-center"
    }`}>
      {/* Clickable Clock Icon */}
      <button
        onClick={() => setExpanded(!expanded)}
      >
        <Clock className="w-5 h-5 ml-5.5 text-white cursor-pointer" />
      </button>
  
      {/* Expandable Timer Section */}
      <div
        className={`overflow-hidden bg-gray-800 px-2 py-1 rounded-lg ml-2 transition-all duration-300 ease-in-out flex items-center ${
          expanded ? "max-w-[150px] opacity-100 px-3 " : "max-w-0 opacity-0 px-0"
        }`}
      >
        <span className="text-sm font-semibold">{formatTime(time)}</span>
        <button onClick={() => setRunning(!running)} className="ml-2">
          {running ? <Pause className="w-4 h-4 cursor-pointer" /> : <Play className="w-4 h-4 cursor-pointer" />}
        </button>
      </div>
    </div>
  );
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

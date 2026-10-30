"use client";
import { useEffect, useRef, useState } from "react";

type Props = React.VideoHTMLAttributes<HTMLVideoElement> & { src: string; poster: string };

/**
 * A muted ambient loop. Plays only while on screen, never moves for people who asked for reduced
 * motion (they get the poster frame), and always has a small pause button (WCAG 2.2.2).
 */
export default function LoopVideo(props: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const userPaused = useRef(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      v.pause();
      v.removeAttribute("autoplay");
      userPaused.current = true;
      setPaused(true);
      return;
    }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !userPaused.current) v.play().catch(() => {});
      else v.pause();
    });
    io.observe(v);
    return () => io.disconnect();
  }, []);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) {
      userPaused.current = false;
      v.play().catch(() => {});
      setPaused(false);
    } else {
      userPaused.current = true;
      v.pause();
      setPaused(true);
    }
  };

  return (
    <>
      <video ref={ref} muted loop playsInline autoPlay preload="metadata" {...props} />
      <button className="loopvid__toggle small" onClick={toggle} aria-label={paused ? "Play the video" : "Pause the video"}>
        {paused ? "Play" : "Pause"}
      </button>
    </>
  );
}

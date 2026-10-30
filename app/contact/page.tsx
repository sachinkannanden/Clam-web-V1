"use client";
import { useState } from "react";
import LoopVideo from "@/components/ui/LoopVideo";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState(false);
  const mail = `mailto:hello@wearclam.in?subject=${encodeURIComponent(`Hello from ${name || "a calm person"}`)}&body=${encodeURIComponent(msg)}`;

  return (
    <div className="contact">
      <div className="contact__ph">
        <LoopVideo
          src="/video/breeze.mp4"
          poster="/video/breeze.webp"
          aria-label="A sheer curtain lifting in the breeze by an open window"
        />
      </div>
      <div className="contact__body">
        <h1 className="head" data-reveal>
          Say hello
        </h1>
        <p className="lead" data-reveal style={{ ["--i" as string]: 1 }}>
          We reply within a day or two. Slowly, but properly.
        </p>
        <ul className="contact__ways">
          <li data-reveal style={{ ["--i" as string]: 2 }}>
            <a className="link" href="mailto:hello@wearclam.in">
              hello@wearclam.in
            </a>
            <span>for orders, sizes and everything else</span>
          </li>
          <li data-reveal style={{ ["--i" as string]: 3 }}>
            <a className="link" href="https://wa.me/910000000000" rel="noopener">
              +91 00000 00000
            </a>
            <span>on WhatsApp, if you prefer typing with thumbs</span>
          </li>
          <li data-reveal style={{ ["--i" as string]: 4 }}>
            <a className="link" href="https://instagram.com/wearclam" rel="noopener">
              @wearclam
            </a>
            <span>on Instagram, for new drops and slow mornings</span>
          </li>
        </ul>
        <form
          className="contact__form"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            if (!msg.trim()) {
              setErr(true);
              (e.currentTarget.querySelector("textarea") as HTMLTextAreaElement)?.focus();
              return;
            }
            window.location.href = mail;
          }}
        >
          <label>
            <span>Your name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          </label>
          <label>
            <span>What's on your mind</span>
            <textarea
              value={msg}
              onChange={(e) => {
                setMsg(e.target.value);
                if (err) setErr(false);
              }}
              rows={5}
              required
              aria-invalid={err || undefined}
              aria-describedby="msg-err"
            />
          </label>
          <p id="msg-err" className="contact__err small" role="alert">
            {err ? "A blank email is very calm, but we'd love a word or two." : ""}
          </p>
          <button className="btn btn--ink" type="submit">
            Write the email
          </button>
          <p className="soft">Opens your email app with this filled in.</p>
        </form>
      </div>
    </div>
  );
}

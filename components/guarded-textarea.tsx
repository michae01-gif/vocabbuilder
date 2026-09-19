"use client";

import { useRef, type ClipboardEvent } from "react";

export default function GuardedTextarea({
  value,
  onChange,
  onPasteBlocked,
  placeholder,
  rows = 4,
  id,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  onPasteBlocked?: () => void;
  placeholder?: string;
  rows?: number;
  id?: string;
  className?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  function handlePaste(e: ClipboardEvent<HTMLTextAreaElement>) {
    e.preventDefault();
    onChange("");
    if (ref.current) ref.current.value = "";
    onPasteBlocked?.();
  }

  function handleDrop(e: React.DragEvent<HTMLTextAreaElement>) {
    if (e.dataTransfer.getData("text")) {
      e.preventDefault();
      onPasteBlocked?.();
    }
  }

  return (
    <textarea
      ref={ref}
      id={id}
      value={value}
      rows={rows}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onPaste={handlePaste}
      onDrop={handleDrop}
      className={
        className ??
        "w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-zinc-100 placeholder-zinc-600 outline-none transition-colors focus:border-amber-200/60"
      }
      autoComplete="off"
      spellCheck
    />
  );
}

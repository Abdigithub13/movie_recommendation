"use client";
import { useEffect } from "react";

export default function HtmlClassSetter({ className }: { className?: string }) {
  useEffect(() => {
    if (className) {
      document.documentElement.className = className;
    } else {
      document.documentElement.className = "";
    }
  }, [className]);
  return null;
}

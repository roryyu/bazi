'use client';

import { useEffect } from 'react';

export default function LLM() {
  useEffect(() => {
    window.location.href = '/llm/index.html';
  }, []);

  return null;
}

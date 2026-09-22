"use client";
import Link from "@/components/site-link";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="section error-page">
      <p className="eyebrow">EPA LAB</p>
      <h1>We couldn’t load this page.</h1>
      <p>Please try again in a moment.</p>
      <button className="button" onClick={reset}>
        Try again
      </button>
      <Link href="/">Return home</Link>
    </main>
  );
}

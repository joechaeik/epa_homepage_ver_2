import Link from "next/link";
export default function NotFound() {
  return (
    <main className="section error-page">
      <p className="eyebrow">404 · EPA LAB</p>
      <h1>This page couldn’t be found.</h1>
      <p>The page may have moved or is no longer available.</p>
      <Link className="button" href="/">
        Back to EPA Lab
      </Link>
    </main>
  );
}

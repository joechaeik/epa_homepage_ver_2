"use client";
import { useState } from "react";
import { Upload, FileText, Check, Copy, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import type { MediaItem, RecordItem } from "@/lib/content-model";
export type Asset = { url: string; name: string; alt: string; mime: string };
export default function MediaLibrary({
  media,
  records,
  onUploaded,
  onSelect,
  only,
}: {
  media: MediaItem[];
  records: RecordItem[];
  onUploaded: (m: MediaItem) => void;
  onSelect?: (a: Asset) => void;
  only?: "image" | "pdf";
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const supplied: Asset[] = [
    {
      url: "/images/main-01.jpg",
      name: "Stitch · 히어로 콘셉트 이미지",
      alt: "Concept image of a photoenergy laboratory",
      mime: "image/jpeg",
    },
    ...records
      .filter((r) => r.draft.image.startsWith("/images/"))
      .map((r) => ({
        url: r.draft.image,
        name: r.draft.title,
        alt: r.draft.imageAlt,
        mime: "image/jpeg",
      })),
  ];
  const all = [
    ...media.map((m) => ({
      url: m.url,
      name: m.name,
      alt: m.alt,
      mime: m.mime,
    })),
    ...supplied,
  ];
  const assets = all.filter(
    (a, i) =>
      all.findIndex((b) => b.url === a.url) === i &&
      (!only ||
        (only === "pdf"
          ? a.mime === "application/pdf"
          : a.mime.startsWith("image/"))),
  );
  return (
    <div className="media-library">
      <form
        className="upload-box"
        onSubmit={async (e) => {
          e.preventDefault();
          setError("");
          const form = e.currentTarget;
          const body = new FormData(form);
          const file = body.get("file");
          if (!(file instanceof File) || file.size === 0) {
            setError("업로드할 파일을 선택해 주세요.");
            return;
          }
          if (file.size > 10 * 1024 * 1024) {
            setError("파일은 10MB 이하로 선택해 주세요.");
            return;
          }
          setBusy(true);
          try {
            const response = await fetch("/api/admin/upload", {
              method: "POST",
              body,
            });
            const result = (await response.json()) as MediaItem & {
              error?: string;
            };
            if (!response.ok) throw new Error(result.error);
            onUploaded(result);
            form.reset();
            toast.success("파일을 업로드했습니다.");
          } catch (err) {
            setError(
              err instanceof Error ? err.message : "업로드하지 못했습니다.",
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="upload-heading">
          <ImagePlus size={24} />
          <div>
            <strong>사진 또는 PDF 추가</strong>
            <p>JPG, PNG, WebP, PDF · 최대 10MB</p>
          </div>
        </div>
        <label htmlFor="media-file" className="sr-only">
          업로드할 파일
        </label>
        <input
          id="media-file"
          name="file"
          type="file"
          required
          accept="image/jpeg,image/png,image/webp,application/pdf"
        />
        <label htmlFor="media-alt">이미지 설명</label>
        <input
          id="media-alt"
          name="alt"
          type="text"
          maxLength={500}
          placeholder="예: 2025년 연구실 세미나 단체 사진"
        />
        <div className="upload-bottom">
          <small>실제 연구실 사진과 공개 가능한 논문 파일을 선택하세요.</small>
          <button disabled={busy} className="button small" type="submit">
            <Upload size={16} />
            {busy ? "업로드 중…" : "업로드"}
          </button>
        </div>
        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : null}
      </form>
      <p className="media-count">
        {assets.length}개 파일{onSelect ? " · 사용할 파일을 선택하세요." : ""}
      </p>
      <div className="media-grid">
        {assets.map((a) => (
          <button
            className="media-item"
            key={a.url}
            onClick={async () => {
              if (onSelect) {
                onSelect(a);
                return;
              }
              try {
                await navigator.clipboard.writeText(a.url);
                setCopied(a.url);
                toast.success("파일 주소를 복사했습니다.");
              } catch {
                setError("주소 복사를 지원하지 않는 브라우저입니다.");
              }
            }}
          >
            {a.mime.startsWith("image/") ? (
              <img src={a.url} alt={a.alt || a.name} loading="lazy" />
            ) : (
              <span className="pdf-tile">
                <FileText size={36} />
                PDF
              </span>
            )}
            <span>
              <strong>{a.name}</strong>
              {onSelect ? (
                <Check size={15} />
              ) : copied === a.url ? (
                <Check size={15} />
              ) : (
                <Copy size={15} />
              )}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

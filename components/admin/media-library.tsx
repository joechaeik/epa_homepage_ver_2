"use client";
import { useState } from "react";
import { Upload, FileText, Check, Copy, ImagePlus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { MediaItem, RecordItem, SettingsItem } from "@/lib/content-model";
import { mediaCategories, mediaIsUsed, mediaUsage, type MediaCategory } from "@/lib/media-usage";
export type Asset = { url: string; name: string; alt: string; mime: string };
export default function MediaLibrary({
  media,
  records,
  settings,
  onUploaded,
  onDeleted,
  onSelect,
  only,
  uploadsEnabled,
}: {
  media: MediaItem[];
  records: RecordItem[];
  settings: SettingsItem;
  onUploaded: (m: MediaItem) => void;
  onDeleted?: (id: string) => void;
  onSelect?: (a: Asset) => void;
  only?: "image" | "pdf";
  uploadsEnabled: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [category, setCategory] = useState<MediaCategory>("all");
  const [query, setQuery] = useState("");
  const [deleting, setDeleting] = useState("");
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
      id: m.id,
      url: m.url,
      name: m.name,
      alt: m.alt,
      mime: m.mime,
      categories: mediaUsage(m, records, settings),
      used: mediaIsUsed(m, records, settings),
    })),
    ...supplied.map((asset) => ({ ...asset, id: "", categories: mediaUsage(asset, records, settings), used: true })),
  ];
  const uniqueAssets = all.filter(
    (a, i) =>
      all.findIndex((b) => b.url === a.url) === i &&
      (!only ||
        (only === "pdf"
          ? a.mime === "application/pdf"
          : a.mime.startsWith("image/"))),
  );
  const assets = uniqueAssets.filter((asset) =>
    (category === "all" || asset.categories.includes(category)) &&
    `${asset.name} ${asset.alt}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
  );
  async function deleteAsset(asset: (typeof all)[number]) {
    if (!asset.id || !onDeleted || asset.used) return;
    if (!window.confirm(`“${asset.name}” 파일을 완전히 삭제할까요? 삭제 후에는 복구할 수 없습니다.`)) return;
    setDeleting(asset.id);
    setError("");
    try {
      const response = await fetch(`/api/admin/media/${asset.id}`, { method: "DELETE" });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "파일을 삭제하지 못했습니다.");
      onDeleted(asset.id);
      toast.success("파일을 삭제했습니다.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "파일을 삭제하지 못했습니다.");
    } finally {
      setDeleting("");
    }
  }
  return (
    <div className="media-library">
      {uploadsEnabled ? <form
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
      </form> : <div className="upload-box" role="status">
        <strong>새 파일 업로드는 준비 중입니다.</strong>
        <p>아래 기존 사진을 선택하거나 편집 화면에서 외부 이미지·PDF 주소를 입력할 수 있습니다.</p>
      </div>}
      <div className="media-toolbar">
        <div className="media-filters" aria-label="미디어 용도 필터">
          {mediaCategories.map((item) => {
            const count = uniqueAssets.filter((asset) => item.id === "all" || asset.categories.includes(item.id)).length;
            return <button type="button" key={item.id} className={category === item.id ? "media-filter active" : "media-filter"} aria-pressed={category === item.id} onClick={() => setCategory(item.id)}>
              {item.label} <span>{count}</span>
            </button>;
          })}
        </div>
        <label className="media-search">
          <Search size={16} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="파일 이름·설명 검색" aria-label="미디어 검색" />
        </label>
      </div>
      <p className="media-count">{assets.length}개 파일{onSelect ? " · 사용할 파일을 선택하세요." : ""}</p>
      {!onSelect && onDeleted ? <p className="media-help">업로드한 파일만 삭제할 수 있습니다. 사용 중인 파일은 연결된 콘텐츠에서 먼저 교체해 주세요.</p> : null}
      <div className="media-grid">
        {assets.map((a) => (
          <div className="media-item" key={a.url}>
          <button type="button" className="media-item-main" onClick={async () => {
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
            }}>
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
          {!onSelect ? <div className="media-item-actions">
            <span>{!a.id ? "기본 이미지" : a.used ? "사용 중" : "미사용"}</span>
            {a.id && onDeleted ? <button type="button" className="media-delete" title={a.used ? "사용 중인 파일은 삭제할 수 없습니다" : "파일 삭제"} aria-label={`${a.name} 삭제`} disabled={a.used || deleting === a.id} onClick={() => deleteAsset(a)}><Trash2 size={16} /></button> : null}
          </div> : null}
          </div>
        ))}
      </div>
      {assets.length === 0 ? <p className="media-empty">조건에 맞는 파일이 없습니다.</p> : null}
    </div>
  );
}

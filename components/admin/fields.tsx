"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { Entry, Kind } from "@/lib/content-model";
export const categories: Record<Kind, string[]> = {
  publications: ["Journal article", "Review", "Perspective", "Patent", "In press"],
  news: ["Research", "Awards", "Lab life", "Media", "Events"],
  people: [
    "Principal investigator",
    "Researchers",
    "Graduate students",
    "Alumni",
    "Visitors",
  ],
  research: ["Water", "Solar energy", "Air", "Redox chemistry"],
  photos: ["Lab life", "Seminars", "Awards", "Field work"],
  positions: [
    "Graduate research",
    "Postdoctoral research",
    "Visiting researcher",
    "Collaboration",
  ],
};
type Field = {
  key: keyof Entry;
  label: string;
  type?: "textarea" | "number" | "date" | "email" | "image" | "pdf";
  hint?: string;
};
export const fields: Record<Kind, Field[]> = {
  publications: [
    { key: "title", label: "논문 제목 *" },
    { key: "authors", label: "저자 *", hint: "쉼표로 구분해 입력하세요." },
    { key: "journal", label: "학술지 *" },
    { key: "year", label: "발행 연도", type: "number" },
    { key: "date", label: "게재일", type: "date", hint: "게재일순으로 표시됩니다. 날짜 미정인 In press 논문은 분류를 'In press'로 선택하고 비워 두세요. 목록 맨 위에 표시됩니다." },
    { key: "citation", label: "권·호·페이지 / 서지 정보" },
    { key: "doi", label: "DOI", hint: "예: 10.1002/adfm.202600082" },
    { key: "summary", label: "연구 요약", type: "textarea" },
    { key: "pdf", label: "논문 PDF", type: "pdf" },
    { key: "tags", label: "연구 키워드", hint: "쉼표로 구분해 입력하세요." },
  ],
  news: [
    { key: "title", label: "뉴스 제목 *" },
    { key: "date", label: "소식 날짜", type: "date" },
    { key: "summary", label: "짧은 소개", type: "textarea" },
    {
      key: "body",
      label: "본문",
      type: "textarea",
      hint: "빈 줄을 넣으면 문단이 나뉩니다.",
    },
    { key: "image", label: "대표 이미지", type: "image" },
    { key: "imageAlt", label: "이미지 설명" },
    { key: "link", label: "관련 링크" },
  ],
  people: [
    { key: "title", label: "이름 *" },
    { key: "role", label: "직위 / 과정" },
    { key: "image", label: "프로필 사진", type: "image" },
    { key: "imageAlt", label: "사진 설명" },
    { key: "email", label: "이메일", type: "email" },
    { key: "summary", label: "연구 분야 / 짧은 소개", type: "textarea" },
    { key: "body", label: "상세 소개", type: "textarea" },
    { key: "link", label: "프로필 / ORCID 링크" },
  ],
  research: [
    { key: "title", label: "연구 분야 제목 *" },
    { key: "summary", label: "한 줄 소개", type: "textarea" },
    { key: "body", label: "연구 설명", type: "textarea" },
    { key: "image", label: "연구 이미지", type: "image" },
    { key: "imageAlt", label: "이미지 설명" },
    { key: "tags", label: "키워드", hint: "쉼표로 구분해 입력하세요." },
  ],
  photos: [
    { key: "title", label: "사진 제목 *" },
    { key: "image", label: "사진 *", type: "image" },
    { key: "imageAlt", label: "사진 설명 *" },
    { key: "year", label: "촬영 연도", type: "number" },
    { key: "summary", label: "추가 설명", type: "textarea" },
  ],
  positions: [
    { key: "title", label: "모집 제목 *" },
    { key: "summary", label: "모집 요약", type: "textarea" },
    { key: "body", label: "모집 조건과 지원 안내", type: "textarea" },
    { key: "link", label: "지원 / 자세한 안내 링크" },
  ],
};
export function Choice({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  label: string;
}) {
  return (
    <Select
      value={value || "none"}
      onValueChange={(v) => onChange(v === "none" ? "" : v)}
    >
      <SelectTrigger aria-label={label} className="admin-select">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
export function EntryFields({
  kind,
  data,
  setData,
  onPick,
}: {
  kind: Kind;
  data: Entry;
  setData: (d: Entry) => void;
  onPick: (key: "image" | "pdf") => void;
}) {
  return (
    <>
      <div className="form-field">
        <label>분류</label>
        <Choice
          value={data.category}
          onChange={(v) => setData({ ...data, category: v })}
          label="분류"
          options={[
            { value: "none", label: "분류 없음" },
            ...Array.from(
              new Set([
                ...categories[kind],
                ...(data.category ? [data.category] : []),
              ]),
            ).map((c) => ({ value: c, label: c })),
          ]}
        />
      </div>
      {fields[kind].map((f) => (
        <div className="form-field" key={f.key}>
          <label htmlFor={"edit-" + f.key}>{f.label}</label>
          {f.type === "textarea" ? (
            <textarea
              id={"edit-" + f.key}
              rows={f.key === "body" ? 9 : 3}
              value={String(data[f.key])}
              onChange={(e) => setData({ ...data, [f.key]: e.target.value })}
            />
          ) : f.type === "image" || f.type === "pdf" ? (
            <>
              <div className="asset-input">
                <input
                  id={"edit-" + f.key}
                  value={String(data[f.key])}
                  placeholder={
                    f.type === "image"
                      ? "이미지 선택 또는 https 주소"
                      : "PDF 선택 또는 https 주소"
                  }
                  onChange={(e) =>
                    setData({ ...data, [f.key]: e.target.value })
                  }
                />
                <button
                  type="button"
                  className="button outline small"
                  onClick={() => onPick(f.key as "image" | "pdf")}
                >
                  선택
                </button>
              </div>
              {f.type === "image" && data.image ? (
                <img
                  className="editor-image"
                  src={data.image}
                  alt={data.imageAlt || "선택한 이미지 미리보기"}
                />
              ) : null}
            </>
          ) : (
            <input
              id={"edit-" + f.key}
              type={f.type || "text"}
              value={String(data[f.key])}
              onChange={(e) =>
                setData({
                  ...data,
                  [f.key]:
                    f.type === "number"
                      ? Number(e.target.value)
                      : e.target.value,
                })
              }
            />
          )}{" "}
          {f.hint ? <small>{f.hint}</small> : null}
        </div>
      ))}
      <div className="form-field">
        <label htmlFor="edit-source">자료 출처 링크</label>
        <input
          id="edit-source"
          value={data.source}
          onChange={(e) => setData({ ...data, source: e.target.value })}
        />
      </div>
      {["news", "photos"].includes(kind) ? (
        <div className="editor-options">
          <div>
            <label htmlFor="edit-featured">홈에 우선 노출</label>
            <p>홈에 표시할 뉴스·사진을 우선 선택합니다.</p>
          </div>
          <Switch
            id="edit-featured"
            checked={data.featured}
            onCheckedChange={(v) => setData({ ...data, featured: v })}
          />
        </div>
      ) : null}
      {kind !== "publications" ? <div className="form-field">
        <label htmlFor="edit-order">표시 순서</label>
        <input
          id="edit-order"
          type="number"
          min={0}
          max={99999}
          value={data.sortOrder}
          onChange={(e) =>
            setData({ ...data, sortOrder: Number(e.target.value) })
          }
        />
        <small>
          작은 숫자가 먼저 표시됩니다. 뉴스는 날짜순으로 정렬됩니다.
        </small>
      </div> : null}
    </>
  );
}

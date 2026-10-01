"use client";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { kindLabels, type Entry, type Kind } from "@/lib/content-model";
import ResearchTocEditor, { type TocPublicationOption } from "./research-toc-editor";
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
  research: ["Water", "Solar energy", "Air", "Electrochemical", "Redox chemistry"],
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
    { key: "date", label: "게재일", type: "date" },
    { key: "releaseDate", label: "발행일", type: "date" },
    { key: "citation", label: "권·호·페이지 / 서지 정보" },
    { key: "doi", label: "DOI", hint: "예: 10.1002/adfm.202600082" },
    { key: "summary", label: "연구 요약", type: "textarea" },
    { key: "pdf", label: "논문 PDF", type: "pdf" },
    { key: "image", label: "TOC·대표 figure", type: "image", hint: "연구 분야의 TOC 그래픽에 사용됩니다. 원본 비율을 유지해 표시하며, DOI가 있어야 클릭 연결됩니다." },
    { key: "imageAlt", label: "TOC·figure 이미지 설명" },
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
    { key: "body", label: "상세 소개", type: "textarea", hint: "교수님 소개는 빈 줄로 문단을 나눌 수 있습니다. 본문 링크는 [논문 보기](https://doi.org/...)처럼 입력하면 새 탭으로 열립니다. 링크 주소는 http 또는 https를 사용하세요." },
    { key: "link", label: "프로필 / ORCID 링크" },
  ],
  research: [
    { key: "title", label: "연구 분야 제목 *" },
    { key: "summary", label: "한 줄 소개", type: "textarea" },
    { key: "body", label: "연구 설명 · Research 첫 화면", type: "textarea", hint: "분야의 문제와 접근을 짧게 소개하세요. 빈 줄로 문단을 나누고, [논문 보기](https://doi.org/...)처럼 입력하면 링크가 새 탭으로 열립니다." },
    { key: "researchDetails", label: "상세 연구 설명 · Explore this research", type: "textarea", hint: "논문별 연구 내용·결과·의미를 입력하세요. [링크 문구](https://doi.org/...) 형식을 지원합니다. 비워두면 첫 화면의 연구 설명을 표시합니다." },
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
  sortDirection,
  publicationOptions = [],
}: {
  kind: Kind;
  data: Entry;
  setData: (d: Entry) => void;
  onPick: (key: "image" | "pdf") => void;
  sortDirection?: "asc" | "desc";
  publicationOptions?: TocPublicationOption[];
}) {
  const [publicationQuery, setPublicationQuery] = useState("");
  const selectedPublicationIds = data.relatedPublicationIds ?? [];
  const selectedPublicationOptions = publicationOptions
    .filter(p => selectedPublicationIds.includes(p.id))
    .sort((a, b) => selectedPublicationIds.indexOf(a.id) - selectedPublicationIds.indexOf(b.id));
  const publicationSearchResults = publicationQuery.trim() ? publicationOptions.filter(p =>
    !selectedPublicationIds.includes(p.id) && `${p.title} ${p.year}`.toLowerCase().includes(publicationQuery.trim().toLowerCase())
  ).slice(0, 12) : [];
  function movePublication(index: number, offset: number) {
    const next = [...selectedPublicationIds];
    const target = index + offset;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setData({ ...data, relatedPublicationIds: next });
  }
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
              rows={f.key === "body" || f.key === "researchDetails" ? 9 : 3}
              value={String(data[f.key] ?? "")}
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
              value={String(data[f.key] ?? "")}
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
          {kind === "publications" && f.key === "releaseDate" ? (
            <fieldset className="publication-date-choice">
              <legend>논문 정렬 기준</legend>
              <div className="publication-date-options">
                <label>
                  <input
                    type="radio"
                    name="publication-sort-by"
                    value="date"
                    checked={(data.publicationSortBy ?? "date") === "date"}
                    onChange={() => setData({ ...data, publicationSortBy: "date" })}
                  />
                  게재일 기준
                </label>
                <label>
                  <input
                    type="radio"
                    name="publication-sort-by"
                    value="releaseDate"
                    checked={data.publicationSortBy === "releaseDate"}
                    onChange={() => setData({ ...data, publicationSortBy: "releaseDate" })}
                  />
                  발행일 기준
                </label>
              </div>
              <small>선택한 날짜로 논문을 정렬합니다. 날짜가 없는 In press 논문은 목록 맨 위에 표시됩니다.</small>
            </fieldset>
          ) : null}
        </div>
      ))}
      {kind === "research" ? <div className="form-field">
        <label htmlFor="related-publication-search">관련 논문</label>
        <small>선택한 순서대로 연구 분야 상세페이지에 표시됩니다. 논문 제목은 DOI 원문으로 연결됩니다.</small>
        {selectedPublicationOptions.length ? <div className="related-publication-picker selected-publications">
          {selectedPublicationOptions.map((p, index) => <div className="related-publication-choice" key={p.id}>
            <span>{index + 1}. {p.title} <small>({p.year})</small></span>
            <div><button type="button" disabled={index === 0} onClick={() => movePublication(index, -1)}>위로</button><button type="button" disabled={index === selectedPublicationOptions.length - 1} onClick={() => movePublication(index, 1)}>아래로</button><button type="button" onClick={() => setData({ ...data, relatedPublicationIds: selectedPublicationIds.filter(id => id !== p.id), tocPublicationIds: (data.tocPublicationIds ?? []).filter(id => id !== p.id) })}>제거</button></div>
          </div>)}
        </div> : null}
        <input id="related-publication-search" value={publicationQuery} onChange={e => setPublicationQuery(e.target.value)} placeholder="논문 제목 또는 연도 검색" />
        {publicationSearchResults.length ? <div className="related-publication-picker">
          {publicationSearchResults.map(p => <label key={p.id}>
            <input type="checkbox" checked={false} disabled={selectedPublicationIds.length >= 30} onChange={() => setData({ ...data, relatedPublicationIds: [...selectedPublicationIds, p.id] })} />
            <span>{p.title} <small>({p.year})</small></span>
          </label>)}
        </div> : null}
      </div> : null}
      {kind === "research" ? <ResearchTocEditor data={data} setData={setData} publications={publicationOptions} /> : null}
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
      <div className="form-field">
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
          {["people", "news", "photos", "publications"].includes(kind)
            ? `${kind === "publications" ? "날짜가 같은 논문 사이에서 적용됩니다. " : ""}현재 정렬: ${sortDirection === "desc" ? "큰 숫자 먼저" : "작은 숫자 먼저"}. ${kindLabels[kind]} 목록에서 변경할 수 있습니다.`
            : "작은 숫자가 먼저 표시됩니다."}
        </small>
      </div>
    </>
  );
}

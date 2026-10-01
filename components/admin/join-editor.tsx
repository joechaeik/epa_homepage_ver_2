"use client";
import type { Settings } from "@/lib/content-model";
import type { JoinContent } from "@/lib/join-content";
import { Save, Check } from "lucide-react";
type ListKey = "benefits" | "paths" | "steps" | "faqs" | "englishScores" | "environment" | "alumni";
type Item = JoinContent["paths"][number];
type TextKey = Exclude<keyof JoinContent, ListKey>;
function Field({ id, label, value, onChange, multiline = false }: { id: string; label: string; value: string; onChange: (value: string) => void; multiline?: boolean }) {
  return <div className="form-field"><label htmlFor={id}>{label}</label>{multiline ? <textarea id={id} rows={4} value={value} onChange={e => onChange(e.target.value)} /> : <input id={id} value={value} onChange={e => onChange(e.target.value)} />}</div>;
}
const lists: { key: ListKey; title: string; fields: (keyof Item)[]; limit: number }[] = [
  { key: "benefits", title: "핵심 지원 안내 카드", fields: ["title", "summary", "link", "linkText"], limit: 6 },
  { key: "paths", title: "지원 경로 카드", fields: ["title", "summary", "checklist", "body", "link", "linkText"], limit: 6 },
  { key: "englishScores", title: "영어 성적 기준 표", fields: ["title", "summary"], limit: 10 },
  { key: "environment", title: "연구 환경·장비 카드", fields: ["title", "summary", "link", "linkText"], limit: 6 },
  { key: "alumni", title: "동문 진로 사례 카드", fields: ["title", "summary", "link", "linkText"], limit: 6 },
  { key: "steps", title: "문의 준비 단계", fields: ["title", "summary", "link", "linkText"], limit: 6 },
  { key: "faqs", title: "자주 묻는 질문", fields: ["title", "body", "link", "linkText"], limit: 12 },
];
const labels: Record<keyof Item, string> = { title: "제목 / 질문", summary: "짧은 소개", checklist: "준비 자료 (한 줄에 한 항목)", body: "상세 안내 / 답변 (빈 줄로 문단 구분)", link: "연결 주소", linkText: "링크 문구" };
export default function JoinEditor({ value, onChange, onPick, onSave, busy }: { value: Settings; onChange: (value: Settings) => void; onPick: () => void; onSave: (intent: "draft" | "publish") => void; busy: boolean }) {
  const content = value.joinContent;
  function change(next: JoinContent) { onChange({ ...value, joinContent: next }); }
  function move(key: ListKey, index: number, offset: number) {
    const items = [...content[key]];
    [items[index], items[index + offset]] = [items[index + offset], items[index]];
    change({ ...content, [key]: items });
  }
  const sections: { title: string; fields: [TextKey, string][] }[] = [
    { title: "페이지 소개·사진", fields: [["eyebrow", "상단 문구"], ["title", "소개 제목"], ["intro", "연구실 소개"], ["photo", "소개 사진 URL"], ["photoAlt", "사진 설명"]] },
    { title: "영역 제목·안내", fields: [["benefitsTitle", "핵심 지원 안내 제목"], ["pathsTitle", "지원 경로 제목"], ["pathsIntro", "지원 경로 소개"], ["pathsNote", "모집·입학·지원 조건 안내"], ["detailsLabel", "상세 안내 펼치기 문구"], ["checklistTitle", "준비 자료 제목"], ["stepsTitle", "문의 단계 제목"], ["stepsIntro", "문의 단계 소개"], ["positionsTitle", "개별 모집 공고 제목"]] },
    { title: "영어 성적 기준·공식 입학 안내", fields: [["englishTitle", "영어 기준 제목"], ["englishIntro", "영어 기준 소개"], ["englishTestLabel", "표의 시험명 열 제목"], ["englishScoreLabel", "표의 기준 성적 열 제목"], ["englishNote", "유효기간·면제·적용 대상 안내"], ["englishLink", "공식 모집요강 링크"], ["englishLinkText", "모집요강 링크 문구"]] },
    { title: "연구 환경·동문 진로 안내", fields: [["environmentTitle", "연구 환경 제목"], ["environmentIntro", "연구 환경 소개"], ["environmentNote", "장비 이용·연구 지원 안내"], ["alumniTitle", "동문 진로 제목"], ["alumniIntro", "동문 진로 소개"], ["alumniNote", "동문 정보 출처·기준 안내"]] },
    { title: "문의·FAQ", fields: [["inquiryTitle", "문의 영역 제목"], ["inquiryIntro", "문의 소개"], ["inquiryNote", "문의 전 안내"], ["faqTitle", "FAQ 제목"]] },
  ];
  return <section className="admin-panel settings-group join-admin-editor">
    <h2>Join Our Lab 페이지 편집</h2><p>교수님 검토 후 문구·준비 자료·지원 조건을 수정하세요. 영어 기준은 해당 지원 시기의 KENTECH 공식 모집요강을 확인하여 갱신하세요. 동문 진로는 확인된 사례와 출처를 입력하세요. 확정된 모집 공고는 아래 목록에서 별도로 관리합니다. 영문 공개 페이지에 표시할 내용을 입력하세요.</p>
    {sections.map(section => <details key={section.title} open={section.title === "페이지 소개·사진"}><summary>{section.title}</summary>{section.fields.map(([key, label]) => <Field key={key} id={`join-${key}`} label={label} value={content[key]} multiline={!key.toLowerCase().includes("photo") && key !== "eyebrow" && key !== "detailsLabel"} onChange={text => change({ ...content, [key]: text })} />)}{section.title === "페이지 소개·사진" ? <><p>사진을 지정하지 않으면 기존 Research 히어로 사진을 사용합니다. Hero 자체는 Hero·사이트 설정에서 변경하세요.</p><button type="button" className="button outline small" onClick={onPick}>미디어 보관함에서 소개 사진 선택</button></> : null}</details>)}
    {lists.map(({ key, title, fields, limit }) => <details key={key}><summary>{title} ({content[key].length})</summary>{content[key].map((card, index) => <div className="join-admin-card" key={index}><h3>{index + 1}. {card.title || "새 항목"}</h3>{fields.map(field => <Field key={field} id={`join-${key}-${index}-${field}`} label={key === "englishScores" ? field === "title" ? "시험명" : "기준 성적" : labels[field]} value={card[field]} multiline={key !== "englishScores" && ["summary", "body", "checklist"].includes(field)} onChange={text => change({ ...content, [key]: content[key].map((item, i) => i === index ? { ...item, [field]: text } : item) })} />)}<div className="settings-table-actions"><button type="button" disabled={index === 0} onClick={() => move(key, index, -1)}>위로</button><button type="button" disabled={index === content[key].length - 1} onClick={() => move(key, index, 1)}>아래로</button><button type="button" onClick={() => change({ ...content, [key]: content[key].filter((_, i) => i !== index) })}>삭제</button></div></div>)}<button className="button outline small" type="button" disabled={content[key].length >= limit} onClick={() => change({ ...content, [key]: [...content[key], { title: "", summary: "", body: "", checklist: "", link: "", linkText: "" }] })}>항목 추가</button></details>)}
    <div className="settings-actions"><button className="button outline small" type="button" disabled={busy} onClick={() => onSave("draft")}><Save size={15} />모집 페이지 초안 저장</button><button className="button small" type="button" disabled={busy} onClick={() => onSave("publish")}><Check size={15} />모집 페이지 공개 반영</button><a className="text-link" href="/admin/preview?page=join" target="_blank" rel="noreferrer">저장한 초안 보기 ↗</a></div>
  </section>;
}

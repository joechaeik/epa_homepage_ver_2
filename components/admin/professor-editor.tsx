"use client";
import { Save, Check } from "lucide-react";
import type { Settings } from "@/lib/content-model";
type CareerListKey = "professorEducation" | "professorCareer" | "professorAwards";
export default function ProfessorEditor({ value, onChange, onPick, onSave, busy }: {
  value: Settings; onChange: (v: Settings) => void; onPick: (language: "en" | "kor") => void;
  onSave: (intent: "draft" | "publish") => void; busy: boolean;
}) {
  function updateCareer(key: CareerListKey, index: number, field: "period" | "title" | "detail", text: string) {
    onChange({ ...value, [key]: value[key].map((item, i) => i === index ? { ...item, [field]: text } : item) });
  }
  function removeCareer(key: CareerListKey, index: number) {
    onChange({ ...value, [key]: value[key].filter((_, i) => i !== index) });
  }
  function moveItem(key: CareerListKey, index: number, offset: number) {
    const items = [...value[key]], next = index + offset;
    if (next < 0 || next >= items.length) return;
    [items[index], items[next]] = [items[next], items[index]];
    onChange({ ...value, [key]: items });
  }
  return <div className="settings-page professor-editor"><div className="settings-form">
        <section className="admin-panel settings-group">
          <h2>교수 프로필 링크</h2>
          <p>Web of Science·Google Scholar와 영문·국문 CV를 관리합니다. 연락처와 ORCID는 구성원 메뉴의 교수 프로필에서 수정합니다.</p>
          <div className="form-field"><label htmlFor="professor-wos-url">Web of Science URL</label><input id="professor-wos-url" value={value.professorWosUrl} onChange={e => onChange({ ...value, professorWosUrl: e.target.value })} /></div>
          <div className="form-field"><label htmlFor="professor-scholar-url">Google Scholar URL</label><input id="professor-scholar-url" value={value.professorScholarUrl} onChange={e => onChange({ ...value, professorScholarUrl: e.target.value })} /></div>
          {([ ["professorCvUrl", "en", "영문 CV (EN)"], ["professorCvKorUrl", "kor", "국문 CV (KOR)"] ] as const).map(([key, language, label]) => <div key={key}>
            <div className="form-field"><label htmlFor={`professor-cv-${language}`}>{label} PDF URL</label><input id={`professor-cv-${language}`} value={value[key]} onChange={e => onChange({ ...value, [key]: e.target.value })} /></div>
            <div className="settings-repeat-controls"><button className="button outline small" type="button" onClick={() => onPick(language)}>미디어 보관함에서 {label} 선택</button><button className="button outline small" type="button" onClick={() => onChange({ ...value, [key]: "" })}>{label} 링크 비우기</button></div>
          </div>)}
        </section>
        <section className="admin-panel settings-group">
          <h2>교수 성과</h2>
          <p>People 페이지의 학력·경력·수상을 행 단위로 관리합니다. 행을 추가하고 위·아래 버튼으로 순서를 바꿀 수 있습니다.</p>
          {([
            ["professorAchievementsEyebrow", "성과 영역 상단 문구"],
            ["professorAchievementsTitle", "성과 영역 제목 (Academic career & recognition)"],
            ["professorAchievementsDescription", "성과 영역 소개"],
            ["professorEducationHeading", "학력 제목"],
            ["professorCareerHeading", "경력 제목"],
            ["professorAwardsHeading", "수상 제목"],
          ] as const).map(([key, label]) => <div className="form-field" key={key}><label htmlFor={`setting-${key}`}>{label}</label><input id={`setting-${key}`} value={value[key]} onChange={e => onChange({ ...value, [key]: e.target.value })} /></div>)}
          {([ ["professorEducation", "학력"], ["professorCareer", "주요 경력"], ["professorAwards", "수상·선정" ] ] as const).map(([key, title]) => <div className="settings-career-list" key={key}>
            <h3>{title}</h3>
            <div className="settings-table-wrap"><table className="settings-career-table"><thead><tr><th scope="col">연도·기간</th><th scope="col">제목</th><th scope="col">기관·설명</th><th scope="col">순서·관리</th></tr></thead><tbody>
              {value[key].map((item, index) => <tr key={index}>
                {([ ["period", "연도·기간"], ["title", "제목"], ["detail", "기관·설명"] ] as const).map(([field, label]) => <td key={field}><label className="sr-only" htmlFor={`${key}-${index}-${field}`}>{title} {index + 1}행 {label}</label><input id={`${key}-${index}-${field}`} value={item[field]} onChange={e => updateCareer(key, index, field, e.target.value)} /></td>)}
                <td><div className="settings-table-actions"><button type="button" disabled={index === 0} onClick={() => moveItem(key, index, -1)}>↑</button><button type="button" disabled={index === value[key].length - 1} onClick={() => moveItem(key, index, 1)}>↓</button><button type="button" onClick={() => removeCareer(key, index)}>삭제</button></div></td>
              </tr>)}
            </tbody></table></div>
            <button className="button outline small" type="button" disabled={value[key].length >= (key === "professorEducation" ? 15 : key === "professorCareer" ? 30 : 60)} onClick={() => onChange({ ...value, [key]: [...value[key], { period: "", title: "", detail: "" }] })}>행 추가</button>
          </div>)}
          <div className="settings-actions">
            <button className="button outline small" type="button" disabled={busy} onClick={() => onSave("draft")}><Save size={15} />교수 프로필·성과 초안 저장</button>
            <button className="button small" type="button" disabled={busy} onClick={() => onSave("publish")}><Check size={15} />교수 프로필·성과 공개 반영</button>
            <a className="text-link" href="/admin/preview?page=people" target="_blank" rel="noreferrer">저장한 초안 보기 ↗</a>
          </div>
        </section>
  </div></div>;
}

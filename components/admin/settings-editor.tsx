"use client";
import { Save, Check } from "lucide-react";
import HeroEditor, { type HeroPicker } from "./hero-editor";
import type { SettingsScope } from "@/lib/heroes";
import type { Settings } from "@/lib/content-model";
type CareerListKey = "professorEducation" | "professorCareer" | "professorAwards";
type Field = { key: keyof Settings; label: string; area?: boolean };
const groups: { title: string; description: string; fields: Field[] }[] = [
  {
    title: "Home 연구 성과",
    description: "논문 수는 공개 논문 목록에서 자동 계산됩니다. 이곳의 수치와 문구는 직접 관리합니다.",
    fields: [
      { key: "homeResearchHighlightTitle", label: "대표 연구 제목" },
      { key: "homeResearchHighlightBody", label: "대표 연구 소개", area: true },
      { key: "homeHIndex", label: "H-index 값" },
      { key: "homeHIndexNote", label: "H-index 설명·출처" },
      { key: "homeHcrYears", label: "Highly Cited Researcher 기간" },
      { key: "homeFacilitiesUrl", label: "KENTECH 연구 인프라 링크" },
      { key: "alumniHeading", label: "동문 진로 영역 제목" },
    ],
  },
  {
    title: "연구실 소개",
    description: "홈 중간의 소개와 영상 링크입니다.",
    fields: [
      { key: "introImage", label: "소개 이미지 주소" },
      { key: "introImageAlt", label: "소개 이미지 설명" },
      { key: "introTitle", label: "소개 제목", area: true },
      { key: "introBody", label: "소개 내용", area: true },
      { key: "videoUrl", label: "연구실 영상 링크" },
    ],
  },
  {
    title: "참여 안내",
    description: "페이지 하단의 Join us 안내입니다.",
    fields: [
      { key: "recruitmentTitle", label: "참여 안내 제목", area: true },
      { key: "recruitmentBody", label: "참여 안내 문장", area: true },
    ],
  },
  {
    title: "기본 정보·연락처",
    description: "푸터와 문의 페이지에 함께 반영됩니다.",
    fields: [
      { key: "labName", label: "연구실 짧은 이름" },
      { key: "labFullName", label: "연구실 전체 이름" },
      { key: "institution", label: "소속 기관" },
      { key: "email", label: "연락 이메일" },
      { key: "phone", label: "연락 전화" },
      { key: "address", label: "주소", area: true },
      { key: "mapEmbedUrl", label: "Google Map Embed URL (선택)" },
    ],
  },
];
export default function SettingsEditor({
  value,
  onChange,
  onPick,
  onSave,
  busy,
  dirty,
}: {
  value: Settings;
  onChange: (v: Settings) => void;
  onPick: (target: HeroPicker | "intro" | "professorCv" | `alumni:${number}`) => void;
  onSave: (intent: "draft" | "publish", scope: SettingsScope) => void;
  busy: boolean;
  dirty: boolean;
}) {
  function updateCareer(key: CareerListKey, index: number, field: "period" | "title" | "detail", text: string) {
    onChange({ ...value, [key]: value[key].map((item, i) => i === index ? { ...item, [field]: text } : item) });
  }
  function removeCareer(key: CareerListKey, index: number) {
    onChange({ ...value, [key]: value[key].filter((_, i) => i !== index) });
  }
  function moveItem(key: CareerListKey | "alumniDestinations", index: number, offset: number) {
    const items = [...value[key]];
    const next = index + offset;
    if (next < 0 || next >= items.length) return;
    [items[index], items[next]] = [items[next], items[index]];
    onChange({ ...value, [key]: items });
  }
  return (
    <div className="settings-page">
      <HeroEditor value={value} onChange={onChange} onPick={onPick} onSave={onSave} busy={busy} />
      <div className="settings-layout">
      <div className="settings-form">
        {groups.map((g) => (
          <section className="admin-panel settings-group" key={g.title}>
            <h2>{g.title}</h2>
            <p>{g.description}</p>
            {g.title === "연구실 소개" ? (
              <button
                className="button outline small"
                onClick={() => onPick("intro")}
              >
                소개 이미지 선택
              </button>
            ) : null}
            {g.fields.map((f) => (
              <div className="form-field" key={f.key}>
                <label htmlFor={"setting-" + f.key}>{f.label}</label>
                {f.area ? (
                  <textarea
                    id={"setting-" + f.key}
                    rows={f.key === "introBody" ? 5 : 3}
                    value={String(value[f.key])}
                    onChange={(e) =>
                      onChange({ ...value, [f.key]: e.target.value })
                    }
                  />
                ) : (
                  <input
                    id={"setting-" + f.key}
                    value={String(value[f.key])}
                    onChange={(e) =>
                      onChange({ ...value, [f.key]: e.target.value })
                    }
                  />
                )}
              </div>
            ))}
          </section>
        ))}
        <section className="admin-panel settings-group">
          <h2>동문 진로 배너</h2>
          <p>최대 6개가 한 화면에 보입니다. 로고가 없으면 기관명이 표시됩니다. 졸업생과 기관의 연결을 확인한 뒤 공개하세요.</p>
          {value.alumniDestinations.map((item, index) => <div className="settings-repeat-item" key={index}>
            <div className="settings-repeat-heading"><strong>{index + 1}. {item.name || "새 기관"}</strong><div className="settings-repeat-controls"><button className="button outline small" type="button" disabled={index === 0} onClick={() => moveItem("alumniDestinations", index, -1)}>위로</button><button className="button outline small" type="button" disabled={index === value.alumniDestinations.length - 1} onClick={() => moveItem("alumniDestinations", index, 1)}>아래로</button><button className="button outline small" type="button" onClick={() => onChange({ ...value, alumniDestinations: value.alumniDestinations.filter((_, i) => i !== index) })}>삭제</button></div></div>
            {([ ["name", "기관명"], ["alumnus", "졸업생"], ["link", "졸업생 소개 링크"], ["logo", "로고 이미지 URL"] ] as const).map(([key, label]) => <div className="form-field" key={key}><label htmlFor={`alumni-${index}-${key}`}>{label}</label><input id={`alumni-${index}-${key}`} value={item[key]} onChange={e => onChange({ ...value, alumniDestinations: value.alumniDestinations.map((entry, i) => i === index ? { ...entry, [key]: e.target.value } : entry) })} /></div>)}
            <button className="button outline small" type="button" onClick={() => onPick(`alumni:${index}`)}>미디어 보관함에서 로고 선택</button>
          </div>)}
          <button className="button outline small" type="button" disabled={value.alumniDestinations.length >= 30} onClick={() => onChange({ ...value, alumniDestinations: [...value.alumniDestinations, { name: "", alumnus: "", logo: "", link: "" }] })}>기관 추가</button>
        </section>
        <section className="admin-panel settings-group">
          <h2>교수 프로필 링크</h2>
          <p>Google Scholar와 People 페이지의 CV 다운로드 링크를 관리합니다. 새 CV를 업로드한 뒤 보관함에서 선택하면 교체됩니다.</p>
          <div className="form-field"><label htmlFor="professor-scholar-url">Google Scholar URL</label><input id="professor-scholar-url" value={value.professorScholarUrl} onChange={e => onChange({ ...value, professorScholarUrl: e.target.value })} /></div>
          <div className="form-field"><label htmlFor="professor-cv-url">CV PDF URL</label><input id="professor-cv-url" value={value.professorCvUrl} onChange={e => onChange({ ...value, professorCvUrl: e.target.value })} /></div>
          <div className="settings-repeat-controls"><button className="button outline small" type="button" onClick={() => onPick("professorCv")}>미디어 보관함에서 CV 선택</button><button className="button outline small" type="button" onClick={() => onChange({ ...value, professorCvUrl: "" })}>CV 링크 비우기</button></div>
        </section>
        <section className="admin-panel settings-group">
          <h2>교수 성과</h2>
          <p>People 페이지의 학력·경력·수상을 행 단위로 관리합니다. 행을 추가하고 위·아래 버튼으로 순서를 바꿀 수 있습니다.</p>
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
        </section>
      </div>
      <aside className="settings-preview">
        <section className="admin-panel">
          <h2>사이트 기본 설정</h2>
          <p className="admin-note">연구실 소개·연락처·지도 설정을 저장합니다. Hero는 위의 페이지별 버튼으로 저장하세요.</p>
          <p className="admin-note">지도 URL을 비워두면 현재 기관명과 주소로 Google 지도를 표시합니다. 특정 장소를 지정하려면 Google Maps의 공유 → 지도 퍼가기에서 src 주소만 입력하세요.</p>
          <span className="status-chip">{dirty ? "수정 중" : "저장됨"}</span>
          <div className="settings-actions">
            <button className="button outline" disabled={busy} onClick={() => onSave("draft", "site")}><Save size={16} />설정 초안 저장</button>
            <button className="button" disabled={busy} onClick={() => onSave("publish", "site")}><Check size={16} />설정 공개 반영</button>
          </div>
        </section>
      </aside>
      </div>
    </div>
  );
}

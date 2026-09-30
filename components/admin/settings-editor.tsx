"use client";
import { Save, Check } from "lucide-react";
import HeroEditor, { type HeroPicker } from "./hero-editor";
import type { SettingsScope } from "@/lib/heroes";
import type { Settings } from "@/lib/content-model";
type Field = { key: keyof Settings; label: string; area?: boolean };
const groups: { title: string; description: string; fields: Field[] }[] = [
  {
    title: "Home 연구 성과",
    description: "논문 수는 공개 논문 목록에서 자동 계산됩니다. 이곳의 수치와 문구는 직접 관리합니다.",
    fields: [
      { key: "homeInfluenceLabel", label: "H-index 상단 문구 (Research influence)" },
      { key: "homeHIndex", label: "H-index 값" },
      { key: "homeHIndexNote", label: "H-index 설명·출처" },
      { key: "homeHcrLabel", label: "교수 성과 상단 문구 (Wonyong Choi)" },
      { key: "homeHcrYears", label: "Highly Cited Researcher 기간" },
      { key: "homeHcrNote", label: "교수 성과 설명" },
      { key: "homePublicationsLabel", label: "논문 바로가기 문구 (논문 수는 자동 연동)" },
      { key: "homeFacilitiesLabel", label: "연구 인프라 버튼 문구" },
      { key: "homeFacilitiesUrl", label: "KENTECH 연구 인프라 링크" },
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
  function moveItem(key: "alumniDestinations", index: number, offset: number) {
    const items = [...value[key]];
    const next = index + offset;
    if (next < 0 || next >= items.length) return;
    [items[index], items[next]] = [items[next], items[index]];
    onChange({ ...value, [key]: items });
  }
  function sectionActions(scope: SettingsScope, label: string) {
    return <div className="settings-actions">
      <button className="button outline small" type="button" disabled={busy} onClick={() => onSave("draft", scope)}><Save size={15} />{label} 초안 저장</button>
      <button className="button small" type="button" disabled={busy} onClick={() => onSave("publish", scope)}><Check size={15} />{label} 공개 반영</button>
      <a className="text-link" href={`/admin/preview?page=${scope === "professor" ? "people" : "home"}`} target="_blank" rel="noreferrer">저장한 초안 보기 ↗</a>
    </div>;
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
            {g.title === "Home 연구 성과" ? sectionActions("homeEvidence", "성과 영역") : null}
          </section>
        ))}
        <section className="admin-panel settings-group">
          <h2>동문 진로 배너</h2>
          <p>Home 히어로 안에서 자동 순환합니다. PC는 최대 5개, 태블릿은 3개, 모바일은 1~2개가 보입니다. 기관 추가·순서·로고·링크를 관리할 수 있습니다.</p>
          <div className="form-field"><label htmlFor="alumni-eyebrow">상단 문구 (Alumni pathways)</label><input id="alumni-eyebrow" value={value.alumniEyebrow} onChange={e => onChange({ ...value, alumniEyebrow: e.target.value })} /></div>
          <div className="form-field"><label htmlFor="alumni-heading">배너 제목</label><input id="alumni-heading" value={value.alumniHeading} onChange={e => onChange({ ...value, alumniHeading: e.target.value })} /></div>
          <div className="form-field"><label htmlFor="alumni-autoplay">자동 순환</label><select id="alumni-autoplay" value={String(value.alumniAutoplay)} onChange={e => onChange({ ...value, alumniAutoplay: e.target.value === "true" })}><option value="true">사용</option><option value="false">사용 안 함</option></select></div>
          <div className="form-field"><label htmlFor="alumni-interval">다음 항목으로 이동하는 간격 (초)</label><input id="alumni-interval" type="number" min="2" max="15" value={value.alumniInterval} onChange={e => onChange({ ...value, alumniInterval: Number(e.target.value) })} /></div>
          <div className="form-field"><label htmlFor="alumni-direction">자동 이동 방향</label><select id="alumni-direction" value={value.alumniDirection} onChange={e => onChange({ ...value, alumniDirection: e.target.value as Settings["alumniDirection"] })}><option value="right">오른쪽으로 이동 (PPT 기준)</option><option value="left">왼쪽으로 이동</option></select></div>
          {value.alumniDestinations.map((item, index) => <div className="settings-repeat-item" key={index}>
            <div className="settings-repeat-heading"><strong>{index + 1}. {item.name || "새 기관"}</strong><div className="settings-repeat-controls"><button className="button outline small" type="button" disabled={index === 0} onClick={() => moveItem("alumniDestinations", index, -1)}>위로</button><button className="button outline small" type="button" disabled={index === value.alumniDestinations.length - 1} onClick={() => moveItem("alumniDestinations", index, 1)}>아래로</button><button className="button outline small" type="button" onClick={() => onChange({ ...value, alumniDestinations: value.alumniDestinations.filter((_, i) => i !== index) })}>삭제</button></div></div>
            {([ ["name", "기관명"], ["alumnus", "졸업생"], ["link", "졸업생 소개 링크"], ["logo", "로고 이미지 URL"] ] as const).map(([key, label]) => <div className="form-field" key={key}><label htmlFor={`alumni-${index}-${key}`}>{label}</label><input id={`alumni-${index}-${key}`} value={item[key]} onChange={e => onChange({ ...value, alumniDestinations: value.alumniDestinations.map((entry, i) => i === index ? { ...entry, [key]: e.target.value } : entry) })} /></div>)}
            <button className="button outline small" type="button" onClick={() => onPick(`alumni:${index}`)}>미디어 보관함에서 로고 선택</button>
          </div>)}
          <button className="button outline small" type="button" disabled={value.alumniDestinations.length >= 30} onClick={() => onChange({ ...value, alumniDestinations: [...value.alumniDestinations, { name: "", alumnus: "", logo: "", link: "" }] })}>기관 추가</button>
          {sectionActions("alumni", "동문 배너")}
        </section>
      </div>
      <aside className="settings-preview">
        <section className="admin-panel">
          <h2>사이트 기본 설정</h2>
          <p className="admin-note">연구실 소개·연락처·지도와 아래의 전체 설정을 저장합니다. 성과·동문 배너는 각 영역의 버튼으로 따로 저장할 수도 있습니다. 교수 정보는 좌측 교수 프로필·성과 탭에서 관리합니다. Hero 이미지·제목은 위의 페이지별 버튼을 사용하세요.</p>
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

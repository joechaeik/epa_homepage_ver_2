"use client";
import { Save, Check } from "lucide-react";
import HeroEditor, { type HeroPicker } from "./hero-editor";
import type { SettingsScope } from "@/lib/heroes";
import type { Settings } from "@/lib/content-model";
type Field = { key: keyof Settings; label: string; area?: boolean };
const groups: { title: string; description: string; fields: Field[] }[] = [
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
  onPick: (target: HeroPicker | "intro") => void;
  onSave: (intent: "draft" | "publish", scope: SettingsScope) => void;
  busy: boolean;
  dirty: boolean;
}) {
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

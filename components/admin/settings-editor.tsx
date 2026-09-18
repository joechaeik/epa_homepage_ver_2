"use client";
import { ArrowUpRight, Save, Check, ImageIcon } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import type { Settings } from "@/lib/content-model";
type Field = { key: keyof Settings; label: string; area?: boolean };
const groups: { title: string; description: string; fields: Field[] }[] = [
  {
    title: "히어로 문구",
    description: "방문자가 처음 보는 메인 화면입니다.",
    fields: [
      { key: "heroEyebrow", label: "상단 작은 문구" },
      { key: "heroTitle", label: "메인 제목", area: true },
      { key: "heroAccent", label: "강조 문구" },
      { key: "heroDescription", label: "소개 문장", area: true },
      { key: "heroButtonText", label: "버튼 문구" },
      { key: "heroButtonLink", label: "버튼 이동 주소" },
      { key: "heroCaption", label: "이미지 하단 설명" },
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
  onPick: (target: "hero" | "intro") => void;
  onSave: (intent: "draft" | "publish") => void;
  busy: boolean;
  dirty: boolean;
}) {
  return (
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
          <div className="panel-heading">
            <h2>히어로 미리보기</h2>
            <span className="status-chip">{dirty ? "수정 중" : "저장됨"}</span>
          </div>
          <div
            className="mini-hero"
            style={{
              backgroundImage: `linear-gradient(90deg,#0b333bf5,#0b333b66),url("${value.heroImage.replace(/["\\\n\r]/g, "")}")`,
              backgroundPosition: `${value.heroPosition}% center`,
            }}
          >
            <span>{value.heroEyebrow}</span>
            <h3 className="preserve-lines">
              {value.heroTitle}
              <br />
              <em>{value.heroAccent}</em>
            </h3>
            <p>{value.heroDescription}</p>
            <span className="mini-button">
              {value.heroButtonText}
              <ArrowUpRight size={11} />
            </span>
          </div>
          <button
            className="button outline full-width"
            onClick={() => onPick("hero")}
          >
            <ImageIcon size={17} />
            배경 이미지 변경
          </button>
          <div className="form-field">
            <label htmlFor="hero-image">배경 이미지 주소</label>
            <input
              id="hero-image"
              value={value.heroImage}
              onChange={(e) =>
                onChange({ ...value, heroImage: e.target.value })
              }
            />
          </div>
          <div className="form-field">
            <label htmlFor="hero-image-alt">배경 이미지 설명</label>
            <input
              id="hero-image-alt"
              value={value.heroImageAlt}
              onChange={(e) =>
                onChange({ ...value, heroImageAlt: e.target.value })
              }
            />
          </div>
          <div className="form-field">
            <label>이미지 가로 위치 · {value.heroPosition}%</label>
            <Slider
              aria-label="히어로 이미지 가로 위치"
              min={0}
              max={100}
              step={1}
              value={[value.heroPosition]}
              onValueChange={(v) => onChange({ ...value, heroPosition: v[0] })}
            />
          </div>
          <p className="admin-note">
            초안을 저장한 뒤 홈 초안 미리보기에서 실제 화면을 확인할 수
            있습니다.
          </p>
          <div className="settings-actions">
            <button
              className="button outline"
              disabled={busy}
              onClick={() => onSave("draft")}
            >
              <Save size={16} />
              초안 저장
            </button>
            <button
              className="button"
              disabled={busy}
              onClick={() => onSave("publish")}
            >
              <Check size={16} />
              공개 반영
            </button>
          </div>
        </section>
      </aside>
    </div>
  );
}

"use client";
import { useState } from "react";
import { Save, Check, ImageIcon, Trash2, ArrowUpRight } from "lucide-react";
import { heroPages, heroLabels, type HeroPage, type Settings, type HeroSettings } from "@/lib/content-model";
import { getHero, setHero } from "@/lib/heroes";
import Hero from "@/components/hero";
export type HeroPicker = `hero:${HeroPage}`;
export default function HeroEditor({ value, onChange, onPick, onSave, busy }: {
  value: Settings; onChange: (v: Settings) => void; onPick: (target: HeroPicker) => void;
  onSave: (intent: "draft" | "publish", scope: HeroPage) => void; busy: boolean;
}) {
  const [page, setPage] = useState<HeroPage>("home");
  const hero = getHero(value, page);
  const update = (patch: Partial<HeroSettings>) => onChange(setHero(value, page, { ...hero, ...patch }));
  return <section className="admin-panel hero-editor">
    <div className="panel-heading"><div><h2>페이지별 Hero</h2><p className="admin-note">각 페이지의 제목과 배경을 독립적으로 저장·공개합니다.</p></div></div>
    <fieldset disabled={busy}>
      <div className="form-field"><label htmlFor="hero-page">Hero 페이지</label>
        <select id="hero-page" value={page} onChange={e => setPage(e.target.value as HeroPage)}>{heroPages.map(p => <option key={p} value={p}>{heroLabels[p]}</option>)}</select>
      </div>
      <div className="hero-editor-grid">
        <div>
          <div className="form-field"><label htmlFor="hero-title">Hero Title</label><textarea id="hero-title" rows={3} maxLength={180} value={hero.title} onChange={e => update({ title: e.target.value })} /></div>
          <div className="form-field"><label htmlFor="hero-subtitle">Hero Subtitle</label><textarea id="hero-subtitle" rows={3} maxLength={700} value={hero.subtitle} onChange={e => update({ subtitle: e.target.value })} /></div>
          {page === "home" ? <details className="hero-home-extra"><summary>Home 추가 문구·버튼</summary>{([
            ["heroEyebrow", "상단 작은 문구"], ["heroAccent", "강조 문구"], ["heroCaption", "이미지 하단 설명"], ["heroButtonText", "버튼 문구"], ["heroButtonLink", "버튼 이동 주소"],
          ] as const).map(([key,label]) => <div className="form-field" key={key}><label htmlFor={key}>{label}</label><input id={key} value={value[key]} onChange={e => onChange({ ...value, [key]: e.target.value })} /></div>)}</details> : null}
          <div className="form-field"><label htmlFor="hero-image">Hero Image URL</label><input id="hero-image" value={hero.image} onChange={e => update({ image: e.target.value })} /></div>
          <div className="hero-image-actions">
            <button className="button outline small" onClick={() => onPick(`hero:${page}`)}><ImageIcon size={16} />이미지 선택·교체</button>
            <button className="button outline small" disabled={!hero.image} onClick={() => update({ image: "", imageAlt: "" })}><Trash2 size={16} />이미지 제거</button>
          </div>
          <p className="admin-note">이미지 제거는 이 Hero에서만 연결을 해제합니다. 변경은 공개 반영 후 표시됩니다.</p>
          <div className="form-field"><label htmlFor="hero-alt">이미지 설명</label><input id="hero-alt" value={hero.imageAlt} onChange={e => update({ imageAlt: e.target.value })} /></div>
          <div className="form-field"><label htmlFor="hero-x">이미지 가로 위치 · {hero.position}%</label><input id="hero-x" type="range" min="0" max="100" value={hero.position} onChange={e => update({ position: Number(e.target.value) })} /></div>
          <div className="form-field"><label htmlFor="hero-y">이미지 세로 위치 · {hero.positionY}%</label><input id="hero-y" type="range" min="0" max="100" value={hero.positionY} onChange={e => update({ positionY: Number(e.target.value) })} /></div>
        </div>
        <div>
          <p className="eyebrow">{heroLabels[page]} · 편집 미리보기</p>
          <div className="hero-editor-preview"><Hero settings={value} page={page} headingLevel="h2" /></div>
          <a className="text-link" href={`/admin/preview?page=${page}`} target="_blank" rel="noreferrer">저장된 초안 미리보기 <ArrowUpRight size={16} /></a>
          <p className="admin-note">아래 버튼은 {heroLabels[page]} Hero에만 적용됩니다. 다른 페이지의 초안은 공개되지 않습니다.</p>
          <div className="settings-actions">
            <button className="button outline" onClick={() => onSave("draft", page)}><Save size={16} />Hero 초안 저장</button>
            <button className="button" onClick={() => onSave("publish", page)}><Check size={16} />Hero 공개 반영</button>
          </div>
        </div>
      </div>
    </fieldset>
  </section>;
}

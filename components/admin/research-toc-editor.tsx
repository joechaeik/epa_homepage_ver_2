import type { Entry } from "@/lib/content-model";
export type TocPublicationOption = { id: string; title: string; year: number; image?: string; imageAlt?: string; doi?: string };

export default function ResearchTocEditor({ data, setData, publications }: { data: Entry; setData: (data: Entry) => void; publications: TocPublicationOption[] }) {
  const selected = data.tocPublicationIds ?? [];
  const options = publications.filter(p => data.relatedPublicationIds.includes(p.id));
  function choose(index: number, id: string) {
    const next = [...selected];
    next[index] = id;
    setData({ ...data, tocPublicationIds: next.filter(Boolean) });
  }
  function move(index: number, offset: number) {
    const next = [...selected];
    [next[index], next[index + offset]] = [next[index + offset], next[index]];
    setData({ ...data, tocPublicationIds: next });
  }
  return <fieldset className="admin-toc-editor"><legend>TOC 그래픽 · 최대 5개</legend>
    <p className="admin-note">위의 관련 논문 중에서 선택하세요. 대표 figure는 관리자 → 논문 → 편집의 ‘TOC·대표 figure’에서 등록하고 공개 반영합니다. 선택 순서대로 왼쪽부터 표시되며, 이미지와 DOI가 모두 공개된 논문만 표시됩니다. 빈칸은 투명하게 유지됩니다.</p>
    {Array.from({ length: 5 }, (_, index) => {
      const paper = options.find(p => p.id === selected[index]);
      return <div className="admin-toc-slot" key={index}>
        <label htmlFor={`toc-slot-${index}`}>TOC {index + 1}</label>
        <select id={`toc-slot-${index}`} value={selected[index] || ""} onChange={e => choose(index, e.target.value)}>
          <option value="">선택 안 함</option>
          {options.map(p => <option key={p.id} value={p.id} disabled={selected.includes(p.id) && p.id !== selected[index]}>{p.year} · {p.title}</option>)}
        </select>
        {paper?.image ? <img className="admin-toc-preview" src={paper.image} alt={paper.imageAlt || paper.title} /> : null}
        {paper && (!paper.image || !paper.doi) ? <p className="admin-note">{!paper.image ? "공개된 TOC 이미지가 없습니다. " : ""}{!paper.doi ? "DOI가 없습니다. " : ""}논문 편집 후 공개 반영하면 여기에 표시됩니다.</p> : null}
        {paper ? <div className="settings-repeat-controls"><button type="button" className="button outline small" disabled={index === 0} onClick={() => move(index, -1)}>앞으로</button><button type="button" className="button outline small" disabled={index === selected.length - 1} onClick={() => move(index, 1)}>뒤로</button><button type="button" className="button outline small" onClick={() => choose(index, "")}>이미지 선택 해제</button></div> : null}
      </div>;
    })}
  </fieldset>;
}

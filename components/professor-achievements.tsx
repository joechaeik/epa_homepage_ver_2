import type { Settings } from "@/lib/content-model";
export default function ProfessorAchievements({ settings }: { settings: Settings }) {
  return <section className="section professor-achievements" aria-labelledby="professor-achievements-title">
        <div className="section-heading"><div><p className="eyebrow">{settings.professorAchievementsEyebrow}</p><h2 id="professor-achievements-title">{settings.professorAchievementsTitle}</h2></div><p>{settings.professorAchievementsDescription}</p></div>
        <div className="professor-achievement-grid">
          <div className="professor-achievement-column professor-career-column">
            <h3>{settings.professorEducationHeading}</h3>
            <ol className="professor-timeline">{settings.professorEducation.map((item, index) => <li key={`${item.period}-${index}`}><span>{item.period}</span><div><strong>{item.title}</strong><p>{item.detail}</p></div></li>)}</ol>
            <h3>{settings.professorCareerHeading}</h3>
            <ol className="professor-timeline">{settings.professorCareer.slice(0, 6).map((item, index) => <li key={`${item.period}-${index}`}><span>{item.period}</span><div><strong>{item.title}</strong><p>{item.detail}</p></div></li>)}</ol>
            {settings.professorCareer.length > 6 ? <details className="professor-more"><summary>View full career →</summary><ol className="professor-timeline">{settings.professorCareer.slice(6).map((item, index) => <li key={`${item.period}-${index}`}><span>{item.period}</span><div><strong>{item.title}</strong><p>{item.detail}</p></div></li>)}</ol></details> : null}
          </div>
          <div className="professor-achievement-column professor-awards-column">
            <h3>{settings.professorAwardsHeading}</h3>
            <ol className="professor-timeline">{settings.professorAwards.slice(0, 13).map((item, index) => <li key={`${item.period}-${index}`}><span>{item.period}</span><div><strong>{item.title}</strong>{item.detail ? <p>{item.detail}</p> : null}</div></li>)}</ol>
            {settings.professorAwards.length > 13 ? <details className="professor-more"><summary>View more honors</summary><ol className="professor-timeline">{settings.professorAwards.slice(13).map((item, index) => <li key={`${item.period}-${index}`}><span>{item.period}</span><div><strong>{item.title}</strong>{item.detail ? <p>{item.detail}</p> : null}</div></li>)}</ol></details> : null}
          </div>
        </div>
      </section>;
}

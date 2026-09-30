import { Mail, ArrowUpRight, Download } from "lucide-react";

export default function ProfessorLinks({ email, scholarUrl, cvUrl, orcidUrl, compact = false }: {
  email: string;
  scholarUrl: string;
  cvUrl: string;
  orcidUrl: string;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "pi-links pi-links-mobile" : "pi-links"}>
      <a className="button outline" href={"mailto:" + email} aria-label="Contact Professor Choi" title="Contact Professor Choi">
        <Mail size={16} />{compact ? null : "Contact Professor Choi"}
      </a>
      {scholarUrl ? <a className="text-link" href={scholarUrl} target="_blank" rel="noopener noreferrer">{compact ? "Scholar" : "Google Scholar"}{compact ? null : <ArrowUpRight size={16} />}</a> : null}
      {cvUrl ? <a className="text-link" href={cvUrl} target="_blank" rel="noopener noreferrer" download={cvUrl.startsWith("/") ? "Wonyong_Choi_CV.pdf" : undefined}>{compact ? "CV" : "Download CV"}{compact ? null : <Download size={16} />}</a> : null}
      {orcidUrl ? <a className="text-link" href={orcidUrl} target="_blank" rel="noopener noreferrer">{compact ? "ORCID" : "ORCID profile"}{compact ? null : <ArrowUpRight size={16} />}</a> : null}
    </div>
  );
}

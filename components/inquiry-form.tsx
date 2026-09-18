"use client";
import { useState } from "react";
import { Mail } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
export default function InquiryForm({ email }: { email: string }) {
  const [position, setPosition] = useState("Graduate research");
  const [mailUrl, setMailUrl] = useState("");
  return (
    <form
      className="inquiry-form"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const body = `Dear Professor Choi,\n\n${data.get("message")}\n\nName: ${data.get("name")}\nInstitution: ${data.get("institution")}\nEmail: ${data.get("email")}\nResearch interest: ${position}\n\nBest regards,\n${data.get("name")}`;
        setMailUrl(
          `mailto:${email}?subject=${encodeURIComponent("EPA Lab inquiry — " + position)}&body=${encodeURIComponent(body)}`,
        );
      }}
    >
      <h2>Start a conversation</h2>
      <p>Tell us a little about yourself and your research interests.</p>
      <div className="form-grid">
        <label>
          Your name
          <input name="name" required maxLength={100} autoComplete="name" />
        </label>
        <label>
          Email address
          <input
            name="email"
            required
            type="email"
            maxLength={150}
            autoComplete="email"
          />
        </label>
        <label className="full">
          Institution / university
          <input
            name="institution"
            required
            maxLength={200}
            autoComplete="organization"
          />
        </label>
        <div className="full">
          <label id="interest-label">I’m interested in</label>
          <Select value={position} onValueChange={setPosition}>
            <SelectTrigger aria-labelledby="interest-label" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[
                "Graduate research",
                "Postdoctoral research",
                "Visiting researcher",
                "Research collaboration",
              ].map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <label className="full">
          Your research interests
          <textarea name="message" required maxLength={2000} rows={5} />
        </label>
      </div>
      <button className="button" type="submit">
        <Mail size={17} /> Prepare inquiry email
      </button>
      <p className="form-note">
        Your information stays in this page. The next step opens your email app;
        you can review the message and attach your CV before sending.
      </p>
      {mailUrl ? (
        <div className="mail-ready" role="status">
          <strong>Your email draft is ready.</strong>
          <a className="text-link" href={mailUrl}>
            Open in your email app <Mail size={17} />
          </a>
          <span>
            If your email app doesn’t open, write directly to{" "}
            <a href={"mailto:" + email}>{email}</a>.
          </span>
        </div>
      ) : null}
    </form>
  );
}

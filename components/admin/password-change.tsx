"use client";
import { useState, type FormEvent } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function PasswordChange() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  function toggle(value: boolean) {
    if (busy) return;
    setOpen(value);
    setError(""); setCurrent(""); setNext(""); setConfirm("");
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (next !== confirm) { setError("새 비밀번호와 확인 입력이 일치하지 않습니다."); return; }
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/admin/password", {
        method: "POST",
        body: new URLSearchParams({ currentPassword: current, newPassword: next, confirmPassword: confirm }),
      });
      const result = await response.json();
      if (!response.ok) { setError(result && typeof result === "object" && "error" in result && typeof result.error === "string" ? result.error : "비밀번호 변경에 실패했습니다."); return; }
      setCurrent(""); setNext(""); setConfirm("");
      window.location.assign("/admin?login=changed");
    } catch {
      setError("변경 여부를 확인할 수 없습니다. 관리자 페이지를 새로 열고 새 비밀번호로 로그인해 주세요.");
    } finally { setBusy(false); }
  }
  return <>
    <button type="button" className="text-link" onClick={() => toggle(true)}>비밀번호 변경</button>
    <Dialog open={open} onOpenChange={toggle}>
      <DialogContent className="admin-password-dialog">
        <DialogHeader>
          <DialogTitle>관리자 비밀번호 변경</DialogTitle>
          <DialogDescription>변경하면 모든 기기의 관리자 로그인이 해제됩니다. 새 비밀번호로 다시 로그인해 주세요.</DialogDescription>
        </DialogHeader>
        <form className="admin-password-form" onSubmit={submit}>
          <label htmlFor="change-current-password">현재 비밀번호</label>
          <input id="change-current-password" type="password" autoComplete="current-password" value={current} onChange={event => setCurrent(event.target.value)} maxLength={256} required disabled={busy} />
          <label htmlFor="change-new-password">새 비밀번호</label>
          <input id="change-new-password" type="password" autoComplete="new-password" value={next} onChange={event => setNext(event.target.value)} minLength={16} maxLength={128} required disabled={busy} aria-describedby="change-password-hint" />
          <p id="change-password-hint">16~128자로 입력하세요. 길고 고유한 비밀번호나 암호 문구를 권장합니다.</p>
          <label htmlFor="change-confirm-password">새 비밀번호 확인</label>
          <input id="change-confirm-password" type="password" autoComplete="new-password" value={confirm} onChange={event => setConfirm(event.target.value)} minLength={16} maxLength={128} required disabled={busy} />
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          <button type="submit" className="button" disabled={busy}>{busy ? "변경 중…" : "비밀번호 변경 후 다시 로그인"}</button>
        </form>
      </DialogContent>
    </Dialog>
  </>;
}

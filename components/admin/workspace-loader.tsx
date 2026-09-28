"use client";

import { useEffect, useState } from "react";
import AdminWorkspace from "./workspace";
import type { AdminData } from "./workspace";

export default function AdminWorkspaceLoader({
  displayName,
  local,
}: {
  displayName: string;
  local: boolean;
}) {
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/admin/content", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(response.status === 401 ? "관리자 로그인이 만료되었습니다. 페이지를 다시 열어 주세요." : "콘텐츠를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
        return response.json() as Promise<AdminData>;
      })
      .then((result) => { if (!controller.signal.aborted) setData(result); })
      .catch((cause) => { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "콘텐츠를 불러오지 못했습니다."); });
    return () => controller.abort();
  }, [attempt]);

  if (data) return <AdminWorkspace initial={data} displayName={displayName} local={local} />;
  return (
    <main className="admin-login" lang="ko">
      <div className="login-card" role={error ? "alert" : "status"}>
        <p className="eyebrow">EPA LAB CONTENT STUDIO</p>
        <h1>{error ? "관리자 화면을 열 수 없습니다." : "관리자 화면을 준비하고 있습니다."}</h1>
        <p>{error || "콘텐츠를 불러오는 중입니다."}</p>
        {error ? <button className="button" onClick={() => { setError(""); setAttempt((value) => value + 1); }}>다시 시도</button> : null}
      </div>
    </main>
  );
}

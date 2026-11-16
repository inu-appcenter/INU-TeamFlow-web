export default function PolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 정책 페이지는 앱에서 폰으로도 열리므로 최소 너비 해제 (globals.css 참고)
  return <div className="policy-page">{children}</div>;
}

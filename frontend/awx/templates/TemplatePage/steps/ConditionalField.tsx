export function ConditionalField({
  isHidden = false,
  children,
}: {
  isHidden: boolean;
  children: React.ReactNode;
}) {
  return isHidden ? null : <>{children}</>;
}

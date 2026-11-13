/** Build-time application display name from `APPLICATION_NAME` (downstream overrides inject this at build). */
export function getBuildApplicationName(): string {
  return import.meta.env.APPLICATION_NAME ?? '';
}

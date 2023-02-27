export function shouldShowAutmationServers() {
  let count = 0;

  let showAWX = process.env.AWX === 'true';
  if (showAWX) count++;

  let showGalaxy = process.env.GALAXY === 'true';
  if (showGalaxy) count++;

  let showEda = process.env.EDA === 'true';
  if (showEda) count++;

  const showAutomationServers = count !== 1;
  if (showAutomationServers) {
    showAWX = true;
    showGalaxy = true;
    showEda = true;
  }

  return {
    showAutomationServers,
    showAWX,
    showGalaxy,
    showEda,
  };
}

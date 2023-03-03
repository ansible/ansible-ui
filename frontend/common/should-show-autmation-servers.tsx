export function shouldShowAutmationServers() {
  let count = 0;

  let showAWX = process.env.AWX === 'true';
  if (showAWX) count++;

  let showHub = process.env.HUB === 'true';
  if (showHub) count++;

  let showEda = process.env.EDA === 'true';
  if (showEda) count++;

  const showAutomationServers = count !== 1;
  if (showAutomationServers) {
    showAWX = true;
    showHub = true;
    showEda = true;
  }

  return {
    showAutomationServers,
    showAWX,
    showHub,
    showEda,
  };
}

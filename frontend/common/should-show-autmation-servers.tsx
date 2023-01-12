export function shouldShowAutmationServers() {
  let count = 0;

  let showController = process.env.CONTROLLER === 'true';
  if (showController) count++;

  let showHub = process.env.HUB === 'true';
  if (showHub) count++;

  let showEda = process.env.EDA === 'true';
  if (showEda) count++;

  const showAutomationServers = count !== 1;
  if (showAutomationServers) {
    showController = true;
    showHub = true;
    showEda = true;
  }

  return {
    showAutomationServers,
    showController,
    showHub,
    showEda,
  };
}

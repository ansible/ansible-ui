export function shouldShowAutmationServers() {
  let count = 0;

  let showAWX = import.meta.env.VITE_AAP_MODE === 'AWX';
  if (showAWX) count++;

  let showHub = import.meta.env.VITE_AAP_MODE === 'HUB';
  if (showHub) count++;

  let showEda = import.meta.env.VITE_AAP_MODE === 'EDA';
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

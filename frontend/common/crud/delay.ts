export async function Delay() {
  const delay =
    process.env.DELAY && Number.isInteger(Number(process.env.DELAY))
      ? Number(process.env.DELAY)
      : undefined;

  if (delay) {
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}

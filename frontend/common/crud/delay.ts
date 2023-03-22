const delay =
  process.env.DELAY && Number.isInteger(Number(process.env.DELAY))
    ? Number(process.env.DELAY)
    : undefined;

export async function Delay() {
  if (delay) {
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}

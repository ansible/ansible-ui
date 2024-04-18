export async function poll<ResponseT>(
  fn: () => Promise<ResponseT | undefined>,
  check: (response: ResponseT) => boolean,
  interval?: number,
  maxAttempts?: number
) {
  for (let attempt = 0; attempt < (maxAttempts ?? 10); attempt++) {
    const response = await fn();
    if (response !== undefined && check(response)) {
      return response;
    }
    await new Promise((resolve) => setTimeout(resolve, interval ?? 1000));
  }
  throw new Error(`Failed to get expected response after ${maxAttempts} attempts`);
}

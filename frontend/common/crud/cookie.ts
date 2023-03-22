export function setCookie(cookie: string, value: string) {
  const date = new Date();
  date.setTime(date.getTime() + 30 * 24 * 60 * 60 * 1000);
  const expires = 'expires=' + date.toUTCString();
  document.cookie = cookie + '=' + value + ';' + expires + ';path=/';
}

export function getCookie(cookieName: string): string | undefined {
  const cookies = document.cookie.split(';').map((cookie) => cookie.trim());
  for (const cookie of cookies) {
    if (cookie.startsWith(cookieName + '=')) {
      return cookie.slice(cookieName.length + 1);
    }
  }
}

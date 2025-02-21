export default function getUserFromCookie(): string {
  try {
    let cookie = document.cookie.split("USERID=");
    cookie = cookie[1].split(";");
    return cookie[0];
  } catch {
    return "";
  }
}

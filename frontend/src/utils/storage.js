// In Electron production (file:// protocol), cookies with SameSite/path don't persist.
// localStorage works perfectly across all environments (Electron, browser, dev, prod).

export const setCookie = (name, value, days = 7) => {
  try {
    localStorage.setItem(name, value || '');
  } catch(e) {
    // fallback to cookie if localStorage fails
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
  }
};

export const getCookie = (name) => {
  try {
    const val = localStorage.getItem(name);
    if (val !== null) return val;
  } catch(e) {}
  // fallback: read from actual cookies
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for(let i=0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

export const removeCookie = (name) => {
  try {
    localStorage.removeItem(name);
  } catch(e) {}
  document.cookie = name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
};


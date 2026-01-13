import { createSignal, createEffect, createRoot } from "solid-js";

const EXPIRE = 604800;
export const DEFAULT_DASHBOARD = "testing";
export const DEFAULT_MENU = "overview";

function createCookie(name, value, seconds) {
  if (seconds) {
    var date = new Date();
    date.setTime(date.getTime() + (seconds * 1000));
    var expires = "; expires=" + date.toGMTString();
  }
  else var expires = "";
  document.cookie = name + "=" + value + expires + "; path=/; SameSite=strict";
}

function readCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for(var i=0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function deleteCookie(name) {
  createCookie(name, "", -1);
}

function listCookiesName() {
  var names = [];
  var ca = document.cookie.split(';');
  for(var i=0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') c = c.substring(1, c.length);
    names.push(c.split('=')[0])
  }
  return names;
}

export const langs = [
  { name: "ID", icon: "/icon/fi-id.svg" }, 
  { name: "EN", icon: "/icon/fi-gb.svg" }
];

export const [lang, setLang] = createRoot(() => {
  const cookieLang = readCookie("lang");
  const initialLang = cookieLang ? cookieLang : "ID";
  let [lang, setLang] = createSignal(initialLang);
  createEffect(() => {
    createCookie("lang", lang(), EXPIRE);
  });
  return [lang, setLang];
});

export const [darkTheme, setDarkTheme] = createRoot(() => {
  const systemTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const cookieTheme = readCookie("darkTheme");
  const initialTheme = cookieTheme ? cookieTheme === "1": systemTheme;
  const [darkTheme, setDarkTheme] = createSignal(initialTheme);
  createEffect(() => {
    const theme = darkTheme() ? "1" : "0";
    createCookie("darkTheme", theme, EXPIRE);
  });
  return [darkTheme, setDarkTheme];
});

export const [userId, setUserId] = createRoot(() => {
  const cookieUser = readCookie("user_id");
  const [userId, setUserId] = createSignal(cookieUser);
  createEffect(() => {
    if (userId() === null) {
      deleteCookie("user_id");
    } else {
      createCookie("user_id", userId(), EXPIRE);
    }
  });
  return [userId, setUserId]
});

export const authServer = {
  address: null,
  token: null,

  /** @returns {{ address:?string, token:?string }} */
  get() {
    const address = readCookie("auth_address");
    const token = readCookie("auth_token");
    if (address) this.address = address;
    if (token) this.auth_token = token;
    return { address: this.address, auth_token: this.auth_token };
  },

  /** @param {string} address */
  setAddress(address) {
    this.address = address;
    createCookie("auth_address", address, EXPIRE);
  },

  /** @param {string} token */
  setToken(token) {
    this.auth_token = token;
    createCookie("auth_token", token, EXPIRE);
  },

  unsetToken() {
    deleteCookie("auth_token");
  }
};

export const resourceServer = {
  resources: {},
  empty: { address: null, access_token: null, refresh_token: null },

  /** @param {string} id @returns {{ address:?string, token:?string, refresh_token:?string }} */
  get(id) {
    if (!(id in this.resources)) this.resources[id] = this.empty;
    for (const name of listCookiesName()) {
      const cookievalue = readCookie(name);
      if (name.indexOf("resource_address_" + id) == 0) {
        if (cookievalue) this.resources[id].address = cookievalue;
      }
      if (name.indexOf("resource_token_" + id) == 0) {
        if (cookievalue) this.resources[id].access_token = cookievalue;
      }
      if (name.indexOf("resource_refresh_" + id) == 0) {
        if (cookievalue) this.resources[id].refresh_token = cookievalue;
      }
    }
    return this.resources[id];
  },

  /** @param {string} id @param {string} address */
  setAddress(id, address) {
    if (!(id in this.resources)) this.resources[id] = this.empty;
    this.resources[id].address = address;
    createCookie("resource_address_" + id, address, EXPIRE);
  },

  /** @param {string} id @param {string} token */
  setToken(id, token) {
    if (!(id in this.resources)) this.resources[id] = this.empty;
    this.resources[id].access_token = token;
    createCookie("resource_token_" + id, token, EXPIRE);
  },

  /** @param {string} id @param {string} refresh_token */
  setRefreshToken(id, refresh_token) {
    if (!(id in this.resources)) this.resources[id] = this.empty;
    this.resources[id].refresh_token = refresh_token;
    createCookie("resource_refresh_" + id, refresh_token, EXPIRE);
  },

  /** @returns {string[]} */
  getApiIds() {
    const ids = [];
    for (const id in this.resources) ids.push(id);
    return ids;
  },

  /** @param {string} id */
  unsetToken(id) {
    deleteCookie("resource_token_" + id);
    deleteCookie("resource_refresh_" + id);
  }
};

function zeropad(input, num) {
  let output = String(input);
  for (let i = output.length; i<num; i++) {
    output = "0" + output;
  }
  return output;
}

/**
 * @param {Date} datetime
 * @returns {string}
 */
export function dateToString(datetime) {
  return (
    zeropad(datetime.getFullYear(), 4) + "-" + 
    zeropad(datetime.getMonth() + 1, 2) + "-" +
    zeropad(datetime.getDate(), 2) + " " +
    zeropad(datetime.getHours(), 2) + ":" +
    zeropad(datetime.getMinutes(), 2) + ":" +
    zeropad(datetime.getSeconds(), 2)
  );
}

/**
 * @param {string} timestamp 
 * @returns {Date}
 */
export function stringToDate(timestamp) {
  const splitDate = timestamp.split("-");
  const year = splitDate[0];
  const month = splitDate[1];
  const date = splitDate[2].substring(0, 2);
  const splitTime = timestamp.split(":");
  const hour = splitTime[0].substring(splitTime[0].length - 2);
  const minute = splitTime[1];
  const second = splitTime[2].substring(0, 2);
  return new Date(year, month, date, hour, minute, second);
}

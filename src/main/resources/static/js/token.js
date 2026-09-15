const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_COOKIE_NAME = "refresh_token";
const PROFILE_IMAGE_KEY = "profile_image";


function isLoggedIn() {
    return !!localStorage.getItem("access_token");
}

function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("profile_image");
    deleteCookie("refresh_token");
    location.replace("/login");
}

function initAuthButtons() {
    const loginItem = document.getElementById("nav-login-item");
    const profileItem = document.getElementById("nav-profile-item");
    const profileImg = document.getElementById("profile-img");
    const logoutBtn = document.getElementById("logout-btn");
    const createBtn = document.getElementById("create-btn");

    if (isLoggedIn()) {
        if (loginItem) loginItem.style.display = "none";
        if (profileItem) profileItem.style.display = "block";
        if (createBtn) createBtn.style.display = "inline-block";

        const picture = localStorage.getItem("profile_image");
        if (profileImg) {
            profileImg.src = picture || "https://ui-avatars.com/api/?name=U&background=2563eb&color=fff";
        }
    } else {
        if (loginItem) loginItem.style.display = "block";
        if (profileItem) profileItem.style.display = "none";
        if (createBtn) createBtn.style.display = "none";
    }

    if (logoutBtn) {
        logoutBtn.onclick = logout;
    }
}

function getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
}

function setAccessToken(token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

function getCookie(name) {
    return document.cookie
        .split("; ")
        .find((row) => row.startsWith(name + "="))
        ?.split("=")
        .slice(1)
        .join("=") ?? null;
}

function deleteCookie(name) {
    document.cookie = name + "=; Max-Age=0; path=/";
}

function getRefreshToken() {
    return getCookie(REFRESH_COOKIE_NAME);
}

(function saveTokenFromUrl() {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    if (!token) return;

    setAccessToken(token);

    const picture = params.get("picture");
    if (picture) {
        localStorage.setItem(PROFILE_IMAGE_KEY, picture);
    }

    params.delete("token");
    params.delete("picture");

    const qs = params.toString();
    const clean = location.pathname + (qs ? "?" + qs : "") + location.hash;
    history.replaceState({}, "", clean);
})();

async function reissueAccessToken() {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return null;

    const res = await fetch("/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
    });

    if (!(res.status === 200 || res.status === 201)) return null;

    const data = await res.json();
    const newToken = data.accessToken;
    if (!newToken) return null;

    setAccessToken(newToken);
    return newToken;
}

async function httpRequest(url, options = {}, isRetry = false) {
    const {
        method = "GET",
        body,
        headers = {},
        isFile = false,
    } = options;

    const accessToken = getAccessToken();
    const reqHeaders = { ...headers };

    if (accessToken) {
        reqHeaders["Authorization"] = `Bearer ${accessToken}`;
    }
    if (!isFile && body && !reqHeaders["Content-Type"]) {
        reqHeaders["Content-Type"] = "application/json";
    }

    const res = await fetch(url, {
        method,
        headers: reqHeaders,
        body,
    });

    if (res.status === 200 || res.status === 201) {
        return res;
    }

    if (res.status === 401 && getRefreshToken() && !isRetry) {
        const newToken = await reissueAccessToken();
        if (newToken) {
            return httpRequest(url, options, true);
        }
    }

    throw new Error(`요청 실패 (${res.status})`);
}

function parseJwtPayload(token) {
    try {
        const payload = token.split(".")[1];
        const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
        const json = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );
        return JSON.parse(json);
    } catch (e) {
        return null;
    }
}

function getCurrentUserEmail() {
    const token = getAccessToken();
    if (!token) return null;
    const payload = parseJwtPayload(token);

    return payload?.sub ?? null;
}

function initOwnerActions() {
    const actions = document.getElementById("owner-actions");
    const authorEl = document.getElementById("article-author");

    if (!actions || !authorEl) return;

    const currentEmail = getCurrentUserEmail();
    const author = authorEl.value;

    if (currentEmail && author && currentEmail === author) {
        actions.classList.remove("d-none");
        actions.classList.add("d-flex");
    }
}

function initPageAuth() {
    initAuthButtons();
    initOwnerActions();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPageAuth);
} else {
    initPageAuth();
}
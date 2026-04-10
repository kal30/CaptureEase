const isBrowser = typeof window !== "undefined";

export const isInstallContext = () => {
  if (!isBrowser) return false;

  const ua = window.navigator.userAgent || "";
  const isIpadLike =
    window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1;

  return /Android|iPhone|iPod|Mobile/i.test(ua) || /iPad/i.test(ua) || isIpadLike;
};


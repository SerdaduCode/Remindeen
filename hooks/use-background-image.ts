import { useEffect, useState } from "react";
import fetchPicture from "@/components/remindeen/home/Background";

/**
 * Fetches the newtab wallpaper once and returns its URL. Lifted out of
 * HomePage so the same photo can back both the Home and Productivity pages
 * within a single newtab session (one fetch, one image, shared across pages).
 */
export function useBackgroundImage() {
  const [backgroundUrl, setBackgroundUrl] = useState("");

  useEffect(() => {
    let cancelled = false;
    const getBackgroundImage = async () => {
      const picture = await fetchPicture();
      if (picture && !cancelled) {
        setBackgroundUrl(picture.url);
      }
    };

    getBackgroundImage();
    return () => {
      cancelled = true;
    };
  }, []);

  return backgroundUrl;
}

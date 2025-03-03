interface Picture {
  id: number;
  url: string;
  source: string;
  createdAt: string;
  updatedAt: string;
}

const fetchPicture = async (): Promise<Picture | null> => {
  try {
    const expirationTime = 1000 * 60 * 60 * 12;
    const storedPictures = localStorage.getItem("Pictures");
    const lastFetchTime = localStorage.getItem("LastFetchTime");

    const currentTime = new Date().getTime();

    if (storedPictures && lastFetchTime) {
      const timeDifference = currentTime - Number(lastFetchTime);

      if (timeDifference < expirationTime) {
        const pictures: Picture[] = JSON.parse(storedPictures);
        const randomPicture =
          pictures[Math.floor(Math.random() * pictures.length)];
        return randomPicture;
      }
    }

    const response = await fetch(`${import.meta.env.VITE_API_PICTURE}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();

    localStorage.setItem("Pictures", JSON.stringify(data));
    localStorage.setItem("LastFetchTime", currentTime.toString());

    const randomPicture = data[Math.floor(Math.random() * data.length)];
    return randomPicture;
  } catch (error) {
    console.error("Error fetching picture:", error);
    return null;
  }
};

export default fetchPicture;

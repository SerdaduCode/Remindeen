interface Picture {
    id: number;
    url: string;
    source: string;
    createdAt: string;
    updatedAt: string;
  }
  
const fetchPicture = async (): Promise<Picture | null> => {
    try {
        const storedPictures = localStorage.getItem("Pictures");

        if (storedPictures) {
            const pictures: Picture[] = JSON.parse(storedPictures);
            const randomPicture = pictures[Math.floor(Math.random() * pictures.length)];
            return randomPicture;
        } else {
            const response = await fetch(`${import.meta.env.VITE_API_PICTURE}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();

            localStorage.setItem("Pictures", JSON.stringify(data));

            const randomPicture = data[Math.floor(Math.random() * data.length)];
            return randomPicture;
        }
    } catch (error) {
        console.error("Error fetching picture:", error);
        return null;
    }
};
  
export default fetchPicture;
  
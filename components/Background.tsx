interface Picture {
    id: number;
    url: string;
    source: string;
    createdAt: string;
    updatedAt: string;
  }
  
const fetchPicture = async (): Promise<Picture | null> => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_PICTURE}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        
        // Assuming the API returns an object with the necessary fields
        return {
        id: data.id,
        url: data.url,
        source: data.source,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        } as Picture;
    } catch (error) {
        console.error("Error fetching picture:", error);
        return null;
    }
}

export default fetchPicture;

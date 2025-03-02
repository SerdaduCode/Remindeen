interface Picture {
    id: number;
    url: string;
    source: string;
    createdAt: string;
    updatedAt: string;
  }
  
const fetchPicture = async (): Promise<Picture | null> => {
try {
    // Cek apakah data gambar sudah ada di localStorage
    const storedPictures = localStorage.getItem("Pictures");

    if (storedPictures) {
    // Jika ada, parse dan pilih gambar acak
    const pictures: Picture[] = JSON.parse(storedPictures);
    const randomPicture = pictures[Math.floor(Math.random() * pictures.length)];
    return randomPicture;
    } else {
    // Jika tidak ada, fetch data dari API
    const response = await fetch(`${import.meta.env.VITE_API_PICTURE}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();

    // Simpan data gambar ke localStorage
    localStorage.setItem("Pictures", JSON.stringify(data));

    // Kembalikan gambar yang diterima dari API
    return {
        id: data.id,
        url: data.url,
        source: data.source,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
    } as Picture;
    }
} catch (error) {
    console.error("Error fetching picture:", error);
    return null;
}
};
  
export default fetchPicture;
  
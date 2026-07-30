import Tesseract from "tesseract.js";

export const extracText = async (imagePath: string) => {
    const result = await Tesseract.recognize(
        imagePath,
        'eng',
        {
            logger: (data) => {
                console.log(data)
            }
        }
    )

    return result.data.text;
}
// pages/api/generate-image.ts
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { n } = req.query;

  if (!n || typeof n !== "string" || isNaN(Number(n))) {
    return res.status(400).json({ error: "Invalid value for n" });
  }

  try {
    // Your logic to generate the image goes here
    // For example, let's just return a placeholder image for simplicity
    const imageUrl = `http://localhost:8000/api/v1/visualization/gauss-legendre-quadrature?n=${n}`;

    // Fetch the image from the external source
    const imageResponse = await fetch(imageUrl);

    if (!imageResponse.ok) {
      return res.status(500).json({ error: "Failed to fetch image" });
    }

    // Convert the response to an array buffer
    const arrayBuffer = await imageResponse.arrayBuffer();

    // Create a Buffer from the ArrayBuffer (for Node.js)
    const buffer = Buffer.from(arrayBuffer);

    // Set the correct content type for the image
    res.setHeader("Content-Type", "image/png");

    // Send the image buffer as the response
    res.send(buffer);
  } catch (error) {
    console.error("Error generating image:", error);
    res.status(500).json({ error: "Error generating image" });
  }
}

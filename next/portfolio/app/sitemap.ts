import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: "https://portfolio.example.com",
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://portfolio.example.com/resume",
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}

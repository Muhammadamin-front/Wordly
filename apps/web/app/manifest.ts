import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Vocora — Ingliz tili so'z boyligi",
    short_name: "Vocora",
    description:
      "Inglizcha so'zlarni o'zbek tilida o'rganing: flashcardlar, o'yinlar, IELTS lug'ati.",
    id: "/uz",
    start_url: "/uz",
    display: "standalone",
    orientation: "portrait",
    background_color: "#071410",
    theme_color: "#071410",
    categories: ["education"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

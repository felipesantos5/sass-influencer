import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT || 3333,
  youtubeApiKey: process.env.YOUTUBE_API_KEY,
  instagramAccessToken: process.env.INSTAGRAM_ACCESS_TOKEN,
  db: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  },
};

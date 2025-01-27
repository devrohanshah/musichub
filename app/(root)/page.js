"use client";
import AlbumCard from "@/components/cards/album";
import ArtistCard from "@/components/cards/artist";
import SongCard from "@/components/cards/song";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { getSongsByQuery, searchAlbumByQuery } from "@/lib/fetch";
import OpenAI from "openai";
import { useEffect, useState } from "react";



// Function to classify Songs
const classifySong = async (songName, artistName) => {
  const prompt = `TYPE OF SONG "${songName}" BY "${artistName}" IDENTIFY FROM THESE CATEGORIES WHICH IS CLOSEST: "BREAKUP", "SAD", "HAPPY", "MOTIVATIONAL". RETURN ONLY ONE WORD.`;
  console.log(prompt);
};

export default function Page() {
  const [latest, setLatest] = useState([]);
  const [popular, setPopular] = useState([]);
  const [albums, setAlbums] = useState([]);

  const getSongs = async (e, type) => {
    const get = await getSongsByQuery(e);
    const data = await get.json();

    console.log("This is the song data before categorization:", data.data.results);

    const songsWithCategory = await Promise.all(
      data.data.results.map(async (song) => {
        const category = await classifySong(song.name, song.artists.primary[0]?.name || "Unknown Artist");
        return {
          ...song,
          category,
        };
      })
    );

    console.log("This is the song data after categorization:", songsWithCategory);

    if (type === "latest") {
      setLatest(songsWithCategory);
    } else if (type === "popular") {
      setPopular(songsWithCategory);
    }
  };

  const getAlbum = async () => {
    const get = await searchAlbumByQuery("latest");
    const data = await get.json();
    setAlbums(data.data.results);
  };

  useEffect(() => {
    getSongs("latest", "latest");
    getSongs("trending", "popular");
    getAlbum();
  }, []);

  return (
    <main className="px-6 py-5 md:px-20 lg:px-32">
      {/* New Releases Section */}
      <div>
        <h1 className="text-base">New Releases</h1>
        <p className="text-xs text-muted-foreground">Top new released songs.</p>
        <ScrollArea className="rounded-md mt-4">
          <div className="flex gap-6">
            {latest.length
              ? latest.map((song) => (
                  <SongCard
                    key={song.id}
                    image={song.image[2]?.url || ""}
                    album={song.album}
                    title={song.name}
                    artist={song.artists.primary[0]?.name || "Unknown Artist"}
                    category={song.category} // Display the category
                    id={song.id}
                  />
                ))
              : Array(10)
                  .fill()
                  .map((_, index) => <SongCard key={index} />)}
          </div>
          <ScrollBar orientation="horizontal" className="hidden" />
        </ScrollArea>
      </div>

      {/* Latest Albums Section */}
      <div className="mt-14">
        <h1 className="text-base">Latest Albums</h1>
        <p className="text-xs text-muted-foreground">Top new released albums.</p>
        <ScrollArea className="rounded-md mt-6">
          <div className="flex gap-6">
            {albums.length
              ? albums.map((album) => (
                  <AlbumCard
                    key={album.id}
                    lang={album.language}
                    image={album.image[2]?.url || ""}
                    album={album.album}
                    title={album.name}
                    artist={album.artists.primary[0]?.name || "Unknown Artist"}
                    id={`album/${album.id}`}
                  />
                ))
              : Array(10)
                  .fill()
                  .map((_, index) => <SongCard key={index} />)}
          </div>
          <ScrollBar orientation="horizontal" className="hidden" />
        </ScrollArea>
      </div>

      {/* Top Artists Section */}
      <div className="mt-12">
        <h1 className="text-base">Top Artists</h1>
        <p className="text-xs text-muted-foreground">Most searched artists this week.</p>
        <ScrollArea className="rounded-md mt-6">
          <div className="flex gap-5">
            {latest.length
              ? [...new Set(latest.map((a) => a.artists.primary[0]?.id))].map((id) => {
                  const artist = latest.find((a) => a.artists.primary[0]?.id === id)?.artists.primary[0];
                  return (
                    <ArtistCard
                      key={id}
                      id={id}
                      image={
                        artist?.image[2]?.url ||
                        `https://az-avatar.vercel.app/api/avatar/?bgColor=0f0f0f0&fontSize=60&text=${artist?.name
                          ?.split("")[0]
                          .toUpperCase() || "UN"}`
                      }
                      name={artist?.name || "Unknown Artist"}
                    />
                  );
                })
              : Array(10)
                  .fill()
                  .map((_, index) => (
                    <div className="grid gap-2" key={index}>
                      <Skeleton className="h-[100px] w-[100px] rounded-2xl" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  ))}
          </div>
          <ScrollBar orientation="horizontal" className="hidden" />
        </ScrollArea>
      </div>

      {/* Trending Songs Section */}
      <div className="mt-12">
        <h1 className="text-base">Trending Songs</h1>
        <p className="text-xs text-muted-foreground">Most played songs this week.</p>
        <ScrollArea className="rounded-md mt-6">
          <div className="flex gap-3">
            {popular.length
              ? popular.map((song) => (
                  <SongCard
                    key={song.id}
                    id={song.id}
                    image={song.image[2]?.url || ""}
                    title={song.name}
                    artist={song.artists.primary[0]?.name || "Unknown Artist"}
                    category={song.category} // Display the category
                  />
                ))
              : Array(10)
                  .fill()
                  .map((_, index) => <SongCard key={index} />)}
          </div>
          <ScrollBar orientation="horizontal" className="hidden" />
        </ScrollArea>
      </div>
    </main>
  );
}

export function getSlotArtist(slot, artists) {
  if (!slot || slot.type === "activity") return undefined;
  return artists.find((artist) =>
    slot.artistId
      ? artist.id === slot.artistId
      : artist.name.trim().toLowerCase() ===
        String(slot.performer || "")
          .trim()
          .toLowerCase(),
  );
}

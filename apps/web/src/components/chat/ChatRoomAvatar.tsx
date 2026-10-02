'use client';

type ChatRoomAvatarProps = {
  imageUrl?: string | null;
  memberProfileUrls?: string[] | null;
  roomName: string;
  chatRoomType: 'TEAM' | 'GROUP' | 'DIRECT';
  sizeClassName?: string;
};

export default function ChatRoomAvatar({
  imageUrl,
  memberProfileUrls,
  roomName,
  chatRoomType,
  sizeClassName = 'h-12 w-12',
}: ChatRoomAvatarProps) {
  const shapeClassName =
    chatRoomType === 'DIRECT' ? 'rounded-full' : 'rounded-xl';

  if (imageUrl) {
    return (
      <div
        className={`relative shrink-0 overflow-hidden bg-[#D6DDE5] ${shapeClassName} ${sizeClassName}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={roomName}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  const profiles = (memberProfileUrls ?? []).filter(Boolean).slice(0, 4);

  if (profiles.length > 3) {
    const tiles = [...profiles, ...Array(4 - profiles.length).fill(null)];

    return (
      <div
        className={`grid shrink-0 grid-cols-2 grid-rows-2 gap-1 ${sizeClassName}`}
      >
        {tiles.map((url, i) => (
          <div key={i} className="overflow-hidden rounded-md bg-[#D6DDE5]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url ?? '/images/default-profile.png'}
              alt={roomName}
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden bg-[#D6DDE5] text-sm font-bold text-[#3F4852] ${shapeClassName} ${sizeClassName}`}
    >
      {roomName.slice(0, 1)}
    </div>
  );
}

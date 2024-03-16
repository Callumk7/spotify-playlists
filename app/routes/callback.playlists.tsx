import { useOutletContext } from "@remix-run/react";

export default function Playlists() {
  const { token, userId } = useOutletContext<{
    token: string;
    userId: string;
  }>();
  return (
    <div>
      <h2>This is the callback.playlist route</h2>
      <p>{token}</p>
      <p>{userId}</p>
    </div>
  );
}

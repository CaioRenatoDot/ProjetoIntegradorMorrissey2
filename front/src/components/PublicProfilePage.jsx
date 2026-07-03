import { Link, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { getPublicProfile } from "../services/api";
import BackButton from "./BackButton";
import UserAvatar from "./UserAvatar";

export default function PublicProfilePage({ username, onBack }) {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchProfile() {
      setIsLoading(true);
      setError("");

      try {
        const data = await getPublicProfile(username);
        if (isMounted) setProfile(data.user);
      } catch (requestError) {
        if (isMounted) setError(requestError.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [username]);

  if (!isLoading && !profile) {
    return (
      <section className="py-8">
        <BackButton onBack={onBack} />
        <p className="mt-4 rounded border border-red-900 bg-red-950/50 px-4 py-3 text-sm font-bold text-red-200">
          {error || "Profile not found."}
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl py-8">
      <BackButton onBack={onBack} />

      {isLoading ? (
        <div className="mt-6 h-40 animate-pulse rounded border border-slate-800 bg-slate-900" />
      ) : (
        <>
          <header className="mt-6 flex items-center gap-5 border-b border-slate-800 pb-8">
            <UserAvatar className="ring-2 ring-slate-700/70" name={profile.displayName} size="lg" />
            <div className="min-w-0">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#00c030]">
                Watchd member
              </p>
              <h1 className="mt-2 truncate text-3xl font-black text-white sm:text-4xl">
                {profile.displayName}
              </h1>
              <p className="mt-1 text-sm font-bold text-slate-500">@{profile.username}</p>
            </div>
          </header>

          <div className="mt-6 space-y-4 text-sm font-semibold leading-6 text-slate-400">
            {(profile.location || profile.website) && (
              <div className="space-y-2">
                {profile.location && (
                  <p className="flex items-center gap-2">
                    <MapPin aria-hidden="true" className="h-4 w-4 text-slate-500" />
                    {profile.location}
                  </p>
                )}
                {profile.website && (
                  <p className="flex min-w-0 items-center gap-2">
                    <Link aria-hidden="true" className="h-4 w-4 flex-none text-slate-500" />
                    <span className="truncate">{profile.website}</span>
                  </p>
                )}
              </div>
            )}
            {profile.bio && <p>{profile.bio}</p>}
          </div>
        </>
      )}
    </section>
  );
}

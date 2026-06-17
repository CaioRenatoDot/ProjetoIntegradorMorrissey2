import { ArrowLeft, Check, Link, MapPin, Save } from "lucide-react";
import { useEffect, useState } from "react";
import UserAvatar from "./UserAvatar";

const maxBioLength = 240;

function getInitialProfile(currentUserName, profileDetails) {
  return {
    displayName: profileDetails?.displayName || currentUserName || "",
    location: profileDetails?.location || "Brazil",
    website: profileDetails?.website || "",
    bio:
      profileDetails?.bio ||
      "Building a shelf of favorite series, recent ratings, and titles saved for later.",
  };
}

export default function EditProfilePage({
  currentUserName,
  isLoggedIn,
  onBack,
  onSave,
  profileDetails,
}) {
  const [form, setForm] = useState(() =>
    getInitialProfile(currentUserName, profileDetails)
  );

  useEffect(() => {
    setForm(getInitialProfile(currentUserName, profileDetails));
  }, [currentUserName, profileDetails]);

  function updateField(field, value) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: field === "bio" ? value.slice(0, maxBioLength) : value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const nextProfile = {
      displayName: form.displayName.trim() || currentUserName,
      location: form.location.trim(),
      bio: form.bio.trim(),
    };

    onSave(nextProfile);
  }

  if (!isLoggedIn) {
    return (
      <section className="mx-auto max-w-3xl py-10">
        <button
          className="inline-flex min-h-9 items-center gap-2 rounded border border-slate-700 px-3 text-sm font-black text-slate-200 transition hover:border-[#00c030] hover:text-white"
          onClick={onBack}
          type="button"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Back
        </button>

        <div className="mt-6 rounded border border-slate-800 bg-slate-950/60 px-5 py-8 text-center">
          <h1 className="text-xl font-black text-white">Sign in required</h1>
          <p className="mt-2 text-sm font-semibold text-slate-400">
            Your profile editor appears after you sign in.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl py-7 sm:py-10">
      <header className="flex flex-col gap-4 border-b border-slate-800 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <button
            className="inline-flex min-h-9 items-center gap-2 rounded border border-slate-700 px-3 text-sm font-black text-slate-200 transition hover:border-[#00c030] hover:text-white"
            onClick={onBack}
            type="button"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Back
          </button>
          <h1 className="mt-5 text-3xl font-black text-white">Edit Profile</h1>
        </div>

        <div className="flex items-center gap-3 text-sm font-semibold text-slate-400">
          <Check aria-hidden="true" className="h-4 w-4 text-[#00c030]" />
          Frontend draft
        </div>
      </header>

      <form className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]" onSubmit={handleSubmit}>
        <div className="space-y-6">
          <section className="rounded border border-slate-800 bg-slate-950/40 p-5">
            <SectionTitle title="Account" />

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                  Display name
                </span>
                <input
                  className="mt-2 min-h-11 w-full rounded border border-slate-700 bg-[#14181c] px-3 text-sm font-semibold text-white outline-none transition placeholder:text-slate-600 focus:border-[#00c030]"
                  maxLength={32}
                  onChange={(event) => updateField("displayName", event.target.value)}
                  value={form.displayName}
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                  Location
                </span>
                <input
                  className="mt-2 min-h-11 w-full rounded border border-slate-700 bg-[#14181c] px-3 text-sm font-semibold text-white outline-none transition placeholder:text-slate-600 focus:border-[#00c030]"
                  maxLength={40}
                  onChange={(event) => updateField("location", event.target.value)}
                  placeholder="Brazil"
                  value={form.location}
                />
              </label>
            </div>
          </section>

          <section className="rounded border border-slate-800 bg-slate-950/40 p-5">
            <SectionTitle title="Bio" />

            <label className="block">
              <span className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                About
              </span>
              <textarea
                className="mt-2 min-h-36 w-full resize-none rounded border border-slate-700 bg-[#14181c] px-3 py-3 text-sm font-semibold leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-[#00c030]"
                maxLength={maxBioLength}
                onChange={(event) => updateField("bio", event.target.value)}
                value={form.bio}
              />
            </label>

            <p className="mt-2 text-right text-xs font-bold text-slate-500">
              {form.bio.length}/{maxBioLength}
            </p>
          </section>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              className="min-h-10 rounded border border-slate-700 px-4 text-sm font-black uppercase tracking-wide text-slate-300 transition hover:border-slate-500 hover:text-white"
              onClick={onBack}
              type="button"
            >
              Cancel
            </button>
            <button
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded border border-[#00c030] bg-[#00c030] px-4 text-sm font-black uppercase tracking-wide text-[#08110a] transition hover:bg-[#32d85a] disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-slate-800 disabled:text-slate-500"
              disabled={!form.displayName.trim()}
              type="submit"
            >
              <Save aria-hidden="true" className="h-4 w-4" />
              Save Changes
            </button>
          </div>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <section className="rounded border border-slate-800 bg-slate-950/50 p-5">
            <SectionTitle title="Preview" />

            <div className="mt-5 flex items-center gap-4">
              <UserAvatar
                className="ring-2 ring-slate-700/70"
                name={form.displayName || currentUserName}
                size="lg"
              />
              <div className="min-w-0">
                <h2 className="truncate text-2xl font-black text-white">
                  {form.displayName || currentUserName}
                </h2>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Watchd member
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-2 text-sm font-semibold text-slate-400">
              {form.location && (
                <p className="flex items-center gap-2">
                  <MapPin aria-hidden="true" className="h-4 w-4 text-slate-500" />
                  {form.location}
                </p>
              )}
              {form.website && (
                <p className="flex min-w-0 items-center gap-2">
                  <Link aria-hidden="true" className="h-4 w-4 flex-none text-slate-500" />
                  <span className="truncate">{form.website}</span>
                </p>
              )}
            </div>

            {form.bio && (
              <p className="mt-5 text-sm font-semibold leading-6 text-slate-400">
                {form.bio}
              </p>
            )}
          </section>
        </aside>
      </form>
    </section>
  );
}

function SectionTitle({ title }) {
  return (
    <header className="mb-4 border-b border-slate-700 pb-2">
      <h2 className="text-sm font-medium uppercase tracking-[0.22em] text-[#9abbd1]">
        {title}
      </h2>
    </header>
  );
}

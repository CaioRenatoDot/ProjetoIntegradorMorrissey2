import { AtSign, ChevronDown, Eye, FileText, Link, Mail, MapPin, Save, Trash2, User } from "lucide-react";
import { useEffect, useState } from "react";
import BackButton from "./BackButton";
import UserAvatar from "./UserAvatar";
import { countries } from "../data/countries";

const maxBioLength = 240;

function getInitialProfile(currentUserName, profileDetails, currentUsername) {
  return {
    displayName: profileDetails?.displayName || currentUserName || "",
    username: currentUsername || "",
    location: profileDetails?.location || "Brazil",
    website: profileDetails?.website || "",
    bio:
      profileDetails?.bio ||
      "Building a shelf of favorite series, recent ratings, and titles saved for later.",
  };
}

const usernameCooldownDays = 30;

export default function EditProfilePage({
  currentUserEmail,
  currentUserName,
  currentUsername,
  usernameChangedAt,
  isLoggedIn,
  isSaving,
  onBack,
  onDeleteAccount,
  onSave,
  profileDetails,
  saveError,
}) {
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [form, setForm] = useState(() =>
    getInitialProfile(currentUserName, profileDetails, currentUsername)
  );

  useEffect(() => {
    setForm(getInitialProfile(currentUserName, profileDetails, currentUsername));
  }, [currentUserName, profileDetails, currentUsername]);

  const daysSinceUsernameChange = usernameChangedAt
    ? (Date.now() - new Date(usernameChangedAt).getTime()) / (1000 * 60 * 60 * 24)
    : null;
  const isUsernameLocked =
    daysSinceUsernameChange !== null && daysSinceUsernameChange < usernameCooldownDays;
  const usernameDaysLeft = isUsernameLocked
    ? Math.ceil(usernameCooldownDays - daysSinceUsernameChange)
    : 0;

  function updateField(field, value) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: field === "bio" ? value.slice(0, maxBioLength) : value,
    }));
  }

  async function handleDeleteClick() {
    if (!window.confirm("Delete your account? All your data (favorites, watchlist, reviews and lists) will be permanently removed.")) {
      return;
    }

    setIsDeleting(true);
    setDeleteError("");

    try {
      await onDeleteAccount(deletePassword);
    } catch (error) {
      setDeleteError(error.message);
      setIsDeleting(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();

    const nextProfile = {
      displayName: form.displayName.trim() || currentUserName,
      username: form.username.trim().toLowerCase(),
      location: form.location.trim(),
      website: form.website.trim(),
      bio: form.bio.trim(),
    };

    onSave(nextProfile);
  }

  if (!isLoggedIn) {
    return (
      <section className="mx-auto max-w-3xl py-10">
        <BackButton onBack={onBack} />

        <div className="rounded border border-slate-800 bg-slate-950/60 px-5 py-8 text-center">
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
      <BackButton onBack={onBack} />

      <header className="flex flex-col gap-5 border-b border-slate-800 pb-6 sm:flex-row sm:items-center">
        <UserAvatar
          className="ring-2 ring-slate-700/70"
          name={form.displayName || currentUserName}
          size="lg"
        />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#00c030]">
            Account settings
          </p>
          <h1 className="mt-1 text-3xl font-black text-white">Edit Profile</h1>
          <p className="mt-1 text-sm font-semibold text-slate-400">
            Update how other members see you on Watchd.
          </p>
        </div>
      </header>

      <form className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]" onSubmit={handleSubmit}>
        <div className="space-y-6">
          <section className="rounded border border-slate-800 bg-slate-950/40 p-5">
            <SectionTitle Icon={User} title="Account" />

            <div className="grid gap-5 sm:grid-cols-2">
              <ProfileField
                Icon={User}
                label="Display name"
                maxLength={32}
                onChange={(event) => updateField("displayName", event.target.value)}
                value={form.displayName}
              />

              <ProfileField
                Icon={AtSign}
                disabled={isUsernameLocked}
                label="Username"
                maxLength={30}
                onChange={(event) => updateField("username", event.target.value)}
                placeholder="your-username"
                title={
                  isUsernameLocked
                    ? `You can change your username again in ${usernameDaysLeft} day${usernameDaysLeft === 1 ? "" : "s"}.`
                    : undefined
                }
                value={form.username}
              />

              <ProfileField
                Icon={Mail}
                disabled
                label="Email"
                value={currentUserEmail || ""}
              />

              <ProfileSelectField
                Icon={MapPin}
                label="Location"
                onChange={(event) => updateField("location", event.target.value)}
                value={form.location}
              />

              <ProfileField
                Icon={Link}
                label="Website"
                maxLength={100}
                onChange={(event) => updateField("website", event.target.value)}
                placeholder="https://yourwebsite.com"
                value={form.website}
              />
            </div>

            <p className="mt-3 text-xs font-semibold text-slate-500">
              Your email is private and can't be changed yet.{" "}
              {isUsernameLocked
                ? `You can change your username again in ${usernameDaysLeft} day${usernameDaysLeft === 1 ? "" : "s"}.`
                : "Your username can only be changed once every 30 days (lowercase letters, numbers and hyphens) and defines your profile URL."}
            </p>
          </section>

          <section className="rounded border border-slate-800 bg-slate-950/40 p-5">
            <SectionTitle Icon={FileText} title="Bio" />

            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
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

          <section className="rounded border border-red-900/50 bg-red-950/10 p-5">
            <SectionTitle Icon={Trash2} title="Danger Zone" />

            <p className="text-sm font-semibold leading-6 text-slate-400">
              Deleting your account permanently removes your favorites,
              watchlist, reviews and lists. This cannot be undone.
            </p>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
              <label className="flex-1">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Confirm your password
                </span>
                <input
                  className="mt-2 min-h-11 w-full rounded border border-slate-700 bg-[#14181c] px-3 text-sm font-semibold text-white outline-none transition placeholder:text-slate-600 focus:border-red-500"
                  onChange={(event) => setDeletePassword(event.target.value)}
                  placeholder="Your current password"
                  type="password"
                  value={deletePassword}
                />
              </label>

              <button
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded border border-red-900/60 px-4 text-sm font-semibold uppercase tracking-wide text-red-300 transition hover:border-red-500 hover:bg-red-500/10 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!deletePassword || isDeleting}
                onClick={handleDeleteClick}
                type="button"
              >
                <Trash2 aria-hidden="true" className="h-4 w-4" />
                {isDeleting ? "Deleting..." : "Delete account"}
              </button>
            </div>

            {deleteError && (
              <p className="mt-3 rounded border border-red-900 bg-red-950/50 px-4 py-3 text-sm font-bold text-red-200">
                {deleteError}
              </p>
            )}
          </section>

          {saveError && (
            <p className="rounded border border-red-900 bg-red-950/50 px-4 py-3 text-sm font-bold text-red-200">
              {saveError}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              className="min-h-10 rounded border border-slate-700 px-4 text-sm font-semibold uppercase tracking-wide text-slate-300 transition hover:border-slate-500 hover:text-white"
              onClick={onBack}
              type="button"
            >
              Cancel
            </button>
            <button
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded bg-[#00c030] px-5 text-sm font-medium uppercase tracking-wide text-white shadow-lg shadow-[#00c030]/10 transition hover:bg-[#32d85a] disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-slate-400 disabled:shadow-none"
              disabled={!form.displayName.trim() || isSaving}
              type="submit"
            >
              <Save aria-hidden="true" className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <section className="overflow-hidden rounded border border-slate-800 bg-slate-950/50">
            <div className="h-1.5 w-full bg-linear-to-r from-[#00c030] to-emerald-700" />

            <div className="p-5">
              <SectionTitle Icon={Eye} title="Live Preview" />

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
                  {form.username && (
                    <p className="mt-1 truncate text-sm font-bold text-slate-500">
                      @{form.username.trim().toLowerCase()}
                    </p>
                  )}
                  <span className="mt-2 inline-block rounded-full bg-slate-800/80 px-3 py-1 text-xs font-bold text-slate-400">
                    Watchd member
                  </span>
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
            </div>
          </section>

          <p className="px-1 text-xs font-semibold leading-5 text-slate-500">
            This is exactly how your profile header will look to other members after you save.
          </p>
        </aside>
      </form>
    </section>
  );
}

function ProfileSelectField({ Icon, label, value, ...selectProps }) {
  const options =
    value && value !== "World" && !countries.includes(value)
      ? [value, "World", ...countries]
      : ["World", ...countries];

  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </span>
      <div className="relative mt-2">
        <Icon
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
        />
        <select
          className="min-h-11 w-full appearance-none rounded border border-slate-700 bg-[#14181c] pl-10 pr-8 text-sm font-semibold text-white outline-none transition focus:border-[#00c030]"
          value={value}
          {...selectProps}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
        />
      </div>
    </label>
  );
}

function ProfileField({ Icon, label, ...inputProps }) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </span>
      <div className="relative mt-2">
        <Icon
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
        />
        <input
          className="min-h-11 w-full rounded border border-slate-700 bg-[#14181c] pl-10 pr-3 text-sm font-semibold text-white outline-none transition placeholder:text-slate-600 focus:border-[#00c030] disabled:cursor-not-allowed disabled:opacity-60"
          {...inputProps}
        />
      </div>
    </label>
  );
}

function SectionTitle({ Icon, title }) {
  return (
    <header className="mb-4 flex items-center gap-2 border-b border-slate-700 pb-2">
      {Icon && <Icon aria-hidden="true" className="h-4 w-4 text-[#9abbd1]" />}
      <h2 className="text-sm font-medium uppercase tracking-[0.22em] text-[#9abbd1]">
        {title}
      </h2>
    </header>
  );
}

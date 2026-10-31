import { Link, ListChecks, MapPin, Plus } from "lucide-react";
import ListPosterStrip from "../ListPosterStrip";
import { EmptyState, ProfileShelfHeader } from "./ProfileShared";

const listPreviewLimit = 3;

export default function ProfileBioPanel({
  currentUserName,
  isListsLoading,
  isPublicView,
  listPreviewImages,
  listsError,
  onListSelect,
  onViewAllLists,
  profileDetails,
  stats,
  userLists,
}) {
  const bio =
    profileDetails?.bio ||
    `${currentUserName} is building a shelf of favorite series, recent ratings, and titles saved for later.`;
  const location = profileDetails?.location || "";
  const website = profileDetails?.website || "";

  return (
    <aside className="space-y-8 lg:pt-[76px]">
      <section>
        <ProfileShelfHeader title="Bio" />
        <div className="space-y-4 text-sm font-semibold leading-6 text-slate-400">
          {(location || website) && (
            <div className="space-y-2">
              {location && (
                <p className="flex items-center gap-2">
                  <MapPin aria-hidden="true" className="h-4 w-4 text-slate-500" />
                  {location}
                </p>
              )}
              {website && (
                <p className="flex min-w-0 items-center gap-2">
                  <Link aria-hidden="true" className="h-4 w-4 flex-none text-slate-500" />
                  {/^https?:\/\//i.test(website) ? (
                    <a
                      className="truncate transition hover:text-white"
                      href={website}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {website.replace(/^https?:\/\//i, "")}
                    </a>
                  ) : (
                    <span className="truncate">{website}</span>
                  )}
                </p>
              )}
            </div>
          )}
          <p>{bio}</p>
        </div>
      </section>

      <section>
        <ProfileShelfHeader title="Profile Stats" />
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl font-black leading-none text-white">
                {stat.value}
              </p>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <ProfileShelfHeader
          title="Created Lists"
          action={
            isPublicView ? null : (
              <button
                className="min-h-8 rounded border border-slate-700 px-3 text-xs font-semibold uppercase tracking-wide text-slate-300 transition hover:border-[#00c030] hover:text-white"
                onClick={onViewAllLists}
                type="button"
              >
                View all
              </button>
            )
          }
        />

        {listsError && (
          <p className="mb-4 rounded border border-red-900 bg-red-950/50 px-4 py-3 text-sm font-bold text-red-200">
            {listsError}
          </p>
        )}

        {isListsLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }, (_, index) => (
              <div className="h-40 animate-pulse rounded border border-slate-800 bg-slate-900" key={index} />
            ))}
          </div>
        ) : userLists.length ? (
          <>
            <div className="space-y-4">
              {userLists.slice(0, listPreviewLimit).map((list) => (
                <button
                  aria-label={`Open list ${list.title}`}
                  className="group block w-full overflow-hidden rounded border border-slate-800 bg-slate-950/60 text-left transition hover:-translate-y-1 hover:border-[#00c030] hover:shadow-lg hover:shadow-black/30"
                  key={list.id}
                  onClick={() => onListSelect(list.id)}
                  type="button"
                >
                  <ListPosterStrip posters={listPreviewImages[list.id]} />

                  <div className="p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {list.category && (
                        <span className="inline-flex h-6 items-center rounded-md border border-white/10 bg-zinc-900/80 px-2 text-[11px] font-medium uppercase tracking-wide text-slate-200 shadow-sm shadow-black/20">
                          {list.category}
                        </span>
                      )}
                      <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                        {list.itemsCount} {list.itemsCount === 1 ? "title" : "titles"}
                      </span>
                    </div>
                    <h3 className="mt-2 truncate text-sm font-semibold text-white">
                      {list.title}
                    </h3>
                    <p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-slate-500">
                      <ListChecks aria-hidden="true" className="h-3.5 w-3.5 text-slate-600" />
                      Created by {currentUserName}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {!isPublicView && userLists.length > listPreviewLimit && (
              <button
                className="mt-4 inline-flex h-8 w-full items-center justify-center gap-1.5 rounded border border-slate-700 text-xs font-semibold uppercase tracking-wide text-slate-300 transition hover:border-[#00c030] hover:text-white"
                onClick={onViewAllLists}
                type="button"
              >
                Show more
                <Plus aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.6} />
              </button>
            )}
          </>
        ) : isPublicView ? (
          <EmptyState
            title="No lists yet"
            description={`${currentUserName} hasn't created any lists yet.`}
          />
        ) : (
          <div className="group relative overflow-hidden rounded border border-slate-800 bg-slate-950/60 px-4 py-6 text-center">
            <div className="relative mx-auto h-12 w-12">
              <span
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-[#00c030] transition-transform duration-1250 ease-in-out group-hover:scale-[16]"
              />
              <button
                aria-label="Create your own list"
                className="relative z-10 grid h-12 w-12 place-items-center rounded-full text-white"
                onClick={onViewAllLists}
                type="button"
              >
                <Plus aria-hidden="true" className="h-5 w-5" strokeWidth={2.6} />
              </button>
            </div>
            <p className="relative z-10 mt-3 text-xs font-semibold uppercase tracking-wide text-slate-300 transition-colors duration-500 group-hover:text-white">
              Create your own list
            </p>
            <p className="relative z-10 mt-3 text-sm font-semibold text-slate-400 transition-colors duration-500 group-hover:text-white/80">
              You don't have any lists yet
            </p>
          </div>
        )}

      </section>
    </aside>
  );
}

import { useMemo } from "react";
import BackButton from "./BackButton";
import ListCard from "./ListCard";
import { getListsByCreator } from "../data/communityLists";

export default function MyListsPage({ currentUserName, onBack, onListSelect }) {
  const userLists = useMemo(() => getListsByCreator(currentUserName), [currentUserName]);

  return (
    <section className="py-8 sm:py-12">
      <BackButton onBack={onBack} />

      <header className="mb-8 border-b border-slate-800 pb-8">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-[#00c030]">
          Your lists
        </p>
        <h1 className="mt-3 text-3xl font-black text-white sm:text-5xl">
          Created Lists
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
          Every collection created by this profile, in one place.
        </p>
      </header>

      {userLists.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {userLists.map((list) => (
            <ListCard key={list.id} list={list} onSelect={onListSelect} />
          ))}
        </div>
      ) : (
        <div className="rounded border border-slate-800 bg-slate-950 px-5 py-10 text-center">
          <h2 className="text-lg font-black text-white">No created lists yet</h2>
          <p className="mt-2 text-sm text-slate-400">
            This profile does not have created lists in the frontend mock data yet.
          </p>
        </div>
      )}
    </section>
  );
}

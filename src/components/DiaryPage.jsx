import { CalendarDays, Star } from "lucide-react";
import HomeFooter from "./HomeFooter";

const diaryLogs = [
  {
    id: 1,
    date: "May 24",
    user: "Caio",
    action: "reviewed",
    title: "Breaking Bad",
    rating: 5,
    note: "Gostei muito da série. Foi tensa do começo ao fim e me deixou com vontade de continuar assistindo.",
  },
  {
    id: 2,
    date: "May 26",
    user: "SamuelMorrissey",
    action: "reviewed",
    title: "Rick and Morty",
    rating: 4,
    note: "A série é bem confusa às vezes, mas isso faz parte da graça. Tem muitos momentos engraçados e personagens interessantes, mesmo que a qualidade varie bastante entre os episódios.",
  },
  {
    id: 3,
    date: "May 26",
    user: "SamuelMorrissey",
    action: "reviewed",
    title: "Mindhunter",
    rating: 5,
    note: "Achei a série muito bem feita. O clima é pesado, mas prende bastante e dá vontade de ver mais um episódio.",
  },
  {
    id: 4,
    date: "May 27",
    user: "Caio",
    action: "reviewed",
    title: "The Office",
    rating: 5,
    note: "Gosto muito do humor e dos personagens. Mesmo sendo simples, sempre melhora meu dia.",
  },
  {
    id: 5,
    date: "May 27",
    user: "Caio",
    action: "reviewed",
    title: "Sherlock",
    rating: 4,
    note: "Achei bem inteligente e divertida de acompanhar. Algumas partes são exageradas, mas isso também deixa a série marcante.",
  },
];

export default function DiaryPage({ currentUserName, isLoggedIn }) {
  const userLogs = diaryLogs.filter((log) => log.user === currentUserName);
  const groupedLogs = groupLogsByDate(userLogs);

  return (
    <section id="diary" className="py-8 sm:py-12">
      <header className="mb-8 border-b border-slate-800 pb-8">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-[#00c030]">
          Diary
        </p>
        <h1 className="mt-3 text-3xl font-black text-white sm:text-5xl">
          User Activity Log
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
          A mocked timeline showing recent actions from the signed-in user.
        </p>
      </header>

      {!isLoggedIn ? (
        <EmptyState
          description="Sign in with one of the demo accounts to see its activity logs."
          title="You need to be signed in"
        />
      ) : groupedLogs.length ? (
        <div className="space-y-8">
          {groupedLogs.map((group) => (
            <section className="space-y-3" key={group.date}>
              <div className="flex items-center gap-2 text-sm font-black text-[#00c030]">
                <CalendarDays className="h-4 w-4" strokeWidth={2.4} />
                <h2>{group.date}</h2>
              </div>

              <div className="divide-y divide-slate-800 overflow-hidden rounded border border-slate-800 bg-slate-950 shadow-xl shadow-black/20">
                {group.logs.map((log) => (
                  <article
                    className="grid gap-4 p-5 sm:grid-cols-[48px_1fr]"
                    key={log.id}
                  >
                    <div className="grid h-8 w-8 place-items-center rounded-full border border-slate-700 bg-slate-900 text-sm font-black text-[#00c030]">
                      {log.sequence}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="text-lg font-black text-white">
                          {log.user} {log.action} {log.title}
                        </h3>
                        <StarRating rating={log.rating} />
                      </div>

                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        {log.note}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <EmptyState
          description="This user does not have any activity logs."
          title="No logs yet"
        />
      )}
    </section>
  );
}

function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5 text-[#00c030]" aria-label={`${rating} stars`}>
      {Array.from({ length: 5 }, (_, index) => {
        const isSelected = index < rating;

        return (
          <Star
            fill={isSelected ? "currentColor" : "none"}
            key={index}
            size={18}
          />
        );
      })}
    </div>
  );
}

function EmptyState({ description, title }) {
  return (
    <div className="rounded border border-slate-800 bg-slate-950 px-5 py-10 text-center">
      <h2 className="text-lg font-black text-white">{title}</h2>
      <p className="mt-2 text-sm text-slate-400">{description}</p>
    </div>
  );
}

function groupLogsByDate(logs) {
  const groups = new Map();

  logs.forEach((log) => {
    if (!groups.has(log.date)) {
      groups.set(log.date, []);
    }

    const dateLogs = groups.get(log.date);
    dateLogs.push({
      ...log,
      sequence: dateLogs.length + 1,
    });
  });

  return Array.from(groups, ([date, dateLogs]) => ({
    date,
    logs: dateLogs,
  }));
}

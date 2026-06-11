export const communityLists = [
  {
    id: 1,
    title: "Series to Watch at Night",
    creator: "Marina Lopes",
    category: "Suspense",
    items: [
      { name: "Dark", search: "Dark" },
      { name: "Mindhunter", search: "Mindhunter" },
      { name: "The Night Of", search: "The Night Of" },
      { name: "True Detective", search: "True Detective" },
    ],
  },
  {
    id: 2,
    title: "Horror Series for the Weekend",
    creator: "Rafael Costa",
    category: "Horror",
    items: [
      { name: "The Haunting of Hill House", search: "The Haunting of Hill House" },
      { name: "Marianne", search: "Marianne" },
      { name: "Archive 81", search: "Archive 81" },
      { name: "Penny Dreadful", search: "Penny Dreadful" },
    ],
  },
  {
    id: 3,
    title: "Short Series to Binge",
    creator: "Bianca Nunes",
    category: "Miniseries",
    items: [
      { name: "Chernobyl", search: "Chernobyl" },
      { name: "When They See Us", search: "When They See Us" },
      { name: "Maid", search: "Maid" },
      { name: "The Queen's Gambit", search: "The Queen's Gambit" },
    ],
  },
  {
    id: 4,
    title: "TV Classics to Watch at Least Once",
    creator: "Andre Silva",
    category: "Classics",
    items: [
      { name: "Breaking Bad", search: "Breaking Bad" },
      { name: "The Sopranos", search: "The Sopranos" },
      { name: "The Wire", search: "The Wire" },
      { name: "Mad Men", search: "Mad Men" },
    ],
  },
  {
    id: 5,
    title: "Light Comedies to Relax",
    creator: "Luiza Martins",
    category: "Comedy",
    items: [
      { name: "The Office", search: "The Office" },
      { name: "Brooklyn Nine-Nine", search: "Brooklyn Nine-Nine" },
      { name: "Parks and Recreation", search: "Parks and Recreation" },
      { name: "Modern Family", search: "Modern Family" },
    ],
  },
  {
    id: 6,
    title: "Animated Series with Great Stories",
    creator: "Caio Henrique",
    category: "Animation",
    items: [
      { name: "Arcane", search: "Arcane" },
      { name: "Avatar: The Last Airbender", search: "Avatar: The Last Airbender" },
      { name: "BoJack Horseman", search: "BoJack Horseman" },
      { name: "Castlevania", search: "Castlevania" },
    ],
  },
];

export function getCommunityListById(listId) {
  return communityLists.find((list) => list.id === listId) || null;
}

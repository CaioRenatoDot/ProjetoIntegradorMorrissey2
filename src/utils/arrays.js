export function getRandomItems(items, quantity) {
  return [...items].sort(() => Math.random() - 0.5).slice(0, quantity);
}

export function shuffleItems(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

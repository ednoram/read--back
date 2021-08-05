const processTitle = (title: string): string => {
  return title
    .trim()
    .replace(/\s\s+/g, " ")
    .split(" ")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
};

export default processTitle;

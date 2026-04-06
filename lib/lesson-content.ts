/**
 * Split markdown lesson content into: tagline (lead), main teaching body,
 * optional task/assignment block, and inline @youtube:VIDEO_ID lines.
 */
export type ParsedLessonContent = {
  tagline: string | null;
  mainBody: string;
  taskBody: string;
  inlineYoutubeIds: string[];
};

const TASK_HEADING = /^##\s*(Task|Assignment)\b/i;

export function parseLessonContent(raw: string): ParsedLessonContent {
  const lines = raw.split("\n");
  let i = 0;
  while (i < lines.length && lines[i].trim() === "") i++;

  const inlineYoutubeIds: string[] = [];
  const takeYoutube = (line: string) => {
    if (line.startsWith("@youtube:")) {
      const id = line.slice("@youtube:".length).trim();
      if (id) inlineYoutubeIds.push(id);
      return true;
    }
    return false;
  };

  if (lines[i]?.startsWith("# ")) i++;
  while (i < lines.length && lines[i].trim() === "") i++;

  const taglineParts: string[] = [];
  while (i < lines.length) {
    const line = lines[i];
    if (takeYoutube(line)) {
      i++;
      continue;
    }
    if (line.startsWith("##")) break;
    taglineParts.push(line);
    i++;
  }

  const tagline = taglineParts.join("\n").trim() || null;

  const rest: string[] = [];
  while (i < lines.length) {
    const line = lines[i];
    if (takeYoutube(line)) {
      i++;
      continue;
    }
    rest.push(line);
    i++;
  }

  let taskIdx = -1;
  for (let j = 0; j < rest.length; j++) {
    if (TASK_HEADING.test(rest[j].trim())) {
      taskIdx = j;
      break;
    }
  }

  let mainBody: string;
  let taskBody: string;
  if (taskIdx >= 0) {
    mainBody = rest.slice(0, taskIdx).join("\n").trim();
    taskBody = rest.slice(taskIdx).join("\n").trim();
  } else {
    mainBody = rest.join("\n").trim();
    taskBody = "";
  }

  return { tagline, mainBody, taskBody, inlineYoutubeIds };
}

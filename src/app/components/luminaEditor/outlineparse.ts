import { JSONContent } from "@tiptap/react";

type Bullet = {
  text: string;
  author: "USER" | "LLM";
  subbullets?: Bullet[];
};

export function parseOutlineJson(json: JSONContent): Bullet[] {
  function parseListItem(item: JSONContent): Bullet {
    const textContent = item.content?.[0]?.content?.[0]?.text || "";
    const colorAttr = item.content?.[0]?.content?.[0]?.marks?.[0]?.attrs?.color;
    const author: "USER" | "LLM" = colorAttr ? "LLM" : "USER";

    const bullet: Bullet = { text: textContent, author };

    // Check for nested bullet list
    const nestedBulletList = item.content?.find(
      (c: JSONContent) => c.type === "bulletList"
    );
    if (nestedBulletList?.content) {
      bullet.subbullets = nestedBulletList.content.map(parseListItem);
    }

    return bullet;
  }

  if (!json.content || !json.content[0].content) return [];
  return json.content[0].content.map(parseListItem);
}

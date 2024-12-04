import { JSONContent } from "@tiptap/react";

export type Bullet = {
  text: string;
  author: "USER" | "LLM";
  subbullets?: Bullet[];
};

export const countUserBullets = (outline: Bullet[]): number => {
  const countBullets = (bullets: Bullet[]): number => {
    return bullets.reduce((count, bullet) => {
      const isUser = bullet.author === "USER" ? 1 : 0;
      const subbulletsCount = bullet.subbullets
        ? countBullets(bullet.subbullets)
        : 0;
      return count + isUser + subbulletsCount;
    }, 0);
  };

  return countBullets(outline);
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

export function generateOutlineJson(bullets: Bullet[]): JSONContent {
  function generateListItem(bullet: Bullet): JSONContent {
    const textNode: JSONContent = {
      type: "text",
      text: bullet.text,
      marks:
        bullet.author === "LLM"
          ? [{ type: "textStyle", attrs: { color: "rgb(149, 141, 241)" } }]
          : [],
    };

    const paragraphNode: JSONContent = {
      type: "paragraph",
      content: bullet.text ? [textNode] : undefined,
    };

    const listItemNode: JSONContent = {
      type: "listItem",
      content: [paragraphNode],
    };

    if (bullet.subbullets && bullet.subbullets.length > 0) {
      const nestedBulletList: JSONContent = {
        type: "bulletList",
        content: bullet.subbullets.map(generateListItem),
      };
      listItemNode.content!.push(nestedBulletList);
    }

    return listItemNode;
  }

  return {
    type: "doc",
    content: [
      {
        type: "bulletList",
        content: bullets.map(generateListItem),
      },
    ],
  };
}

"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import Bold from "@tiptap/extension-bold";
import { Color } from "@tiptap/extension-color";
import BulletList from "@tiptap/extension-bullet-list";
import Document from "@tiptap/extension-document";
import ListItem from "@tiptap/extension-list-item";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import "./tiptapStyles.css";
import TextStyle from "@tiptap/extension-text-style";
import { KeyboardEventHandler } from "react";
import { parseOutlineJson } from "./outlineparse";

const OutlineEditor = () => {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      BulletList,
      ListItem,
      Bold,
      TextStyle,
      Color,
    ],
    content: `
        <ul>
          <li><span style="color: #958DF1">A list item</span></li>
          <li>And another one</li>
        </ul>
        `,
    immediatelyRender: false,
  });

  const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === "Enter") {
      console.log("Enter key pressed");
      const outline = editor?.getJSON();
      console.log(parseOutlineJson(outline || {}));
    }
  };

  return (
    <div
      className="min-h-[40vh] w-full border p-8 border-gray-300 rounded-lg"
      onClick={() => editor?.commands.focus("end")}
    >
      <EditorContent
        editor={editor}
        width={"full"}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};

export default OutlineEditor;

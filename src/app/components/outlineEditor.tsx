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
  });

  return <EditorContent editor={editor} />;
};

export default OutlineEditor;

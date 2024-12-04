import OutlineEditor from "./components/luminaEditor/outlineEditor";

export default function Home() {
  return (
    <div className="items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 items-start w-full max-w-[100em]">
        <h1 className="text-4xl font-bold text-center sm:text-left">Lumina</h1>
        <div className="text-md text-center sm:text-left text-gray-600">
          <p>
            Lumina is a simple and powerful brainstorming tool for college
            application essays. Lumina pushes you to reflect more deeply and
            concretely, and directs you share the parts of your story that
            matter most. For best results, answer the questions with 2-3
            sentence responses, adding as much detail as possible. When you
            press enter, our system will ask you follow up questions. Feel free
            to go in any order, and skip questions as desired.
          </p>
          <br />
          <p>
            Lumina is a work in progress. It is currently in alpha and is
            missing many features. If you have any feedback, please let us know!
          </p>
        </div>
        <OutlineEditor />
      </main>
    </div>
  );
}

import OutlineEditor from "./components/outlineEditor";

export default function Home() {
  return (
    <div className="items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 items-start w-full max-w-[100em] pt-36">
        <h1 className="text-4xl font-bold text-center sm:text-left">Lumina</h1>
        <OutlineEditor />
      </main>
    </div>
  );
}

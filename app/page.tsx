import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { redirect } from "next/navigation";

function extractArxivId(arxivUrl: string) {
  const regex = /arxiv\.org\/abs\/(\d{4}\.\d{4,5})/i;
  const match = arxivUrl.match(regex);

  return match ? match[1] : null;
}

export default async function Home() {
  async function action(formData: FormData) {
    'use server'

    const url = formData.get('url') as string
    const id = extractArxivId(url)

    redirect(`/paper/${id}`)
  }


  return (
    <form action={action}>
      <div className="flex max-w-screen-sm w-full mx-auto border-border border p-1 rounded-lg">
    <Input
      name="url"
      className="rounded-none border-none shadow-none focus-visible:ring-0 text-base"
      placeholder="Enter an arXiv URL"
    />
    <Button
      type="submit"
      className="rounded-lg focus-visible:ring-offset-2"
    >
      Convert
    </Button>
  </div>
    </form>
  )
}
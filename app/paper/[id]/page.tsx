import { Paper, Section, Reference, Author } from "@/lib/types";
import { fetcher } from "@/lib/utils";

interface PaperProps {
    params: { id: string }
}

async function fetchPaper(id: string): Promise<Paper> {
    const serverURL = 'http://localhost:8080';
    const res = await fetcher(`${serverURL}/arxiv/${id}`, {
        cache: 'no-cache'
    });
    return res as Paper;
}

export default async function Paper({
    params
}: PaperProps) {
    const paperId = params.id.replaceAll('.', '_')
    const paper = await fetchPaper(paperId);
    return (
        <article className='mx-auto prose prose-xl prose-slate dark:prose-invert'>
            <h2 className='text-center'>{paper.title}</h2>
            <div className='flex flex-wrap gap-4 justify-center'>
                {paper.authors.map((author) => (
                    <span key={author.name} className='flex justify-center text-sm font-semibold'>
                        {author.name}
                    </span>
                ))}
            </div>
            <h4 className="text-center">Abstract</h4>
            <p className='text-justify'>{paper.abstract}</p>
            <Sections sections={paper.sections} />
            <h3>References</h3>
            <References refs={paper.references} />
        </article>
    )
}

interface SectionsProps {
    sections: Section[]
}

function Sections({ sections }: SectionsProps) {
    return (
        <div>
            {sections.map((section, idx) => (
                <Section key={idx} section={section} />
            ))}
        </div>
    )

}


interface SectionProps {
    section: Section
}

function Section({ section }: SectionProps) {
    return (
        <section>
            <h3 className='flex gap-4'>
                <span>{section.title}</span>
            </h3>
            {section.paragraphs.map((paragraph, idx) => (
                <p key={idx} className='text-justify'>
                    {paragraph.text}
                </p>
            ))}
        </section>
    )
}

interface ReferencesProps {
    refs: Reference[]
}

function References({ refs }: ReferencesProps) {
    return (
        <div className='text-base'>
            {refs.map((ref, idx) => {
                if (ref.title == '') return null
                const authorsNames = ref.authors.map((author) => author.name).join(', ')
                return (
                    <p key={idx} className='space-x-2'>
                        <span>{joinNames(ref.authors)}.</span>
                        <span>{ref.title}.</span>
                    </p>
                )
            })}
        </div>
    )
}

function joinNames(authors: Author[]): string {
    let str = authors.slice(0, authors.length - 1).map((author) => author.name).join(', ')

    if (authors.length > 1) {
        str += ' and '
        str += authors[authors.length - 1].name
    }

    return str
}
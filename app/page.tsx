type Author = {
  FirstName?: string
  LastName?: string
  name: string
  email?: string
}

type Title = {
  text: string
  number: string
}

type Section = {
  title: Title
  content: string
}

type Reference = {
  title: string
  authors: Author[]
  year: number
  conference: string
}

type Paper = {
  title: string
  abstract: string
  authors: Author[],
  sections: Section[],
  references: Reference[]
}

function readReferences(filename: string): Reference[] {
  const references: Reference[] = require(`./references.json`)
  return references
}

const vitPaper: Paper = {
  title: 'An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale',
  abstract: `While the Transformer architecture has become the de-facto standard for natural language processing tasks, its applications to computer vision remain limited. In vision, attention is either applied in conjunction with convolutional networks, or used to replace certain components of convolutional networks while keeping their overall structure in place. We show that this reliance on CNNs is not necessary and a pure transformer applied directly to sequences of image patches can perform very well on image classification tasks. When pre-trained on large amounts of data and transferred to multiple mid-sized or small image recognition benchmarks (ImageNet, CIFAR-100, VTAB, etc.), Vision Transformer (ViT) attains excellent results compared to state-of-the-art convolutional networks while requiring substantially fewer computational resources to train.`,
  authors: [{ name: 'Alexey Dosovitskiy' }, { name: 'Lucas Beyer' }, { name: 'Alexander Kolesnikov' }, { name: 'Dirk Weissenborn' }, { name: 'Xiaohua Zhai' }, { name: 'Thomas Unterthiner' }, { name: 'Mostafa Dehghani' }, { name: 'Matthias Minderer' }, { name: 'Georg Heigold' }, { name: 'Sylvain Gelly' }, { name: 'Jakob Uszkoreit' }, { name: 'Neil Houlsby' }],
  sections: [
    {
      title: {
        number: '1',
        text: 'Introduction'
      },
      content: ''
    },
  ],
  references: readReferences('references.json')
}

export default function Home() {
  const paper = vitPaper;
  return (
    <article className='mx-auto prose prose-xl prose-slate '>
      <h2 className='text-center'>{paper.title}</h2>
      <div className='flex flex-wrap gap-4 justify-center'>
        {paper.authors.map((author) => (
          <span key={author.name} className='flex justify-center text-sm font-semibold'>
            {author.name}
          </span>
        ))}
      </div>
      <p className='text-justify'>{paper.abstract}</p>
      {/* {paper.sections.map((section, idx) => (
        <Section key={idx} section={section} />
      ))} */}

      <h3>References</h3>
      <References refs={paper.references} />
    </article>
  )
}

interface SectionProps {
  section: Section
}

function Section({ section }: SectionProps) {
  return (
    <section>
      <h3 className='flex gap-4'>
        <span>{section.title.number}</span>
        <span>{section.title.text}</span>
      </h3>
      <p>{section.content}</p>
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
        const authorsNames = ref.authors.map(author => authorDescription(author)).join(', ')
        return (
          <p key={idx} className='space-x-2'>
            <span>{authorsNames}.</span>
            <span>{ref.title}.</span>
          </p>
        )
      })}
    </div>
  )
}

function authorDescription(author: Author): string {
  const name = `${author.FirstName} ${author.LastName}`
  if (name.trim() == '') return ''
  if (author.email == undefined) return name
  return ''
}

function RefAuthors({ authors }: { authors: Author[] }) {
  return (
    <div className='flex flex-wrap gap-4'>
      {authors.map((author, idx) => (
        <span key={idx} className='flex gap-4'>
          {authorDescription(author)}
        </span>
      ))}
    </div>
  )
}
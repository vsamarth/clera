export type Author = {
    name: string
    email?: string
  }
  
 export  type Title = {
    text: string
    number: string
  }
  
  export type Section = {
    title: string
    paragraphs: Paragraph[]
  }

  export type Paragraph = {
    text: string
  }
  
  export type Reference = {
    title: string
    authors: Author[]
    year: number
    conference: string
  }
  
  export type Paper = {
    title: string
    abstract: string
    authors: Author[],
    sections: Section[],
    references: Reference[]
  }

export type Author = {
    name: string
    email?: string
  }
  
 export  type Title = {
    text: string
    number: string
  }
  
  export type Section = {
    title: Title
    content: string
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

  export async function fetchPaper(id: string): Promise<Paper> {
    const serverUrl = 'http://localhost:8080'
  
    const response = await fetch(`${serverUrl}/arxiv/${id}`)
    const data: Paper = await response.json()
  
    return data
  }
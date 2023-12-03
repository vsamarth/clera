package parser

import (
	"bytes"
	"encoding/xml"
	"io"
	"mime/multipart"
	"net/http"
)

const (
	grobidURL = "https://kermitt2-grobid.hf.space/api/processFulltextDocument"
)

type Author struct {
	Name string `json:"name"`
	Email string `json:"email,omitempty"`
}

type Reference struct {
	ID string `json:"id"`
	Title string `json:"title"`
	Authors []Author `json:"authors"`
	Year string `json:"year"`
}

type Paper struct {
	ID string `json:"id"`
	Title string `json:"title"`
	Abstract string `json:"abstract"`
	Authors []Author `json:"authors"`
	References []Reference `json:"references"`
}

func makeRequest(reader io.Reader) (*http.Response, error) {
	var requestBody bytes.Buffer
	writer := multipart.NewWriter(&requestBody)
	part, err := writer.CreateFormFile("input", "input.pdf")
	if err != nil {
		return nil, err
	}
	if _,err := io.Copy(part, reader); err != nil {
		return nil, err
	}
	writer.Close()

	req, err := http.NewRequest("POST", grobidURL, &requestBody)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", writer.FormDataContentType())
	req.Header.Set("Accept", "application/xml")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	return resp, nil
}

type parsePaper struct {
	XMLName xml.Name
	Title    string   `xml:"teiHeader>fileDesc>titleStmt>title"`
	Abstract string   `xml:"teiHeader>profileDesc>abstract>div>p"` 
	Authors []parseAuthor  `xml:"teiHeader>fileDesc>sourceDesc>biblStruct>analytic>author"`
	References []parseReference `xml:"text>back>div>listBibl>biblStruct"`
}

type parseReference struct {
	ID string `xml:"xml:id,attr"`
	Analytic parseAnalytic `xml:"analytic"`
	Monogr parseMonogr `xml:"monogr"`
}

func (r *parseReference) Title() string {
	if r.Analytic.Title != "" {
		return r.Analytic.Title
	}
	return r.Monogr.Title
}

func (r *parseReference) Authors() []Author {
	pa := make([]parseAuthor, len(r.Analytic.Authors)+len(r.Monogr.Authors))
	copy(pa, r.Analytic.Authors)
	copy(pa[len(r.Analytic.Authors):], r.Monogr.Authors)

	authors := make([]Author, len(pa))

	for i, author := range pa {
		authors[i] = Author{
			Name:  author.FullName(),
			Email: author.Email,
		}	}

	return authors
}

type parseAnalytic struct {
	Title string `xml:"title"`
	Authors []parseAuthor `xml:"author"`
}

type parseMonogr struct {
	Title string `xml:"title"`
	Authors []parseAuthor `xml:"author"`
	Year string `xml:"imprint>date"`
}

type parseAuthor struct {
	FirstName string `xml:"persName>forename"`
	LastName  string `xml:"persName>surname"`
	Email     string `xml:"email"`
}

func (a *parseAuthor) FullName() string {
	return a.FirstName + " " + a.LastName
}

func Parse(r io.Reader) (Paper, error) {
	resp, err := makeRequest(r)
	if err != nil {
		return Paper{}, err
	}

	body := resp.Body
	defer body.Close()


	var paper parsePaper

	if err := xml.NewDecoder(body).Decode(&paper); err != nil && err != io.EOF {
		return Paper{}, err
	}

	
	authors := make([]Author, len(paper.Authors))
	for i, author := range paper.Authors {
		authors[i] = Author{
			Name:  author.FullName(),
			Email: author.Email,
		}
	}

	references := make([]Reference, len(paper.References))
	for i, reference := range paper.References {
		references[i] = Reference{
			Title: reference.Title(),
			Authors: reference.Authors(),
			Year: reference.Monogr.Year,
		}
	}

	return Paper{
		Title: paper.Title,
		Abstract: paper.Abstract,
		Authors: authors,
		References: references,
	}, nil
}
package main

import (
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"net/netip"
	"os"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/render"
	"github.com/lmittmann/tint"
	"github.com/vsamarth/clera/server/parser"
)

type Paper struct {
	ID string `json:"id"`
}

func (p *Paper) Render(w http.ResponseWriter, r *http.Request) error {
	return nil
}

var logger *slog.Logger

func init() {
	logger = slog.New(tint.NewHandler(os.Stderr, nil))
}

func main() {
	router := chi.NewRouter()

	registerMiddlewares(router)

	registerHandlers(router)

	startServer(router, netip.MustParseAddrPort("127.0.0.1:8080"))
}

func registerMiddlewares(router chi.Router) {
	router.Use(middleware.RequestID)
	router.Use(middleware.RealIP)
	router.Use(middleware.Logger)
	router.Use(middleware.Recoverer)
	router.Use(middleware.URLFormat)
	router.Use(middleware.Heartbeat("/ping"))
	router.Use(render.SetContentType(render.ContentTypeJSON))
}

func registerHandlers(router chi.Router) {
	router.Get("/arxiv/{id}", getArxiv)
}

func startServer(router chi.Router, address netip.AddrPort) {
	server := http.Server{
		Addr:    address.String(),
		Handler: router,
	}

	logger.Info("starting server", "address", address)

	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		logger.Error("unable to start server", "error", err)
		panic("could not start server")
	}
}

func getArxiv(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	// replace underscores with dots
	id = strings.ReplaceAll(id, "_", ".")

	logger.Info("request", "id", id)

	response, err := fetchPaper(id)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		render.JSON(w, r, map[string]string{
			"error": "not found",
		})
		return
	}

	defer response.Close()

	paper, err := parser.Parse(response)

	if err != nil {
		logger.Error("unable to parse paper", "error", err)
		w.WriteHeader(http.StatusInternalServerError)
		render.JSON(w, r, map[string]string{
			"error": "internal server error",
		})
		return
	}

	paper.ID = fmt.Sprintf("arxiv:%s", id)
	render.JSON(w, r, paper)

}

func fetchPaper(id string) (paper io.ReadCloser, err error) {
	url := fmt.Sprintf("https://arxiv.org/pdf/%s.pdf", id)

	logger.Info("fetching paper", "url", url)

	res, err := http.Get(url)

	if err != nil {
		logger.Error("unable to fetch paper", "error", err)
		return
	}

	contentType := res.Header.Get("Content-Type")
	status := res.StatusCode

	logger.Info("fetched paper", "status", status, "content-type", contentType)
	if status != 200 || contentType != "application/pdf" {
		logger.Error("unable to fetch paper", "status", status, "content-type", contentType)
		return nil, fmt.Errorf("unable to fetch paper")
	}

	return res.Body, nil
}


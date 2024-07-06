package home

import (
	"context"
	"net/http"
	"server/utils/successPage"
)

type SuccessPageData struct {
	Title   string
	Message string
}

func Home(w http.ResponseWriter, r *http.Request) {
	data := SuccessPageData{
		Title:   "Deployment Success",
		Message: "The server has been successfully deployed.",
	}
	component := successPage.SuccessPage(data.Title, data.Message)
	component.Render(context.Background(), w)
}

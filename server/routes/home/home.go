package home

import (
	"fmt"
	"net/http"
)

func Home(w http.ResponseWriter, r *http.Request) {
	fmt.Println("hello")
	if r.Method == "GET" {
		fmt.Fprintf(w, "Home route")
	}

}

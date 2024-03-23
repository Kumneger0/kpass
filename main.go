package main

import (
	"fmt"
	"log"
	"net/http"
	"server/routes/passwords"
	"server/routes/users"
)

func main() {

	mux := http.NewServeMux()

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {

		fmt.Fprintf(w, "Home route")
	})
	mux.HandleFunc("/users/new", users.CreateNewUser)
	mux.HandleFunc("/users", users.GetUsers)
	mux.HandleFunc("/passwords/{id}", passwords.GetPasswords)
	mux.HandleFunc("/passwords/new/{id}", passwords.NewPassword)
	fmt.Print("server running on port ", 8080)

	log.Fatal(http.ListenAndServe(":8080", mux))

}

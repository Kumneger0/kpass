package main

import (
	"fmt"
	"github.com/joho/godotenv"
	"github.com/rs/cors"
	"log"
	"net/http"
	"server/routes/passwords"
	"server/routes/users"
)

func main() {

	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	mux := http.NewServeMux()
	mux.HandleFunc("POST /users/new", users.SingUp)
	mux.HandleFunc("POST /users/login", users.LoginIn)
	mux.HandleFunc("GET /users", users.GetUsers)
	mux.HandleFunc("GET /passwords", passwords.GetPasswords)
	mux.HandleFunc("POST /passwords/new", passwords.NewPassword)
	mux.HandleFunc("PUT /passwords/update/{id}", passwords.UpdatePassword)
	mux.HandleFunc("DELETE /passwords/delete/{id}", passwords.DeletePassword)
	fmt.Println("server running on port ", 8080)

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("kpass server"))
	})

	handler := cors.AllowAll().Handler(mux)
	log.Fatal(http.ListenAndServe(":8080", handler))

}

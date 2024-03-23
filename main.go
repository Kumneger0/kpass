package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"server/routes/passwords"
	"server/routes/users"

	"github.com/joho/godotenv"
)

func main() {

	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	JWT_SECRET := os.Getenv("JWT_SECRET")

	fmt.Printf("JWT_SECRET, %s", JWT_SECRET)

	mux := http.NewServeMux()

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {

		fmt.Fprintf(w, "Home route")
	})
	mux.HandleFunc("/users/new", users.SingUp)
	mux.HandleFunc("/users/login", users.LoginIn)
	mux.HandleFunc("/users", users.GetUsers)
	mux.HandleFunc("/passwords", passwords.GetPasswords)
	mux.HandleFunc("/passwords/new/{id}", passwords.NewPassword)
	fmt.Println("server running on port ", 8080)

	log.Fatal(http.ListenAndServe(":8080", mux))

}

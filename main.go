package main

import (
	"fmt"
	"html"
	"log"
	"net/http"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Username  string
	FirstName string
	LastName  string
	Passwords []Password `gorm:"foreignKey:UserID"`
}

type Password struct {
	gorm.Model
	SiteName    string
	Email       string
	PhoneNumber string
	Password    string
	UserID      uint `gorm:"column:user_id"` // Ensure this matches the SQL column name
}

func connectToPostgreSQL() (*gorm.DB, error) {
	dsn := "postgresql://kumnegerwondimu:Y0SFQawkDP5f@ep-small-morning-a5wckwsq-pooler.us-east-2.aws.neon.tech/kumneger?sslmode=require"

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}
	fmt.Println("connected to postgres database")

	return db, nil
}

func barHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hello, %q", html.EscapeString(r.URL.Path))
}

func homeRoute(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "hellow fog is nice lanugae")
}

func createNewUser(w http.ResponseWriter, r *http.Request) {
	db, err := connectToPostgreSQL()

	if err != nil {
		log.Fatal(err)
	}

	fmt.Fprintf(w, "hellow fog is nice lanugae")
	fmt.Println(db)

}

func getPasswords(w http.ResponseWriter, r *http.Request) {
	db, err := connectToPostgreSQL()

	if err != nil {
		log.Fatal(err)
	}

	fmt.Fprintf(w, "hellow fog is nice lanugae")
	fmt.Println(db)

}

func main() {

	http.HandleFunc("/bar", barHandler)
	http.HandleFunc("/", homeRoute)
	http.HandleFunc("/user/new", createNewUser)
	http.HandleFunc("/passowrds", getPasswords)

	log.Fatal(http.ListenAndServe(":8080", nil))
}

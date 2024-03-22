package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Username       string         `json:"username"  gorm:"uniqueIndex"`
	FirstName      string         `json:"firstname"`
	LastName       string         `json:"lastname"`
	MasterPassword string         `json:"masterPassword"`
	Passwords      []Password     `gorm:"foreignKey:UserID"`
	DeletedAt      gorm.DeletedAt `gorm:"index"`
}

type Password struct {
	gorm.Model
	SiteName    string         `json:"sitename"`
	Url         string         `json:"url"`
	Email       string         `json:"email"`
	PhoneNumber string         `json:"phone number"`
	Password    string         `json:"password"`
	UserID      uint           `gorm:"column:user_id"`
	DeletedAt   gorm.DeletedAt `gorm:"index"`
}

func connectToPostgreSQL() (*gorm.DB, error) {
	// dsn := "postgresql://kumnegerwondimu:Y0SFQawkDP5f@ep-small-morning-a5wckwsq-pooler.us-east-2.aws.neon.tech/kumneger?sslmode=require"

	dsn := "postgresql://postgres:12345678@localhost:5432/postgres"

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	fmt.Println("connected to postgres database")

	err = db.AutoMigrate(&User{}, Password{})

	if err != nil {
		fmt.Println("failed to migrate")
	}

	return db, nil
}

func homeRoute(w http.ResponseWriter, r *http.Request) {
	if r.Method == "GET" {
		fmt.Fprintf(w, "Home route")
	}

}

func getUsers(w http.ResponseWriter, r *http.Request) {
	if r.Method == "GET" {
		db, err := connectToPostgreSQL()
		if err != nil {
			log.Fatal(err)
		}

		var users []User
		result := db.Find(&users)
		if result.Error != nil {
			fmt.Println(result.Error.Error())
		}
		jsonData, err := json.Marshal(users)
		if err != nil {
			http.Error(w, "Error marshalling users to JSON", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")

		w.Write(jsonData)
	}
}

func createNewUser(w http.ResponseWriter, r *http.Request) {
	if r.Method == "POST" {
		db, err := connectToPostgreSQL()
		if err != nil {
			log.Fatal(err)
		}

		var user User
		err = json.NewDecoder(r.Body).Decode(&user)
		if err != nil {
			log.Fatal("ther was an error", err)
		}

		result := db.Create(&user)

		if result.Error != nil {
			if strings.Contains(result.Error.Error(), "duplicate key value violates unique constraint") {
				w.WriteHeader(http.StatusConflict)
				return
			}
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		fmt.Println(result)

		jsonData, err := json.MarshalIndent(user, "", "")

		if err != nil {
			fmt.Println("error occured while calling json marshal")
		}

		fmt.Fprintf(w, string(jsonData))
		fmt.Println("request body", user)
	}
}

func getPasswords(w http.ResponseWriter, r *http.Request) {
	if r.Method == "GET" {

		db, err := connectToPostgreSQL()

		if err != nil {
			log.Fatal(err)
		}

		fmt.Fprintf(w, "get passwords")
		fmt.Println(db)
	}

}
func newPassword(w http.ResponseWriter, r *http.Request) {
	db, err := connectToPostgreSQL()

	if err != nil {
		log.Fatal(err)
	}

	fmt.Fprintf(w, "create new password")
	fmt.Println(db)

}

func main() {
	http.HandleFunc("/", homeRoute)
	http.HandleFunc("/users/new", createNewUser)
	http.HandleFunc("/users", getUsers)
	http.HandleFunc("/passwords", getPasswords)
	http.HandleFunc("/passwords/new", newPassword)

	log.Fatal(http.ListenAndServe(":8080", nil))
}

package users

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"server/utils"
	"strings"
)

func GetUsers(w http.ResponseWriter, r *http.Request) {
	if r.Method == "GET" {

		db := utils.DB

		if db == nil {
			log.Fatal("oops there was ans error")
		}

		var users []utils.User
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

func CreateNewUser(w http.ResponseWriter, r *http.Request) {
	if r.Method == "POST" {
		db := utils.DB

		if db == nil {
			log.Fatal("oops there was ans error")
		}

		var user utils.User
		err := json.NewDecoder(r.Body).Decode(&user)
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

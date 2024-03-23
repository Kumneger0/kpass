package users

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"server/utils"
	"strings"

	"golang.org/x/crypto/bcrypt"
)

type USERTOKEN struct {
	ACCCESTOKEN string
}

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

func SingUp(w http.ResponseWriter, r *http.Request) {
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

		hashedPassword, err := hashPassword(user.MasterPassword)

		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			fmt.Fprint(w, "failed to hash password")
			return
		}

		user.MasterPassword = hashedPassword

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

		w.Write(jsonData)

		fmt.Println("request body", user)
	}
}

func LoginIn(w http.ResponseWriter, r *http.Request) {
	if r.Method == "POST" {
		var body utils.User

		err := json.NewDecoder(r.Body).Decode(&body)
		if err != nil {
			log.Fatal("ther was an error", err)
		}

		user := getUserByEmail(body.Email, w)

		isPasswordMatch := doPasswordsMatch(user.MasterPassword, body.MasterPassword)

		if isPasswordMatch {
			w.WriteHeader(http.StatusAccepted)
			token, err := utils.CreateToken(user.ID)
			if err != nil {
				fmt.Fprint(w, err.Error())
				return
			}

			userToken := USERTOKEN{ACCCESTOKEN: token}

			userTokenJSON, err := json.Marshal(userToken)
			if err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				w.Write(userTokenJSON)
			}

			w.Write(userTokenJSON)

			return
		}
		fmt.Fprint(w, "password not match")
	}
}

func hashPassword(password string) (string, error) {
	var passwordBytes = []byte(password)
	hashedPasswordBytes, err := bcrypt.GenerateFromPassword(passwordBytes, bcrypt.MinCost)
	return string(hashedPasswordBytes), err
}

func doPasswordsMatch(hashedPassword, currentPassword string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(currentPassword))
	return err == nil
}

func getUserByEmail(email string, w http.ResponseWriter) utils.User {
	db := utils.DB

	if db == nil {
		log.Fatal("oops there was ans error")
	}

	var user utils.User
	result := db.Where("Email = ?", email).First(&user)

	if result.Error != nil {
		w.WriteHeader(http.StatusInternalServerError)
	}

	return user
}

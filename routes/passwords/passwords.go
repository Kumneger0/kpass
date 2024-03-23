package passwords

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"server/utils"
	"strconv"
	"strings"
)

func GetPasswords(w http.ResponseWriter, r *http.Request) {
	if r.Method == "GET" {
		db := utils.DB

		if db == nil {
			log.Fatal("oops there was ans error")
		}
		pathSegments := strings.Split(r.URL.Path, "/")
		id := pathSegments[2]

		idInt, err := strconv.Atoi(id)

		if err != nil {
			fmt.Println("falied to conver to nt")
		}

		var user = getUserByid(idInt, w)

		userInJson, err := json.Marshal(user)

		if err != nil {
			fmt.Println("failed to marshl to json")
		}

		w.Write(userInJson)
	}

}
func NewPassword(w http.ResponseWriter, r *http.Request) {
	if r.Method == "POST" {

		db := utils.DB

		if db == nil {
			log.Fatal("oops there was ans error")
		}
		pathSegments := strings.Split(r.URL.Path, "/")

		id := pathSegments[3]

		idInt, err := strconv.Atoi(id)

		if err != nil {
			fmt.Println("falied to conver to nt")
		}

		var user = getUserByid(idInt, w)

		var password utils.Password

		err = json.NewDecoder(r.Body).Decode(&password)
		if err != nil {
			log.Fatal("ther was an error", err)
		}

		if err != nil {
			fmt.Println("failed to marshl")
		}

		user.Passwords = append(user.Passwords, password)

		userInJson, err := json.Marshal(user)

		if err != nil {
			fmt.Println("failed to marshl to json")
		}

		result := db.Save(&user)

		if result.Error != nil {
			fmt.Println(result.Error.Error())
		}

		w.Write(userInJson)

	}
}

func getUserByid(id int, w http.ResponseWriter) utils.User {
	db := utils.DB

	if db == nil {
		log.Fatal("oops there was ans error")
	}

	var user utils.User

	result := db.Model(&utils.User{}).Preload("Passwords").First(&user, id)

	if result.Error != nil {
		w.WriteHeader(http.StatusInternalServerError)
	}

	return user
}

package passwords

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"server/routes/users"
	"server/utils"
)

func GetPasswords(w http.ResponseWriter, r *http.Request) {
	db := utils.DB

	if db == nil {
		w.WriteHeader(http.StatusInternalServerError)
		error := users.ERROR{Message: "internal server error"}
		jsonData, err := json.Marshal(error)
		if err != nil {

			fmt.Println("oops there was ans error")

		}
		w.Write(jsonData)
		return
	}
	token := r.Header.Get("ACCESS_TOKEN")

	userId, err := utils.VerifyToken(token)

	if err != nil {
		error := users.ERROR{Message: err.Error()}
		jsonData, err := json.Marshal(error)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte("there was an error occured"))
			return
		}
		w.Write(jsonData)
		return
	}

	var user = getUserByid(int(userId), w)

	userInJson, err := json.Marshal(user)

	if err != nil {
		error := users.ERROR{Message: err.Error()}
		jsonData, err := json.Marshal(error)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte("there was an error occured"))
			return
		}
		w.Write(jsonData)
		return
	}

	w.Write(userInJson)

}
func NewPassword(w http.ResponseWriter, r *http.Request) {

	db := utils.DB

	if db == nil {
		w.WriteHeader(http.StatusInternalServerError)
		error := users.ERROR{Message: "internal server error"}
		jsonData, err := json.Marshal(error)
		if err != nil {
			fmt.Println("oops there was ans error")
		}
		w.Write(jsonData)
		return
	}

	token := r.Header.Get("ACCESS_TOKEN")

	userId, err := utils.VerifyToken(token)

	if err != nil {
		error := users.ERROR{Message: err.Error()}
		jsonData, err := json.Marshal(error)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte("failed to add you password"))
			return
		}
		w.Write(jsonData)
		return
	}

	var user = getUserByid(int(userId), w)

	var password utils.Password

	if err = json.NewDecoder(r.Body).Decode(&password); err != nil {
		error := users.ERROR{Message: err.Error()}

		jsonData, err := json.Marshal(error)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte("failed to add you password"))
			return
		}
		w.Write(jsonData)
		return
	}

	user.Passwords = append(user.Passwords, password)

	userInJson, err := json.Marshal(user)

	if err != nil {
		error := users.ERROR{Message: err.Error()}
		w.WriteHeader(http.StatusInternalServerError)

		jsonData, err := json.Marshal(error)
		if err != nil {
			w.Write([]byte(err.Error()))
			return
		}
		w.Write(jsonData)
		return
	}

	result := db.Save(&user)

	if result.Error != nil {
		fmt.Println(result.Error.Error())
		error := users.ERROR{Message: result.Error.Error()}

		jsonData, err := json.Marshal(error)
		if err != nil {
			w.Write([]byte(err.Error()))
			return
		}
		w.Write(jsonData)
		return
	}

	w.Write(userInJson)

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

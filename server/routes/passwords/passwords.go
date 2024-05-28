package passwords

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"server/routes/users"
	"server/utils"
	"strconv"
)

func GetPasswords(w http.ResponseWriter, r *http.Request) {
	db := utils.DB

	if db == nil {
		w.WriteHeader(http.StatusInternalServerError)
		error := users.ERROR{Message: "internal server error"}
		jsonData, _ := json.Marshal(error)
		w.Write(jsonData)
		return
	}
	token := r.Header.Get("ACCESS_TOKEN")

	userId, err := utils.VerifyToken(token)

	if err != nil {
		error := users.ERROR{Message: err.Error(), IsError: true}
		jsonData, _ := json.Marshal(error)
		w.WriteHeader(http.StatusInternalServerError)
		w.Write(jsonData)
		return
	}

	var user = getUserByid(int(userId), w)

	userInJson, err := json.Marshal(user)

	if err != nil {
		error := users.ERROR{Message: err.Error()}
		jsonData, _ := json.Marshal(error)
		w.WriteHeader(http.StatusInternalServerError)
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
		jsonData, _ := json.Marshal(error)

		w.Write(jsonData)
		return
	}

	token := r.Header.Get("ACCESS_TOKEN")

	userId, err := utils.VerifyToken(token)

	if err != nil {
		error := users.ERROR{Message: err.Error()}
		jsonData, _ := json.Marshal(error)
		w.WriteHeader(http.StatusInternalServerError)
		w.Write(jsonData)
		return
	}

	var user = getUserByid(int(userId), w)

	var password utils.Password

	if err = json.NewDecoder(r.Body).Decode(&password); err != nil {
		error := users.ERROR{Message: err.Error()}
		jsonData, _ := json.Marshal(error)
		w.WriteHeader(http.StatusInternalServerError)
		w.Write(jsonData)
		return
	}

	user.Passwords = append(user.Passwords, password)

	userInJson, err := json.Marshal(user)

	if err != nil {
		error := users.ERROR{Message: err.Error()}
		w.WriteHeader(http.StatusInternalServerError)
		jsonData, _ := json.Marshal(error)
		w.Write(jsonData)
		return
	}

	result := db.Save(&user)

	if result.Error != nil {
		fmt.Println(result.Error.Error())
		error := users.ERROR{Message: result.Error.Error()}

		jsonData, _ := json.Marshal(error)

		w.Write(jsonData)
		return
	}

	w.Write(userInJson)

}

func UpdatePassword(w http.ResponseWriter, r *http.Request) {
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

	idString := r.PathValue("id")

	fmt.Println("updating password idsring", idString)

	token := r.Header.Get("ACCESS_TOKEN")

	if _, err := utils.VerifyToken(token); err != nil {
		error := users.ERROR{Message: err.Error()}
		jsonData, err := json.Marshal(error)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte("failed to update password"))
			return
		}
		w.Write(jsonData)
		return
	}

	var password utils.Password

	if err := json.NewDecoder(r.Body).Decode(&password); err != nil {
		error := users.ERROR{Message: err.Error()}

		jsonData, err := json.Marshal(error)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			jsonError, _ := json.Marshal(users.ERROR{Message: err.Error()})
			w.Write(jsonError)
			return
		}
		w.Write(jsonData)
		return
	}

	if idInt, err := strconv.Atoi(idString); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		error := users.ERROR{Message: err.Error()}
		jsonData, _ := json.Marshal(error)
		w.Write(jsonData)
	} else {

		previosPassWord := getPasswordById(idInt, w)
		previosPassWord.Email = password.Email
		previosPassWord.PhoneNumber = password.PhoneNumber
		previosPassWord.Password = password.Password
		result := db.Save(&previosPassWord)

		if result.Error != nil {
			error := users.ERROR{Message: result.Error.Error()}
			jsontData, _ := json.Marshal(error)
			w.Write(jsontData)
			return
		}
		jsonData, _ := json.Marshal(password)
		w.WriteHeader(http.StatusAccepted)
		w.Write(jsonData)
	}
}

func DeletePassword(w http.ResponseWriter, r *http.Request) {
	fmt.Println("deleting the password")
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

	if _, err := utils.VerifyToken(token); err != nil {
		error := users.ERROR{Message: err.Error()}
		jsonData, err := json.Marshal(error)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte("failed to update password"))
			return
		}
		w.Write(jsonData)
		return
	}

	idString := r.PathValue("id")
	id, err := strconv.Atoi(idString)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		jsonError, _ := json.Marshal(users.ERROR{Message: err.Error()})
		w.Write(jsonError)
	}
	previosPassWord := getPasswordById(id, w)
	result := db.Delete(&previosPassWord)
	if result.Error != nil {
		jsonEror, _ := json.Marshal(users.ERROR{Message: result.Error.Error()})
		w.WriteHeader(http.StatusInternalServerError)
		w.Write(jsonEror)
		return
	}
	message := make(map[string]string)
	message["message"] = "deleted"

	jsonData, _ := json.Marshal(message)
	w.WriteHeader(http.StatusAccepted)
	w.Write(jsonData)

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

func getPasswordById(id int, w http.ResponseWriter) utils.Password {
	db := utils.DB

	if db == nil {
		log.Fatal("oops there was ans error")
	}

	var password utils.Password
	result := db.Model(&utils.Password{}).First(&password, id)

	if result.Error != nil {
		w.WriteHeader(http.StatusInternalServerError)
	}

	return password

}

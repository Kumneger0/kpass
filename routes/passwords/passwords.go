package passwords

import (
	"fmt"
	"log"
	"net/http"
	"server/utils"
	"strings"
)

func GetPasswords(w http.ResponseWriter, r *http.Request) {
	if r.Method == "GET" {

		db, err := utils.ConnectToDB()

		if err != nil {
			log.Fatal(err)
		}

		fmt.Fprintf(w, "get passwords")
		fmt.Println(db)
	}

}
func NewPassword(w http.ResponseWriter, r *http.Request) {
	db := utils.DB

	if db == nil {
		log.Fatal("oops there was ans error")
	}
	pathSegments := strings.Split(r.URL.Path, "/")

	id := pathSegments[3]
	fmt.Println("User ID: ", id)

	fmt.Fprintf(w, id)
	fmt.Println(db)

}

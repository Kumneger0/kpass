package utils

import (
	"fmt"

	"os"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"github.com/golang-jwt/jwt/v5"
)

type User struct {
	gorm.Model
	Username       string         `json:"username"  gorm:"uniqueIndex"`
	FirstName      string         `json:"firstName"`
	LastName       string         `json:"lastName"`
	Email          string         `json:"email" gorm:"uniqueIndex"`
	MasterPassword string         `json:"masterPassword"`
	Passwords      []Password     `json:"passwords" gorm:"foreignKey:UserID"`
	DeletedAt      gorm.DeletedAt `gorm:"index"`
}

type Password struct {
	gorm.Model
	Username    string         `json:"username" `
	Url         string         `json:"url"`
	Email       string         `json:"email"`
	PhoneNumber string         `json:"phoneNumber"`
	Password    string         `json:"password"`
	UserID      uint           `gorm:"column:user_id"`
	DeletedAt   gorm.DeletedAt `gorm:"index"`
}

func ConnectToDB() (*gorm.DB, error) {

	dsn := "postgresql://postgres:12345678@localhost:5432/postgres"

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	fmt.Println("connected to postgres database")

	if err = db.AutoMigrate(&User{}, Password{}); err != nil {
		fmt.Println("failed to migrate")
	}

	return db, nil
}

var DB, _ = ConnectToDB()

func CreateToken(userID uint) (string, error) {
	secretKey := []byte(os.Getenv("JWT_SECRET"))

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": userID,
		"exp":     time.Now().Add(time.Hour * 24).Unix(),
	})

	tokenString, err := token.SignedString(secretKey)
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

func VerifyToken(tokenString string) (uint, error) {
	secretKey := []byte(os.Getenv("JWT_SECRET"))

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return secretKey, nil
	})

	if err != nil {
		return 0, err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		userID, ok := claims["user_id"].(float64)
		if !ok {
			return 0, fmt.Errorf("claim 'user_id' not found or not a number")
		}
		return uint(userID), nil
	} else {
		return 0, fmt.Errorf("invalid token")
	}
}

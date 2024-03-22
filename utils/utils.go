package utils

import (
	// "fmt"

	"fmt"

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

func ConnectToDB() (*gorm.DB, error) {
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

var DB, _ = ConnectToDB()

package utils

import (
	"fmt"

	"os"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"github.com/golang-jwt/jwt/v5"
	"github.com/joho/godotenv"}
)                           }
                            })
type User struct {          return nil, err
	gorm.Model                }
	Email          string     }, Password{}); err != nil {                                                    `json:"email" gorm:"uniqueIndex"`
	MasterPassword string     }                                                                               `json:"masterPassword"`
	Passwords      []Password return db, nil                                                                  `json:"passwords" gorm:"foreignKey:UserID"`
	DeletedAt      gorm.Delete}}                                                                                                                                                      dAt `gorm:"index"`
}                           }}                                                                           )
                            r})                                                                          eturn "", err
type Password struct {      }return nil, err
	gorm.Model                r}                                                                           eturn tokenString, nil
	Username    string        }}, Password{}); err != nil {                                                                                                                            `json:"username" `
	Url         string        }}                                                                           , error) {                                                                  `json:"url"`
	Email       string        rreturn db, nil                                                              eturn nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"]) `json:"email"`
	PhoneNumber string        }}                                                                                                                                                       `json:"phoneNumber"`
	Password    string        r})                                                                          eturn secretKey, nil                                                        `json:"password"`
	UserID      uint          }return "", err                                                              )                                                                           `gorm:"column:user_id"`
	DeletedAt   gorm.DeletedAtr}                                                                           eturn 0, err                                                                `gorm:"index"`
}                           }return tokenString, nil
                            r}                                                                           eturn 0, fmt.Errorf("claim 'user_id' not found or not a number")
                            }}, error) {
                            rreturn nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])eturn uint(userID), nil
                            }}                                                                            else {
                            rreturn secretKey, nil                                                       eturn 0, fmt.Errorf("invalid token")
func ConnectToDB() (*gorm.DB}})                                                                                                                                                     , error) {
	_ = godotenv.Load()       }return 0, err
	dsn := os.Getenv("PSG_URL")}
                             return 0, fmt.Errorf("claim 'user_id' not found or not a number")
	db, err := gorm.Open(postgr}                                                                           es.Open(dsn), &gorm.Config{})
	if err != nil {            return uint(userID), nil
		return nil, err          } else {
	}                          return 0, fmt.Errorf("invalid token")
                             }
	fmt.Println("connected to p}                                                                           ostgres database")

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

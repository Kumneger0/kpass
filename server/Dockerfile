FROM golang:latest

# Set the Current Working Directory inside the container
WORKDIR /app

COPY .. .

# Make sure the script is executable
RUN chmod +x ./wait-for-it.sh

# Download all dependencies
RUN go mod download

# Build the Go app
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main

# Adjust the CMD to use wait-for-it script
CMD ["sh", "-c", "./wait-for-it.sh db:5432 --timeout=60s &&./main"]




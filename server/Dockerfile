FROM golang:latest

# Set the Current Working Directory inside the container
WORKDIR /app

# Copy your application code
COPY .. .

# Download all dependencies
RUN go mod download

# Build the Go app
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main

CMD ["./main"]





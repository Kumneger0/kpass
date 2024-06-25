FROM golang:latest

# Set the Current Working Directory inside the container
WORKDIR /app

COPY .. .

# Download all dependencies
RUN go mod download

# Build the Go app
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main.

# Run the binary program produced by `go build`
CMD ["./server"]


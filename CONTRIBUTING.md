## Contributing Guide 
This guide outlines how you can contribute to the development of kpass, a self-hosted password manager built with Go and TypeScript

**Project Structure**

The project is organized into distinct directories for client-side (Chrome extension) and server-side (backend) development:
**kpass (Client-Side - Chrome Extension):**

-   This directory contains the code for the Chrome extension, built with Plasmo.
-   Subdirectories might include:
    -   `content`: Scripts that interact with webpages.
    -   `background`: Background scripts for extension-wide logic and server communication.
    -   `popup`: UI code for the extension's popup window.
    -   `options` (Optional): Code for the extension's options page.
    -   `utils`: Utility functions used across the extension

**server (Server-Side - Backend):**

**Project Structure:**

```
server/
├── Dockerfile
├── docker-compose.yaml (Optional)
├── main.go
├── routes/
│   └── ...(files for various routes)
└── utils/
    └── ..._utils.go (files for utility functions)
```

**Explanation:**
-   `server/`: The main directory for your Go backend server.
-   `Dockerfile`:  Contains instructions for building a Docker image containing your Go server application and its dependencies.
-   `docker-compose.yaml`  (If using Docker Compose) Defines the configuration for your application. You can specify how to build the Go server image and potentially manage a database container as well.
-   `main.go`: The entry point for your Go application. It typically handles setting up the server (e.g., defining ports, registering routes, connecting to a database), and starting the server process.
-   `routes/`: A directory containing separate files for different routes 
-   `utils/`: A directory containing utility functions used across your server code.
-   `.env.example` edit this to .env and fill with you database url and jwt secret

If not using Docker  install [air](https://github.com/air-verse/air) and create  `.env` file to store environment variables (database connection details, JWT secrets, etc.).

**Setting Up Your Development Environment**

1.  **Fork and Clone the Repository:**
    
    -   Visit the project repository on GitHub at [https://github.com/](https://github.com/).
    -   Click "Fork" to create your own copy.
    -   Open a terminal and clone your forked repository: 
    ```bash
    git clone https://github.com/<your-username>/<project-name>.git
    ```

 **Install Dependencies:**

-   Navigate to the project directory:

-   For Go dependencies:
```bash
cd server
```

```bash
go mod download
```
   Install client-side dependencies (TypeScript extension):
   
```bash
# Using yarn
pnpm install
```
**Start the Development Environment:**

-   Navigate to the server directory of your project where the `docker-compose.yaml` file resides.    
    ```bash
    docker-compose up --build
    ```
    or 
    ```bash
    air
    ```
**2. Run the Client-Side Development Server (kpass):**
      Navigate to the `kpass` directory using `cd kpass`
```bash
    cd kpass
  ```
  Start the client-side development server using `pnpm dev`

 ```bash
    pnpm dev
   ```
**Enable Developer Mode in Chrome:**

-   Open Google Chrome.
-   Click the three vertical dots in the top-right corner and select "More tools" -> "Extensions". 
-   Alternatively, you can type `chrome://extensions` in the address bar and press Enter.
-   Toggle the switch next to "Developer mode" in the top-right corner to enable it. This allows you to load extensions from outside the Chrome Web Store.

** Load Unpacked Extension:**

-   On the extensions page, locate the "Load unpacked" button (usually in the top-left corner).
-   Click the "Load unpacked" button.
-   Navigate to the directory of your `kpass` project using the file selection dialog.
-   **Important:** Select the build directory of `kpass` This ensures all necessary files and folders are loaded correctly.

**Verify Extension Loading:**
-   Once selected, Chrome will load the extension. You might see a confirmation message or notification.
-   Look for the extension's icon (if defined) in the top-right corner of the Chrome toolbar or in the extensions menu.

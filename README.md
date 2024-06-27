## kpass

Kpass empowers you to manage your passwords securely, eliminating reliance on third-party services. It's built with the following technologies:

- **Backend:** Go
- **Frontend (Chrome Extension):** Typescript and Plasmo

This guide provides a road-map for getting started with kpass, allowing you to:

- Set up your development environment.
- Develop the Chrome extension for managing passwords within your browser.
- Develop the Go back-end server for handling password storage, retrieval, and other core functionalities.

We welcome your contributions to make kpass an even more robust and user-friendly password manager

# Get Started

To get started with the self-hosted kpass password manager, follow these steps:

1. **Set up a PostgreSQL database:** You can either set up your own PostgreSQL database or use a serverless managed PostgreSQL service. One recommended service is [Neon](https://neon.tech/).
2. **Self-host the kpass server:** A Docker image has been created for this purpose, and it is available on Docker Hub. The easiest way to deploy this is by using [Render](https://www.render.com/). Simply create a new web service on Render and choose the option to deploy from Docker Hub. Here is the Docker image URL: `docker.io/kumneger/kpass-server:kpass-server`.
3. **Set environment variables:** You'll need to set two specific variables: `DATABASE_URL` and `JWT_SECRET`. If you set these correctly, your server should deploy successfully. An example of a successfully deployed server can be found at [here](https://kpass-server-kpass-server.onrender.com).

1. **Install the kpass Chrome Extension:**
    - Download the KPass.zip file from this [link](https://github.com/Kumneger0/kpass/releases/download/v0.1.1/KPass.zip).
    - Extract the zip file to a folder.
    - Go to `chrome://extensions/` in your Chrome browser.
    - Enable "Developer mode" at the top right corner.
    - Click on "Load unpacked".
    - Select the folder where you extracted KPass.zip.
    - The kpass extension will now be visible in your Chrome browser.
2. **Set up the kpass Chrome Extension:**
    - Click on the kpass extension to open it.
    - It will prompt you to enter the server URL. Enter the URL of your self-hosted kpass server.
    
    - Create an account and start using kpass.

In case you face any issues, feel free to raise an [issue](https://github.com/Kumneger0/kpass/issues).

**Want to Contribute?**
If you'd like to contribute code, documentation, or other improvements, please refer to our detailed guidelines in the [**CONTRIBUTING.md**](https://www.notion.so/CONTRIBUTING.md) file

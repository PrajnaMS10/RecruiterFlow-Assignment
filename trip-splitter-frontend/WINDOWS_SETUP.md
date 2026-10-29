# Windows and VS Code setup

All source files are already generated. You do not need to create or copy them.

1. Open PowerShell and open this project in VS Code:

   ```powershell
   cd D:\Recruiterflow\Trip-Splitter_Frontend
   code .
   ```

   If `code` is unavailable, open VS Code, choose File → Open Folder and select that directory. Open Terminal → New Terminal; select PowerShell.

2. Check Node.js and npm:

   ```powershell
   node --version
   npm --version
   ```

   Node 22.12 or newer is required. Node 24 LTS is recommended. If your installed version is compatible, skip step 3. This project was generated with Node 24.13.0 and npm 11.21.1.

3. Only if Node is missing or too old, install Node LTS:

   ```powershell
   winget install --id OpenJS.NodeJS.LTS -e
   ```

   If an older installation already exists, use `winget upgrade --id OpenJS.NodeJS.LTS -e` instead. You can also use the Windows LTS installer from https://nodejs.org/. Close and reopen VS Code and PowerShell after installation, then repeat step 2.

4. Install every dependency together:

   ```powershell
   cd D:\Recruiterflow\Trip-Splitter_Frontend
   npm install
   ```

   Successful installation exits without `npm error`. The lockfile records exact versions. If PowerShell blocks npm.ps1 because of execution policy, use `npm.cmd` in place of `npm` for every command; no policy change is needed.

5. Start the development server:

   ```powershell
   npm run dev
   ```

   Vite prints `ready` and a Local URL, usually http://localhost:5173/. Keep this terminal running. Ctrl+click the printed URL or paste it into your browser. Vite may select a different port if 5173 is busy.

6. Try the app: inspect the six sample expenses, filter by category, add expenses using all three split modes, cancel a draft, delete after confirming, and reload to check persistence. Try an unknown path to see the not-found page. Browser data is specific to its origin, including the port.

7. Open a second PowerShell terminal in VS Code and build:

   ```powershell
   npm run build
   ```

   Success prints Vite's build output and creates `dist`. To serve that production build locally:

   ```powershell
   npm run preview
   ```

   Open its printed URL. Stop this server with Ctrl+C.

8. Check strict TypeScript:

   ```powershell
   npm run typecheck
   ```

   Success exits with no TypeScript errors.

9. Check lint:

   ```powershell
   npm run lint
   ```

   Success exits with no lint errors.

10. Run the automated tests:

    ```powershell
    npm run test
    ```

    Success shows all tests passing and exits. Tests use isolated stores and simulated browser storage.

Stop the development server by focusing its terminal and pressing Ctrl+C. No database, backend, credentials or environment variables are required. Review the code and README before creating your GitHub repository and pushing; no commits or repository were created for you.

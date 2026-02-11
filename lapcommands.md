# Office Laptop Setup Commands (Windows)

## Prerequisites
- Python 3.12 installed
- Node.js installed
- Azure OpenAI API key and endpoint

---

## Step 1: Extract ZIP
Extract the ZIP file to a folder (e.g., `C:\Projects\llm_councilmen`)

---

## Step 2: Backend Setup

Open Command Prompt or PowerShell and run:

```cmd
cd C:\Projects\llm_councilmen\backend

# Create virtual environment with Python 3.12
python -m venv .venv

# Activate virtual environment
.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

---

## Step 3: Configure Azure Credentials

Edit the `.env` file in the `backend` folder:

```cmd
notepad .env
```

Update these values with your Azure OpenAI credentials:
```
LLM_BASE_URL=https://YOUR-RESOURCE-NAME.openai.azure.com/
LLM_API_KEY=YOUR-AZURE-API-KEY
```

Save and close notepad.

---

## Step 4: Run Backend

In the same terminal (with venv activated):

```cmd
cd C:\Projects\llm_councilmen\backend
.venv\Scripts\activate
uvicorn app.main:app --reload --port 8001
```

Keep this terminal running.

---

## Step 5: Frontend Setup

Open a NEW Command Prompt/PowerShell window:

```cmd
cd C:\Projects\llm_councilmen\frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

---

## Step 6: Open the App

Open your browser and go to:
```
http://localhost:5173
```

---

## Troubleshooting

### Backend won't start
- Make sure virtual environment is activated (you should see `(.venv)` in the prompt)
- Check if port 8001 is free: `netstat -an | findstr 8001`

### Frontend won't start
- Make sure Node.js is installed: `node --version`
- Try deleting `node_modules` and running `npm install` again

### API errors
- Verify Azure credentials in `backend/.env`
- Check that `gpt-4o` deployment exists in your Azure OpenAI resource

---

## Quick Reference

| Component | URL                   | Command to Start                    |
| --------- | --------------------- | ----------------------------------- |
| Backend   | http://localhost:8001 | `uvicorn app.main:app --reload --port 8001` |
| Frontend  | http://localhost:5173 | `npm run dev`                         |

---

## Model Configuration

All council members and Senator use `gpt-4o` deployment:
- Axis Alpha (temperature: 0.3)
- Axis Beta (temperature: 0.7)
- Axis Gamma (temperature: 0.5)
- Senator Axis (temperature: 0.25)

---

## Future: Switching to gpt-4o-mini for Council Members

When you deploy `gpt-4o-mini` in Azure, follow these steps to use it for council members (cheaper, faster, more response variety):

### Step 1: Deploy gpt-4o-mini in Azure

1. Go to [Azure OpenAI Studio](https://oai.azure.com/)
2. Navigate to **Deployments** > **Create new deployment**
3. Select model: `gpt-4o-mini`
4. Name the deployment: `gpt-4o-mini` (must match exactly)
5. Click Create and wait for deployment

### Step 2: Update Config File

Edit `backend/app/config.py` and change the model for each council member:

```python
# Find these sections and change "gpt-4o" to "gpt-4o-mini":

COUNCIL_MEMBERS = [
    {
        "id": "alpha",
        "name": "Axis Alpha",
        "model": "gpt-4o-mini",  # <-- Change this
        ...
    },
    {
        "id": "beta", 
        "name": "Axis Beta",
        "model": "gpt-4o-mini",  # <-- Change this
        ...
    },
    {
        "id": "gamma",
        "name": "Axis Gamma", 
        "model": "gpt-4o-mini",  # <-- Change this
        ...
    },
]

# Keep Senator as gpt-4o (do NOT change):
SENATOR = {
    "id": "senator",
    "name": "Senator Axis",
    "model": "gpt-4o",  # <-- Keep this as gpt-4o
    ...
}
```

### Step 3: Restart Backend

After saving the config file, restart the backend:

```cmd
# Press Ctrl+C to stop the backend, then:
uvicorn app.main:app --reload --port 8001
```

---

## Known Issues / Future Improvements

### Voting Bias (Low Priority)
Currently, voting is done by a randomly selected council member. For even fairer voting, consider using all 3 council members as voters (requires editing `backend/app/services/voting.py` - change to use all voters instead of `random.choice(voters)`).

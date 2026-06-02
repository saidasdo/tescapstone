# Color Analysis API

Local run:

1) Create a Python environment.
2) Install dependencies:

```
pip install -r requirements.txt
```

3) Start the API:

```
uvicorn main:app --host 0.0.0.0 --port 8000
```

The API will be available at http://localhost:8000.

## Frontend integration

Set the Vite environment variable for the API URL:

```
VITE_COLOR_API_URL=http://localhost:8000
```

For production, deploy this API on a server that supports Python and large ML deps.

import requests
import time

BASE_URL = "http://localhost:8000/api"

print("Waiting for server to start...")
time.sleep(2)

print("\n1. Testing Registration")
res = requests.post(f"{BASE_URL}/auth/register", json={
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
})
# Allow 400 if user exists
print(res.status_code, res.text)

print("\n2. Testing Login")
res = requests.post(f"{BASE_URL}/auth/login", data={
    "username": "test@example.com",
    "password": "password123"
})
print("Login status:", res.status_code)
if res.status_code != 200:
    print("Failed to login!", res.text)
    # fall back to check non-api prefix
    BASE_URL = "http://localhost:8000"
    res = requests.post(f"{BASE_URL}/auth/login", data={
        "username": "test@example.com",
        "password": "password123"
    })
    print("Login status (without /api):", res.status_code)

if res.status_code != 200:
    print("Cannot proceed.")
    exit(1)

token = res.json().get("access_token")
headers = {"Authorization": f"Bearer {token}"}

print("\n3. Creating a Project")
res = requests.post(f"{BASE_URL}/projects/", json={
    "name": "Test Project",
    "type": "Conservation",
    "status": "Active"
}, headers=headers)
print(res.status_code)
project_id = res.json().get("id")

print("\n4. Fetching Projects")
res = requests.get(f"{BASE_URL}/projects/", headers=headers)
print(res.status_code, "Projects retrieved:", len(res.json()))

print("\n5. Creating a Site with GeoJSON")
polygon_geojson = {
    "type": "Polygon",
    "coordinates": [[[0,0], [1,0], [1,1], [0,1], [0,0]]]
}
res = requests.post(f"{BASE_URL}/sites/", json={
    "name": "Test Site",
    "project_id": project_id,
    "type": "Carbon",
    "area": 100,
    "polygon_geojson": polygon_geojson
}, headers=headers)
print(res.status_code, res.text)
site_id = res.json().get("id")

print("\n6. Fetching Sites")
res = requests.get(f"{BASE_URL}/sites/", headers=headers)
print(res.status_code, "Sites retrieved:", len(res.json()))

print("\n7. Fetching Site Analytics")
res = requests.get(f"{BASE_URL}/sites/{site_id}/analytics", headers=headers)
print(res.status_code, "Data keys:", list(res.json().keys()))

print("\nALL TESTS COMPLETED!")

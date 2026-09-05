import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
    exit(1)

supabase: Client = create_client(url, key)

# We already created the users in the previous run. Let's just fetch them or try to create,
# then update the database using the supabase REST API (bypassing psycopg IPv6 issues).

users_to_process = [
    {"email": "admin@gmail.com", "password": "admin@123", "usr_id": "USR-101", "role": "ADMIN"},
    {"email": "doctor@gmail.com", "password": "admin@123", "usr_id": "USR-102", "role": "DOCTOR"},
    {"email": "nurse@gmail.com", "password": "admin@123", "usr_id": "USR-103", "role": "NURSE"},
    {"email": "receptionist@gmail.com", "password": "admin@123", "usr_id": "USR-104", "role": "RECEPTIONIST"},
    {"email": "claim_officer@gmail.com", "password": "admin@123", "usr_id": "USR-105", "role": "CLAIM_OFFICER"}
]

for u in users_to_process:
    try:
        # Check if user already exists (from previous run) or create
        # We can list users using admin api
        existing_users = supabase.auth.admin.list_users()
        target_user = next((x for x in existing_users if x.email == u["email"]), None)
        
        auth_id = None
        if target_user:
            auth_id = target_user.id
            print(f"Found existing {u['email']} with ID: {auth_id}")
            # Ensure password is correct
            supabase.auth.admin.update_user_by_id(auth_id, {"password": u["password"]})
        else:
            new_res = supabase.auth.admin.create_user({
                "email": u["email"],
                "password": u["password"],
                "email_confirm": True
            })
            auth_id = new_res.user.id
            print(f"Created {u['email']} with ID: {auth_id}")
            
        # Update user in DB using Supabase REST API (uses service_role, bypasses RLS)
        update_res = supabase.table("users").update({
            "email": u["email"],
            "auth_user_id": auth_id,
            "full_name": f"Demo {u['role'].capitalize()}"
        }).eq("id", u["usr_id"]).execute()
        
        if update_res.data:
            print(f"Mapped {u['email']} to {u['usr_id']} in Database via REST.")
        else:
            print(f"WARNING: Could not update user {u['usr_id']} via REST!")
            
    except Exception as e:
        print(f"Error processing {u['email']}: {e}")

print("Auth seeding complete.")

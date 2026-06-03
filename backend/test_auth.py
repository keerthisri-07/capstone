import asyncio
from app.db.database import init_db
from app.models.user import User
from jose import jwt

async def test():
    await init_db()
    token = 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0=.eyJlbWFpbCI6InByaXlhQGV4YW1wbGUuY29tIiwibmFtZSI6IlByaXlhIFNoYXJtYSIsInBpY3R1cmUiOiJodHRwczovL3VpLWF2YXRhcnMuY29tL2FwaS8/bmFtZT1Qcml5YStTaGFybWEifQ==.'
    try:
        idinfo = jwt.decode(token, '', options={'verify_signature': False})
        email = idinfo.get("email")
        if not email:
            raise ValueError("No email in token")
        user = await User.find_one(User.email == email)
        if not user:
            base_username = email.split("@")[0].lower()
            username = base_username
            counter = 1
            while await User.find_one(User.username == username):
                username = f"{base_username}{counter}"
                counter += 1
            user = User(
                email=email,
                username=username,
                full_name=idinfo.get("name", username),
                password_hash="fake",
                role="user",
                is_verified=True,
                profile_picture=idinfo.get("picture")
            )
            await user.insert()
            print("User created successfully")
        else:
            print("User found successfully")
    except Exception as e:
        import traceback
        traceback.print_exc()
        print("EXCEPTION:", repr(e))

asyncio.run(test())

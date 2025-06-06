from pymongo import MongoClient
from pymongo.database import Database
from pymongo.collection import Collection

from app.core.config import settings


class MongoDB:
    client: MongoClient = None
    db: Database = None

    def connect_to_mongodb(self):
        """Connect to MongoDB database."""
        self.client = MongoClient(settings.MONGODB_URL)
        self.db = self.client[settings.MONGODB_DB_NAME]
        print(f"Connected to MongoDB: {settings.MONGODB_URL}/{settings.MONGODB_DB_NAME}")
        return self.db

    def close_mongodb_connection(self):
        """Close MongoDB connection."""
        if self.client:
            self.client.close()
            print("MongoDB connection closed")

    def get_collection(self, collection_name: str) -> Collection:
        """Get MongoDB collection by name."""
        return self.db[collection_name]


mongodb = MongoDB()

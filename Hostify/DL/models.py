from django.db import models
from django.contrib.auth.models import AbstractUser
import datetime

# Create your models here
class User(AbstractUser):
    isValid = models.BooleanField(default=False)
    v_code = models.TextField()
    docs_count = models.IntegerField(default=0)
    max_docs_allowed = models.IntegerField(default=5)
    hasPremium = models.BooleanField(default=False)

    def serialize(self):
        return {
            "name": self.username,
            "email": self.email
        }


class Log(models.Model):
    name = models.TextField()
    html = models.TextField()
    css = models.TextField()
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="log_owner")
    users = models.ManyToManyField(User, related_name="log_users")
    date = models.DateTimeField()
    public = models.BooleanField(default=False)
    token = models.TextField()
    char_count = models.IntegerField(default=0)
    max_chars_allowed = models.IntegerField(default=10000)

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "html": self.html,
            "css": self.css,
            "owner": self.owner.username,
            "users": [user.serialize() for user in self.users.all()],
            "date": self.date,
            "public": self.public,
            "max_chars_allowed": self.max_chars_allowed,
            "token": self.token
        }
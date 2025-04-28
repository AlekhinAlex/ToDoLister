from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings


class User(AbstractUser):
    email = models.EmailField(unique=True)
    # Переопределяем поле username, чтобы сделать его необязательным
    username = models.CharField(max_length=150, blank=True)
    # Указываем, что аутентификация идет по email
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []  # Убираем email из REQUIRED_FIELDS
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)# Путь к папке для аватарок
    gold = models.PositiveIntegerField(default=0)
    xp = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'auth_user'
        

class Task(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    is_completed = models.BooleanField(default=False)
    due_date = models.DateTimeField(null=True, blank=True)
    reward_xp = models.PositiveIntegerField(default=10)
    reward_gold = models.PositiveIntegerField(default=5)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Shop(models.Model):
    ITEM_TYPES = [
        ('hair', 'Hair'),
        ('headwear', 'Headwear'),
        ('top', 'Top'),
        ('bootom', 'Bottom'),
        ('boots', 'Boots'),
        ('skin', 'Skin'),
    ]
    type = models.CharField(max_length=20, choices=ITEM_TYPES)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    required_xp = models.PositiveIntegerField(default=0)
    price =  models.PositiveIntegerField(default=0)
    is_purchased = models.BooleanField(blank=False, default=False)
    image_url = models.URLField(blank=True, null=True)

class Inventory(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='inventory')
    item = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='in_inventory')
    is_equipped = models.BooleanField(blank=False, default=False)
    
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

    class Meta:
        db_table = 'auth_user'

class Character(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=50)
    level = models.PositiveIntegerField(default=1)
    gold = models.PositiveIntegerField(default=0)
    xp = models.PositiveIntegerField(default=0)  # Новое поле для опыта
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

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


class Item(models.Model):
    ITEM_TYPES = [
        ('hat', 'Hat'),
        ('pants', 'Pants'),
        ('glasses', 'Glasses'),
        ('sword', 'Sword'),
        ('shirt', 'Shirt'),
        ('boots', 'Boots'),
    ]
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    item_type = models.CharField(max_length=20, choices=ITEM_TYPES)
    price = models.PositiveIntegerField()
    required_level = models.PositiveIntegerField(default=1)
    image_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class UserItem(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='user_items')
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    is_equipped = models.BooleanField(default=False)
    acquired_at = models.DateTimeField(auto_now_add=True)


class Skin(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    required_level = models.PositiveIntegerField(default=1)
    image_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class UnlockedSkin(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='unlocked_skins')
    skin = models.ForeignKey(Skin, on_delete=models.CASCADE)
    unlocked_at = models.DateTimeField(auto_now_add=True)


class CharacterAppearance(models.Model):
    character = models.OneToOneField(Character, on_delete=models.CASCADE)
    hat = models.ForeignKey(Item, on_delete=models.SET_NULL, null=True, blank=True, related_name='equipped_hat')
    pants = models.ForeignKey(Item, on_delete=models.SET_NULL, null=True, blank=True, related_name='equipped_pants')
    glasses = models.ForeignKey(Item, on_delete=models.SET_NULL, null=True, blank=True, related_name='equipped_glasses')
    sword = models.ForeignKey(Item, on_delete=models.SET_NULL, null=True, blank=True, related_name='equipped_sword')
    shirt = models.ForeignKey(Item, on_delete=models.SET_NULL, null=True, blank=True, related_name='equipped_shirt')
    boots = models.ForeignKey(Item, on_delete=models.SET_NULL, null=True, blank=True, related_name='equipped_boots')
    updated_at = models.DateTimeField(auto_now=True)
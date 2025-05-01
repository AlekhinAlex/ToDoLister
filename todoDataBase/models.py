from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.db.models import Q

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
        ('hair', 'Hair/Headwear'),  # Объединяем hair и headwear в одну группу
        ('top', 'Top'),
        ('bottom', 'Bottom'),
        ('boots', 'Boots'),
    ]
    type = models.CharField(max_length=20, choices=ITEM_TYPES)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    required_xp = models.PositiveIntegerField(default=0)
    price = models.PositiveIntegerField(default=0)
    image_preview_url = models.URLField(blank=True, null=True)  # картинка для магазина
    image_character_url = models.URLField(blank=True, null=True)  # картинка для персонажа
    is_default = models.BooleanField(default=False)


class Inventory(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='inventory')
    item = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='in_inventory')
    is_equipped = models.BooleanField(blank=False, default=False)
    is_unlocked = models.BooleanField(default=False)
    is_purchased = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if self.is_equipped:
            item_type = self.item.type

            # Для hair/headwear обрабатываем как одну группу
            if item_type in ['hair', 'headwear']:
                Inventory.objects.filter(
                    user=self.user,
                    is_equipped=True
                ).exclude(id=self.id).filter(
                    models.Q(item__type='hair') | models.Q(item__type='headwear')
                ).update(is_equipped=False)
            else:
                # Для других типов (top, bottom, boots) снимаем предметы того же типа
                Inventory.objects.filter(
                    user=self.user,
                    is_equipped=True,
                    item__type=item_type
                ).exclude(id=self.id).update(is_equipped=False)

        super().save(*args, **kwargs)
    
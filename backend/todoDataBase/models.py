from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.models import BaseUserManager
from django.conf import settings
from django.db.models import Q

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, password, **extra_fields)

class User(AbstractUser):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, blank=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    avatar = models.ImageField(upload_to="avatars/", null=True, blank=True)
    gold = models.PositiveIntegerField(default=0)
    xp = models.PositiveIntegerField(default=0)

    objects = CustomUserManager()

    class Meta:
        db_table = "auth_user"

    def change_password(self, current_password, new_password):
        """
        Изменение пароля с проверкой текущего
        """
        if not self.check_password(current_password):
            raise ValidationError("Текущий пароль неверен")
        
        if len(new_password) < 6:
            raise ValidationError("Пароль должен содержать минимум 6 символов")
        
        self.set_password(new_password)
        self.save()

    def update_profile(self, name=None, email=None):
        """
        Обновление профиля пользователя
        """
        if name is not None:
            self.username   = name
            # или self.username = name, в зависимости от вашей логики
            
        if email is not None:
            if User.objects.filter(email=email).exclude(id=self.id).exists():
                raise ValidationError("Email уже используется другим пользователем")
            self.email = email
            
        self.save()

    @property
    def current_rank(self):
        from .models import Rank  # Avoid circular import
        return Rank.objects.filter(required_xp__lte=self.xp).order_by('-required_xp').first()
    

class Task(models.Model):
    DIFFICULTY_CHOICES = [
        (1, 'Very Easy'),
        (2, 'Easy'),
        (3, 'Medium'),
        (4, 'Hard'),
        (5, 'Very Hard'),
    ]
    
    TYPE_CHOICES = [
        (1, 'Daily'),
        (2, 'Weekly'),
        (3, 'Permanent'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    is_completed = models.BooleanField(default=False)
    due_date = models.DateTimeField(null=True, blank=True)
    difficulty = models.PositiveSmallIntegerField(choices=DIFFICULTY_CHOICES, default=3)  # Default to Medium
    type = models.PositiveSmallIntegerField(choices=TYPE_CHOICES, default=3)
    base_reward_xp = models.PositiveIntegerField(default=5)  # Base XP for medium difficulty
    base_reward_gold = models.PositiveIntegerField(default=10)  # Base gold for medium difficulty
    reward_xp = models.PositiveIntegerField(editable=False)  # Calculated field
    reward_gold = models.PositiveIntegerField(editable=False)  # Calculated field
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # Calculate rewards based on difficulty before saving
        difficulty_multiplier = {
            1: 0.5,  # Very Easy - 50% of base
            2: 0.75,  # Easy - 75% of base
            3: 1.0,  # Medium - 100% of base
            4: 1.5,  # Hard - 150% of base
            5: 2.0  # Very Hard - 200% of base
        }

        self.reward_xp = int(self.base_reward_xp * difficulty_multiplier[self.difficulty])
        self.reward_gold = int(self.base_reward_gold * difficulty_multiplier[self.difficulty])
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        # Handle deletion of the task
        super().delete(*args, **kwargs)

    @property
    def collaboration_status_display(self):
        return self.get_collaboration_status_display()
    
    def get_collaborators(self):
        return self.collaborators.filter(accepted=True)
    
        collaboration_type = models.PositiveSmallIntegerField(
        choices=[(1, 'Любой может завершить'), (2, 'Все должны завершить')],
        default=1
    )
    collaboration_status = models.PositiveSmallIntegerField(
        choices=[(1, 'Ожидание'), (2, 'Принято'), (3, 'Отклонено')],
        default=1
    )

        

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
    required_rank = models.ForeignKey(
        'Rank', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        help_text="Минимальный ранг для разблокировки предмета"
    )
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

class Rank(models.Model):
    name = models.CharField(max_length=100)
    required_xp = models.PositiveIntegerField()
    image = models.ImageField(upload_to='ranks/', null=True, blank=True)
    class Meta:
        ordering = ['required_xp']

    def __str__(self):
        return self.name

#! FRIENDS SECTION ========
class FriendRequest(models.Model):
    from_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sent_friend_requests"
    )
    to_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="received_friend_requests"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    accepted = models.BooleanField(default=False)

    class Meta:
        unique_together = ("from_user", "to_user")

    def __str__(self):
        return f"{self.from_user.email} -> {self.to_user.email} ({'accepted' if self.accepted else 'pending'})"


class Friendship(models.Model):
    user1 = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="friendship_user1"
    )
    user2 = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="friendship_user2"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user1", "user2")

    def __str__(self):
        return f"Friendship: {self.user1.email} - {self.user2.email}"

    @staticmethod
    def befriend(user1, user2):
        # гарантируем, что user1.id < user2.id (чтобы не дублировать пары)
        if user1.id > user2.id:
            user1, user2 = user2, user1
        return Friendship.objects.get_or_create(user1=user1, user2=user2)
    
    @classmethod
    def are_friends(cls, user1, user2):
        return cls.objects.filter(
            (Q(user1=user1, user2=user2) | Q(user1=user2, user2=user1))
        ).exists()
    
class TaskCollaborator(models.Model):
    task = models.ForeignKey("Task", on_delete=models.CASCADE, related_name="collaborators")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    invited_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="invited_collaborators")
    accepted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("task", "user")

    def __str__(self):
        return f"{self.user.email} on {self.task.id} ({'accepted' if self.accepted else 'pending'})"

    
#!  END FRIENDS SECTION ========
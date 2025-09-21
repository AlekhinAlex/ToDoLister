from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, FriendRequest, Friendship, TaskCollaborator
from .models import Task, Shop, Inventory, Rank
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate
from django.db.models import Q
User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)
    username = None

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        print(f"🔥 Попытка входа: email={email}")

        user = authenticate(
            request=self.context.get('request'),
            email=email,
            password=password
        )

        print(f"✅ Пользователь найден: {user}")

        if not user:
            raise serializers.ValidationError('Неверный email или пароль')

        # Добавляем эту часть для возврата токенов
        refresh = self.get_token(user)
        data = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'email': user.email,
                'id': user.id
            }
        }
        return data  # Возвращаем данные с токенами

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Добавляем пользовательские поля в токен
        token['email'] = user.email
        return token

class UserSerializer(serializers.ModelSerializer): 
    friendship_status = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = '__all__'

    def get_rank(self, obj):
        return obj.current_rank.name if obj.current_rank else None
    
    def get_friendship_status(self, obj):
        request = self.context.get('request')
        if not request:
            print("No request in context!!!") 
            return 'unknown'
        
        print(f"Checking friendship between {request.user.email} and {obj.email}")  # ← Отладочная информация
        
        # Проверяем, является ли пользователь другом
        if Friendship.objects.filter(
            Q(user1=request.user, user2=obj) | Q(user1=obj, user2=request.user)
        ).exists():
            print("Status: friend")  # ← Отладочная информация
            return 'friend'
        
        # Проверяем, есть ли исходящий запрос
        if FriendRequest.objects.filter(from_user=request.user, to_user=obj).exists():
            print("Status: request_sent")  # ← Отладочная информация
            return 'request_sent'
        
        # Проверяем, есть ли входящий запрос
        if FriendRequest.objects.filter(from_user=obj, to_user=request.user).exists():
            print("Status: request_received")  # ← Отладочная информация
            return 'request_received'
        
        print("Status: can_add")  # ← Отладочная информация
        return 'can_add'


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        refresh = RefreshToken.for_user(user)

        # Дать дефолтные предметы
        self.give_default_items(user)

        return {
            'user': user,
            'access': str(refresh.access_token),
            'refresh': str(refresh)
        }

    def give_default_items(self, user):
        default_items = Shop.objects.filter(is_default=True)  # Filter by is_default instead
        for item in default_items:
            Inventory.objects.create(
                user=user,
                item=item,
                is_equipped=True,
                is_unlocked=True,
                is_purchased=True
            )


class RankSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rank
        fields = ['id', 'name', 'required_xp', 'image']
class ItemSerializer(serializers.ModelSerializer):
    required_rank = RankSerializer(read_only=True)
    
    class Meta:
        model = Shop
        fields = [
            'id', 
            'name', 
            'description', 
            'price', 
            'type', 
            'required_rank', 
            'image_preview_url',
            'is_default'
        ]


        

class EquippedItemsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shop
        fields = ['id', 'type', 'name', 'image_url']

class InventorySerializer(serializers.ModelSerializer):
    item = ItemSerializer()

    class Meta:
        model = Inventory
        fields = ['id', 'item', 'is_equipped', 'is_unlocked', 'is_purchased']
        depth = 1  # Добавьте это для включения связанных объектов


class CharacterSerializer(serializers.ModelSerializer):
    equipped_items = serializers.SerializerMethodField()
    inventory = InventorySerializer(many=True, source='inventory.all')
    rank = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'avatar', 'xp', 'gold', 'rank', 'equipped_items', 'inventory']

    def get_equipped_items(self, obj):
        equipped = obj.inventory.filter(is_equipped=True)
        return InventorySerializer(equipped, many=True).data
    
    def get_rank(self, obj):
        rank = obj.current_rank
        request = self.context.get('request')
        
        if rank:
            return {
                'id': rank.id,
                'name': rank.name,
                'required_xp': rank.required_xp,
                'image': request.build_absolute_uri(rank.image.url) if rank.image and request else None
            }
        return None


        

class UserItemSerializer(serializers.ModelSerializer):
    item = ItemSerializer()

    class Meta:
        model = Inventory
        fields = ['id', 'user', 'item', 'is_equipped']
class TaskSerializer(serializers.ModelSerializer):
    collaborators = serializers.SerializerMethodField()
    collaboration_status_display = serializers.CharField(source='get_collaboration_status_display', read_only=True)
    collaboration_type_display = serializers.CharField(source='get_collaboration_type_display', read_only=True)
    owner = UserSerializer(read_only=True, source='user') 
    
    class Meta:
        model = Task
        fields = '__all__'
        read_only_fields = ('user',)
    
    def get_collaborators(self, obj):
        collaborators = obj.collaborators.filter(accepted=True)
        return TaskCollaboratorSerializer(collaborators, many=True).data

#! FRIENDS SECTION ===========

class FriendRequestSerializer(serializers.ModelSerializer):
    from_user = UserSerializer(read_only=True)
    to_user = UserSerializer(read_only=True)

    class Meta:
        model = FriendRequest
        fields = ["id", "from_user", "to_user", "created_at", "accepted"]


class FriendshipSerializer(serializers.ModelSerializer):
    friend = serializers.SerializerMethodField()
    completed_tasks = serializers.SerializerMethodField()
    rank = serializers.SerializerMethodField()

    class Meta:
        model = Friendship
        fields = ["id", "friend", "completed_tasks", "rank", "created_at"]

    def get_friend(self, obj):
        request_user = self.context["request"].user
        friend = obj.user2 if obj.user1 == request_user else obj.user1
        return {
            'id': friend.id,
            'username': friend.username,
            'email': friend.email,
            'avatar': friend.avatar.url if friend.avatar else None,
        }

    def get_completed_tasks(self, obj):
        from .models import Task
        request_user = self.context["request"].user
        friend = obj.user2 if obj.user1 == request_user else obj.user1
        return Task.objects.filter(user=friend, is_completed=True).count()

    def get_rank(self, obj):
        request_user = self.context["request"].user
        friend = obj.user2 if obj.user1 == request_user else obj.user1
        if friend.current_rank:
            return {
                'id': friend.current_rank.id,
                'name': friend.current_rank.name,
            }
        return None


class TaskCollaboratorSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    invited_by = UserSerializer(read_only=True)

    class Meta:
        model = TaskCollaborator
        fields = ["id", "task", "user", "invited_by", "accepted", "created_at"]

#! FRIENDS SECTION ========
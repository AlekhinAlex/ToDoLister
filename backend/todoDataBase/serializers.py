from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Task, Shop, Inventory, Rank
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate

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
    class Meta:
        model = User
        fields = '__all__'

    def get_rank(self, obj):
        return obj.current_rank.name if obj.current_rank else None


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
    class Meta:
        model = Task
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at', 'updated_at', 'reward_xp', 'reward_gold']

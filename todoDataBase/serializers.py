from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Task, Shop, Inventory
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


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        refresh = RefreshToken.for_user(user)
        return {
            'user': user,
            'access': str(refresh.access_token),
            'refresh': str(refresh)
        }


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shop
        fields = '__all__'
        

class EquippedItemsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shop
        fields = ['id', 'type', 'name', 'image_url']
        
        
class CharacterSerializer(serializers.ModelSerializer):
    equipped_items = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'avatar', 'xp', 'gold', 'equipped_items']
        
    def get_equipped_items(self, user):
        current_equipped = Inventory.objects.filter(user=user, is_equipped=True).select_related('item')
        return EquippedItemsSerializer([inv.item for inv in current_equipped], many=True).data

        
class UserItemSerializer(serializers.ModelSerializer):
    item = ItemSerializer()

    class Meta:
        model = Inventory
        fields = ['id', 'user', 'item', 'is_equipped']
        

class InventorySerializer(serializers.ModelSerializer):
    similar_items = serializers.SerializerMethodField()

    class Meta:
        model = Inventory
        fields = ['id', 'user', 'item', 'is_equipped', 'similar_items']

    def get_similar_items(self, obj):
        item_type = obj.item.type
        user = obj.user
        similar_items = Inventory.objects.filter(user=user, item__type=item_type)
        return UserItemSerializer(similar_items, many=True).data
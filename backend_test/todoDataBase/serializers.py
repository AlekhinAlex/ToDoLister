from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Character, Task, Item, UserItem, Skin, UnlockedSkin, CharacterAppearance
from rest_framework import serializers
from todoDataBase.models import User
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
        fields = [ 'username', 'email', 'avatar']




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



class CharacterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Character
        fields = ['id', 'name', 'level', 'xp', 'gold']


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'updated_at']


class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = '__all__'


class UserItemSerializer(serializers.ModelSerializer):
    item = ItemSerializer()

    class Meta:
        model = UserItem
        fields = ['id', 'item', 'is_equipped', 'acquired_at']


class SkinSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skin
        fields = '__all__'


class UnlockedSkinSerializer(serializers.ModelSerializer):
    skin = SkinSerializer()

    class Meta:
        model = UnlockedSkin
        fields = ['id', 'skin', 'unlocked_at']


class CharacterAppearanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = CharacterAppearance
        fields = '__all__'
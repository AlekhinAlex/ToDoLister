from rest_framework import status
from .models import Character, Task, Item, UserItem, Skin, UnlockedSkin, CharacterAppearance
from .serializers import (
    UserSerializer, RegisterSerializer, CharacterSerializer, TaskSerializer,
    ItemSerializer, UserItemSerializer, SkinSerializer, UnlockedSkinSerializer,
    CharacterAppearanceSerializer
)
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from .models import User
from .serializers import UserSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer
from rest_framework import status
from rest_framework.response import Response


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            return Response(
                {'detail': 'Неверные учетные данные', 'error': str(e)},
                status=status.HTTP_401_UNAUTHORIZED
            )

        return Response(serializer.validated_data, status=status.HTTP_200_OK)



class RegisterViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]

    def create(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.save()

            # Создаем персонажа после успешной регистрации
            user = data['user']
            Character.objects.create(user=user)

            return Response({
                'access': data['access'],
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class CharacterViewSet(viewsets.ModelViewSet):
    queryset = Character.objects.all()
    serializer_class = CharacterSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Character.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=["get"], url_path="me")
    def get_my_character(self, request):
        try:
            character = Character.objects.get(user=request.user)
            serializer = self.get_serializer(character)
            return Response(serializer.data)
        except Character.DoesNotExist:
            return Response({"detail": "Character not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            # Временно добавим вывод ошибки в консоль
            print("🔥 Ошибка в get_my_character:", e)
            return Response({"detail": "Internal Server Error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=["put"], url_path="update")
    def update_character(self, request):
        """
        Обновление информации о персонаже, например, XP и Gold.
        """
        try:
            character = Character.objects.get(user=request.user)
            # Обновляем XP и Gold
            xp = request.data.get("xp", character.xp)
            gold = request.data.get("gold", character.gold)

            character.xp = xp
            character.gold = gold
            character.save()

            serializer = self.get_serializer(character)
            return Response(serializer.data)
        except Character.DoesNotExist:
            return Response({"detail": "Character not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print("🔥 Ошибка в update_character:", e)
            return Response({"detail": "Internal Server Error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()  # Add this if missing
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        task = self.get_object()
        if not task.is_completed:
            task.is_completed = True
            task.save()
            character = Character.objects.get(user=request.user)
            character.xp += task.reward_xp
            character.gold += task.reward_gold
            character.save()

            return Response({
                'status': 'Task completed.',
                'reward_xp': task.reward_xp,
                'reward_gold': task.reward_gold,
                'character': CharacterSerializer(character).data,
            })
        else:
            return Response({'status': 'Task already completed.'}, status=400)


class ItemViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['post'])
    def buy(self, request, pk=None):
        item = self.get_object()
        user = request.user
        character = Character.objects.get(user=user)

        # already owns it?
        if UserItem.objects.filter(user=user, item=item).exists():
            return Response({'detail': 'Item already owned.'}, status=400)

        # has enough gold?
        if character.gold < item.price:
            return Response({'detail': 'Not enough gold.'}, status=400)

        # process purchase
        character.gold -= item.price
        character.save()

        UserItem.objects.create(user=user, item=item)
        return Response({'detail': f'You bought {item.name}!'}, status=200)

class UserItemViewSet(viewsets.ModelViewSet):
    queryset = UserItem.objects.all()  # Add this line
    serializer_class = UserItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserItem.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class SkinViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Skin.objects.all()
    serializer_class = SkinSerializer
    permission_classes = [permissions.IsAuthenticated]

class UnlockedSkinViewSet(viewsets.ModelViewSet):
    queryset = UnlockedSkin.objects.all()
    serializer_class = UnlockedSkinSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UnlockedSkin.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class CharacterAppearanceViewSet(viewsets.ModelViewSet):
    queryset = CharacterAppearance.objects.all()  # Add this if missing
    serializer_class = CharacterAppearanceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CharacterAppearance.objects.filter(character__user=self.request.user)


# Add TokenObtainPairView and TokenRefreshView for login functionality
class LoginViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['post'])
    def login(self, request):
        """
        Login and return a JWT token.
        """
        view = TokenObtainPairView.as_view()
        return view(request._request)

from rest_framework import serializers

class UpdateEmailSerializer(serializers.Serializer):
    email = serializers.EmailField()

class UserViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'], url_path='me')
    def me(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)  # This should include email from UserSerializer

    @action(
        detail=False,
        methods=['post'],
        permission_classes=[IsAuthenticated],
        parser_classes=[MultiPartParser, FormParser]
    )
    def upload_avatar(self, request):
        user = request.user
        avatar = request.FILES.get('avatar')

        if avatar:
            user.avatar = avatar
            user.save()
            return Response({
                "detail": "Avatar updated successfully!",
                "avatar_url": request.build_absolute_uri(user.avatar.url)
            })

        return Response({"error": "No avatar provided"}, status=400)


class LogoutViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['post'])
    def logout(self, request):
        refresh_token = request.data.get('refresh_token')
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()  # This invalidates the refresh token
                return Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"error": "Refresh token required"}, status=status.HTTP_400_BAD_REQUEST)
